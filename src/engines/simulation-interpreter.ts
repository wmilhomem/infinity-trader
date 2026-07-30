import type { Perna } from "@/lib/payoff";
import { summary } from "@/lib/payoff";

export type Complexidade = "iniciante" | "intermediario" | "avancado";
export type Objetivo = "renda" | "protecao" | "alta" | "baixa" | "lateralizacao" | "indefinido";

export type Interpretacao = {
  nome: string;
  perfil: string;
  objetivo: Objetivo;
  objetivoLabel: string;
  complexidade: Complexidade;
  lucroLimitado: boolean;
  perdaLimitada: boolean;
  lucroMax: number;
  perdaMax: number;
  capitalEmRisco: number;
  capitalComprometido: number;
  breakevens: number[];
  risco: "baixo" | "medio" | "alto";
  resumo: string;
  analogia: string;
  acompanhar: string[];
  licaoSlug?: string;
};

const OBJ_LABEL: Record<Objetivo, string> = {
  renda: "Gerar renda",
  protecao: "Proteção",
  alta: "Ganhar com alta",
  baixa: "Ganhar com queda",
  lateralizacao: "Ganhar com lateralização",
  indefinido: "Depende da combinação das pernas",
};

type Base = {
  nome: string;
  perfil: string;
  objetivo: Objetivo;
  complexidade: Complexidade;
  analogia: string;
  licaoSlug?: string;
};

export function detectarEstrategia(pernas: Perna[]): Base {
  const calls = pernas.filter((p) => p.tipo === "call");
  const puts = pernas.filter((p) => p.tipo === "put");
  const compras = pernas.filter((p) => p.acao === "compra");
  const vendas = pernas.filter((p) => p.acao === "venda");

  if (pernas.length === 1) {
    const p = pernas[0];
    if (p.tipo === "call" && p.acao === "compra")
      return {
        nome: "Compra de call (Long Call)",
        perfil: "Especulativa — compra de volatilidade / alavancagem",
        objetivo: "alta",
        complexidade: "iniciante",
        analogia:
          "É como pagar uma reserva para comprar um imóvel por um preço travado. Se o preço subir muito, você lucra. Se não subir, perde só a reserva.",
        licaoSlug: "compra-a-seco",
      };
    if (p.tipo === "put" && p.acao === "compra")
      return {
        nome: "Compra de put (Long Put)",
        perfil: "Defensiva — proteção / compra de volatilidade",
        objetivo: "protecao",
        complexidade: "iniciante",
        analogia: "É contratar um seguro: você paga um prêmio e fica protegido se o preço despencar.",
        licaoSlug: "compra-a-seco",
      };
    if (p.tipo === "call")
      return {
        nome: "Venda de call (Covered Call / venda descoberta)",
        perfil: "Renda — venda de volatilidade",
        objetivo: "renda",
        complexidade: "intermediario",
        analogia:
          "Você aluga o seu ativo: recebe o prêmio hoje e, em troca, abre mão da alta acima do strike.",
        licaoSlug: "venda-coberta",
      };
    return {
      nome: "Venda de put",
      perfil: "Renda — venda de volatilidade",
      objetivo: "renda",
      complexidade: "avancado",
      analogia:
        "Você vende o seguro para outra pessoa: recebe o prêmio hoje, mas assume a obrigação de comprar o ativo se ele cair.",
    };
  }

  if (pernas.length === 2 && calls.length === 2 && compras.length === 1 && vendas.length === 1) {
    const altista = compras[0].strike < vendas[0].strike;
    return altista
      ? {
          nome: "Trava de alta (Bull Call Spread)",
          perfil: "Direcional com risco limitado",
          objetivo: "alta",
          complexidade: "intermediario",
          analogia:
            "É comprar um ingresso e revender outro mais caro: você abre mão do lucro extremo em troca de pagar bem menos pela entrada.",
          licaoSlug: "trava-de-alta",
        }
      : {
          nome: "Trava de baixa com calls (Bear Call Spread)",
          perfil: "Renda direcional — venda de volatilidade travada",
          objetivo: "baixa",
          complexidade: "intermediario",
          analogia: "Você recebe hoje para assumir um risco limitado caso o ativo suba.",
          licaoSlug: "trava-de-baixa",
        };
  }

  if (pernas.length === 2 && puts.length === 2 && compras.length === 1 && vendas.length === 1) {
    const baixista = compras[0].strike > vendas[0].strike;
    return baixista
      ? {
          nome: "Trava de baixa (Bear Put Spread)",
          perfil: "Direcional defensiva com risco limitado",
          objetivo: "baixa",
          complexidade: "intermediario",
          analogia: "É um seguro parcial: você compra proteção e vende um pedaço dela para baratear o custo.",
          licaoSlug: "trava-de-baixa",
        }
      : {
          nome: "Trava de alta com puts (Bull Put Spread)",
          perfil: "Renda direcional — venda de volatilidade travada",
          objetivo: "alta",
          complexidade: "intermediario",
          analogia: "Você recebe o prêmio hoje apostando que o ativo não cai abaixo de um nível.",
          licaoSlug: "trava-de-alta",
        };
  }

  if (pernas.length === 2 && calls.length === 1 && puts.length === 1) {
    if (compras.length === 2)
      return {
        nome: calls[0].strike === puts[0].strike ? "Straddle comprado" : "Strangle comprado",
        perfil: "Compra de volatilidade",
        objetivo: "indefinido",
        complexidade: "avancado",
        analogia: "Você aposta em movimento forte, para qualquer lado. Se nada acontecer, o tempo te consome.",
      };
    if (vendas.length === 2)
      return {
        nome: calls[0].strike === puts[0].strike ? "Straddle vendido" : "Strangle vendido",
        perfil: "Venda de volatilidade (risco não limitado)",
        objetivo: "lateralizacao",
        complexidade: "avancado",
        analogia: "Você ganha se o preço ficar parado — e perde muito se ele explodir para qualquer lado.",
      };
    return {
      nome: "Collar (proteção financiada)",
      perfil: "Defensiva — proteção com custo reduzido",
      objetivo: "protecao",
      complexidade: "intermediario",
      analogia: "Você compra o seguro e paga por ele vendendo parte da sua alta futura.",
    };
  }

  if (pernas.length === 4 && calls.length === 2 && puts.length === 2)
    return {
      nome: "Iron Condor",
      perfil: "Venda de volatilidade com risco travado",
      objetivo: "lateralizacao",
      complexidade: "avancado",
      analogia:
        "Você desenha um corredor e ganha se o preço ficar dentro dele até o vencimento. Sair do corredor custa caro, mas com perda limitada.",
    };

  if (pernas.length === 3 || (pernas.length === 4 && (calls.length === 4 || puts.length === 4)))
    return {
      nome: "Borboleta (Butterfly)",
      perfil: "Venda de volatilidade concentrada em um preço-alvo",
      objetivo: "lateralizacao",
      complexidade: "avancado",
      analogia: "Você aposta que o preço vai parar quase exatamente em um ponto. Acertar o alvo paga bem.",
    };

  return {
    nome: "Estrutura personalizada",
    perfil: "Depende da combinação das pernas",
    objetivo: "indefinido",
    complexidade: "avancado",
    analogia: "Combinação livre de pernas: leia o gráfico de payoff para entender onde ganha e onde perde.",
  };
}

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

