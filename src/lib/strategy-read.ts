import type { Perna } from "./payoff";
import { summary } from "./payoff";

export type NivelRisco = "baixo" | "medio" | "alto";

export type LeituraEstrategia = {
  nome: string;
  perfil: string;
  lucroLimitado: boolean;
  perdaLimitada: boolean;
  risco: NivelRisco;
  capitalEmRisco: number;
  lucroMax: number;
  breakevens: number[];
  pontoCritico: string;
  acompanhar: string[];
  narrativa: string[];
  analogia: string;
  licaoSlug?: string;
};

function fmt(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function detect(pernas: Perna[]): { nome: string; perfil: string; analogia: string; licaoSlug?: string } {
  const calls = pernas.filter((p) => p.tipo === "call");
  const puts = pernas.filter((p) => p.tipo === "put");
  const compras = pernas.filter((p) => p.acao === "compra");
  const vendas = pernas.filter((p) => p.acao === "venda");

  if (pernas.length === 1) {
    const p = pernas[0];
    if (p.tipo === "call" && p.acao === "compra")
      return {
        nome: "Compra de call a seco",
        perfil: "Fortemente otimista",
        analogia:
          "É como pagar uma reserva para comprar um imóvel por um preço travado. Se o preço subir muito, você lucra. Se não subir, você perde só a reserva.",
        licaoSlug: "compra-a-seco",
      };
    if (p.tipo === "put" && p.acao === "compra")
      return {
        nome: "Compra de put a seco",
        perfil: "Fortemente pessimista / proteção",
        analogia:
          "É como contratar um seguro: você paga um prêmio e fica protegido caso o preço despenque.",
      };
    return {
      nome: p.tipo === "call" ? "Venda de call descoberta" : "Venda de put",
      perfil: p.tipo === "call" ? "Neutro a baixista (risco ilimitado)" : "Neutro a altista",
      analogia:
        "Você está vendendo o seguro para outra pessoa: recebe o prêmio hoje, mas assume a obrigação depois.",
    };
  }

  if (pernas.length === 2 && calls.length === 2 && compras.length === 1 && vendas.length === 1) {
    const altista = compras[0].strike < vendas[0].strike;
    return altista
      ? {
          nome: "Trava de alta (bull call spread)",
          perfil: "Moderadamente otimista",
          analogia:
            "Imagine comprar um ingresso VIP e revender outro ingresso mais caro: você abre mão do lucro extremo em troca de pagar bem menos pela entrada.",
          licaoSlug: "trava-de-alta",
        }
      : {
          nome: "Trava de baixa com calls",
          perfil: "Moderadamente pessimista",
          analogia: "Você recebe hoje para assumir um risco limitado caso o ativo suba.",
        };
  }

  if (pernas.length === 2 && puts.length === 2 && compras.length === 1 && vendas.length === 1) {
    const baixista = compras[0].strike > vendas[0].strike;
    return baixista
      ? {
          nome: "Trava de baixa (bear put spread)",
          perfil: "Moderadamente pessimista",
          analogia:
            "É um seguro parcial: você compra proteção e vende um pedaço dela para baratear o custo.",
          licaoSlug: "trava-de-baixa",
        }
      : {
          nome: "Trava de alta com puts",
          perfil: "Moderadamente otimista",
          analogia: "Você recebe o prêmio hoje apostando que o ativo não cai abaixo de um nível.",
        };
  }

  if (pernas.length === 4 && calls.length === 2 && puts.length === 2)
    return {
      nome: "Iron condor",
      perfil: "Neutro — aposta em lateralização",
      analogia:
        "Você desenha um corredor e ganha se o preço ficar dentro dele até o vencimento. Sair do corredor custa caro (mas com perda limitada).",
    };

  return {
    nome: "Estrutura personalizada",
    perfil: "Depende da combinação das pernas",
    analogia:
      "Combinação livre de pernas: leia o gráfico de payoff para entender onde você ganha e onde perde.",
  };
}

export function lerEstrategia(pernas: Perna[], centro: number, ativo: string): LeituraEstrategia {
  const s = summary(pernas, centro);
  const base = detect(pernas);

  const lucroLimitado = Number.isFinite(s.lucroMax) && s.lucroMax < 1e6;
  const vendaDescoberta =
    pernas.filter((p) => p.acao === "venda").length >
    pernas.filter((p) => p.acao === "compra").length;
  const perdaLimitada = !vendaDescoberta;
  const capitalEmRisco = Math.abs(Math.min(0, s.perdaMax));

  let risco: NivelRisco = "baixo";
  if (!perdaLimitada) risco = "alto";
  else if (s.lucroMax > 0 && capitalEmRisco > s.lucroMax * 2) risco = "medio";
  else if (capitalEmRisco > centro * 100 * 0.05) risco = "medio";

  const be = s.breakevens;
  const pontoCritico = be.length
    ? `${ativo} ${be.length > 1 ? `fora da faixa ${be[0].toFixed(2)}–${be[be.length - 1].toFixed(2)}` : `abaixo de ${be[0].toFixed(2)}`} no vencimento`
    : "sem ponto de equilíbrio dentro da faixa simulada";

  const narrativa: string[] = [];
  narrativa.push(
    `Você está montando uma ${base.nome.toLowerCase()} em ${ativo}, com preço atual de ${fmt(centro)}. A leitura é: ${base.perfil.toLowerCase()}.`,
  );
  if (be.length)
    narrativa.push(
      `Você só começa a ganhar quando ${ativo} passa de ${fmt(be[0])} no vencimento — abaixo disso o resultado é negativo.`,
    );
  narrativa.push(
    lucroLimitado
      ? `Mesmo que ${ativo} dispare, seu lucro fica limitado em ${fmt(s.lucroMax)}.`
      : `O lucro é teoricamente ilimitado se ${ativo} continuar subindo.`,
  );
  narrativa.push(
    perdaLimitada
      ? `Mesmo que ${ativo} caia muito, sua perda não ultrapassa ${fmt(capitalEmRisco)} — e você conhece esse número antes de entrar.`
      : `Atenção: há venda descoberta nesta estrutura. A perda pode ser muito maior que o prêmio recebido.`,
  );

  const acompanhar = [
    "Aproximação do vencimento (o tempo corrói o valor extrínseco)",
    "Volatilidade implícita das pernas",
    pernas.some((p) => p.acao === "venda")
      ? "Rompimento do strike vendido"
      : "Distância do preço até o strike comprado",
    "Liquidez das séries antes de tentar encerrar",
  ];

  return {
    ...base,
    lucroLimitado,
    perdaLimitada,
    risco,
    capitalEmRisco,
    lucroMax: s.lucroMax,
    breakevens: be,
    pontoCritico,
    acompanhar,
    narrativa,
  };
}

export type RegraSimples = {
  id: string;
  texto: string;
  nome?: string | null;
  ativa: boolean;
  tipo?: string | null;
};

/** Conflitos heurísticos entre a estrutura simulada e as regras ativas do usuário. */
export function checarRegras(pernas: Perna[], regras: RegraSimples[], leitura: LeituraEstrategia) {
  const alertas: { regra: string; motivo: string }[] = [];
  const soCall = pernas.length === 1 && pernas[0].tipo === "call" && pernas[0].acao === "compra";

  for (const r of regras.filter((x) => x.ativa)) {
    const t = `${r.nome ?? ""} ${r.texto}`.toLowerCase();
    if (soCall && t.includes("call") && (t.includes("trava") || t.includes("sozinha") || t.includes("seco")))
      alertas.push({
        regra: r.texto,
        motivo: "Você está simulando uma call sozinha, sem trava.",
      });
    if (!leitura.perdaLimitada && (t.includes("risco limitado") || t.includes("100% limitado") || t.includes("descoberta")))
      alertas.push({
        regra: r.texto,
        motivo: "Esta estrutura tem perna vendida descoberta — risco não limitado.",
      });
    if (t.includes("rsi") && soCall)
      alertas.push({
        regra: r.texto,
        motivo: "Confirme o RSI antes de comprar call: sua regra condiciona a entrada a esse indicador.",
      });
  }
  return alertas.filter(
    (a, i, arr) => arr.findIndex((b) => b.regra === a.regra && b.motivo === a.motivo) === i,
  );
}