/** Capital imobilizado: prêmios pagos + margem estimada das pernas vendidas descobertas. */
export function capitalComprometido(pernas: Perna[]): number {
  let pago = 0;
  let recebido = 0;
  for (const p of pernas) {
    if (p.acao === "compra") pago += p.premio * p.quantidade;
    else recebido += p.premio * p.quantidade;
  }
  const vendas = pernas.filter((p) => p.acao === "venda");
  const compras = pernas.filter((p) => p.acao === "compra");
  let margem = 0;
  for (const v of vendas) {
    const hedge = compras.find((c) => c.tipo === v.tipo);
    margem += hedge
      ? Math.abs(hedge.strike - v.strike) * v.quantidade
      : v.strike * v.quantidade * 0.2;
  }
  return Math.max(0, pago - recebido) + margem;
}

export function interpretar(pernas: Perna[], centro: number, ativo: string): Interpretacao {
  const s = summary(pernas, centro);
  const base = detectarEstrategia(pernas);

  const lucroLimitado = Number.isFinite(s.lucroMax) && s.lucroMax < 1e6;
  const vendasDescobertas =
    pernas.filter((p) => p.acao === "venda").length > pernas.filter((p) => p.acao === "compra").length;
  const perdaLimitada = !vendasDescobertas;
  const capitalEmRisco = Math.abs(Math.min(0, s.perdaMax));
  const comprometido = capitalComprometido(pernas);

  let risco: Interpretacao["risco"] = "baixo";
  if (!perdaLimitada) risco = "alto";
  else if (s.lucroMax > 0 && capitalEmRisco > s.lucroMax * 2) risco = "medio";
  else if (capitalEmRisco > centro * 100 * 0.05) risco = "medio";

  const contexto: Record<Objetivo, string> = {
    alta: "Ela é indicada quando você acredita em uma alta do ativo.",
    baixa: "Ela é indicada quando você acredita em uma queda do ativo.",
    renda: "Ela é indicada quando você quer receber um prêmio hoje e acredita que o preço não vai contra você.",
    protecao: "Ela é indicada quando você quer proteger uma posição contra quedas.",
    lateralizacao: "Ela é indicada quando você acredita que o preço vai ficar parado.",
    indefinido: "Leia o gráfico para entender em quais preços você ganha e em quais você perde.",
  };

  const resumo = [
    `Você está montando uma ${base.nome} em ${ativo}.`,
    perdaLimitada
      ? `Seu risco máximo é ${brl(capitalEmRisco)}.`
      : `Esta estrutura tem venda descoberta: a perda pode ir muito além do prêmio recebido.`,
    lucroLimitado ? `Seu lucro máximo é ${brl(Math.max(0, s.lucroMax))}.` : `Seu lucro é teoricamente ilimitado.`,
    contexto[base.objetivo],
    lucroLimitado && perdaLimitada ? "Ela limita perdas e também limita ganhos." : "",
  ]
    .filter(Boolean)
    .join(" ");

  const acompanhar = [
    "A aproximação do vencimento — o tempo derruba o valor das opções compradas",
    "A volatilidade das opções que você negociou",
    pernas.some((p) => p.acao === "venda")
      ? "O rompimento do strike que você vendeu"
      : "A distância entre o preço e o strike que você comprou",
    "A liquidez das séries, para conseguir sair quando quiser",
  ];

  return {
    ...base,
    objetivoLabel: OBJ_LABEL[base.objetivo],
    lucroLimitado,
    perdaLimitada,
    lucroMax: s.lucroMax,
    perdaMax: s.perdaMax,
    capitalEmRisco,
    capitalComprometido: comprometido,
    breakevens: s.breakevens,
    risco,
    resumo,
    acompanhar,
  };
}
