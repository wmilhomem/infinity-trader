import type { Perna } from "@/lib/payoff";
import { detectarEstrategia, interpretar } from "./simulation-interpreter";

/**
 * NARRATOR — o motor que transforma mudança de pernas em narrativa.
 * Cada ação do usuário no simulador (LEGS_UPDATED) vira um passo da
 * história da estrutura: o que ele fez, o que a estrutura virou e a
 * troca que foi feita. Nada aqui é gerado por IA — é didática derivada
 * dos números do interpretador, na hora, sem acoplamento com a UI.
 */

export type TomNarrativa = "info" | "bom" | "atencao";

export type PassoNarrativa = {
  titulo: string;
  linhas: string[];
  tom: TomNarrativa;
};

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function chavePerna(p: Perna): string {
  return `${p.acao}:${p.tipo}:${p.strike}:${p.premio}:${p.quantidade}`;
}

function descreverPerna(p: Perna, ativo: string): string {
  if (p.tipo === "call" && p.acao === "compra")
    return `Você comprou uma CALL de ${ativo} com strike ${brl(p.strike)}. Ela ganha valor se o ativo subir — e perde no máximo o prêmio pago (${brl(p.premio)} por opção).`;
  if (p.tipo === "put" && p.acao === "compra")
    return `Você comprou uma PUT de ${ativo} com strike ${brl(p.strike)}. Ela ganha valor se o ativo cair — e perde no máximo o prêmio pago (${brl(p.premio)} por opção).`;
  if (p.tipo === "call" && p.acao === "venda")
    return `Você vendeu uma CALL de ${ativo} com strike ${brl(p.strike)}. Você recebeu ${brl(p.premio)} por opção e abriu mão da alta acima dele.`;
  return `Você vendeu uma PUT de ${ativo} com strike ${brl(p.strike)}. Você recebeu ${brl(p.premio)} por opção e aceitou comprar o ativo se ele cair abaixo dele.`;
}

function linhasDaTroca(pernas: Perna[], ativo: string, centro: number): string[] {
  const i = interpretar(pernas, centro, ativo);
  const linhas: string[] = [];
  if (i.lucroLimitado)
    linhas.push(
      `Seu lucro ficou limitado: no máximo ${brl(Math.max(0, i.lucroMax))}. Parece ruim — mas existe um motivo: você trocou ganho infinito por risco controlado, e pagou bem menos pela operação.`,
    );
  else
    linhas.push(
      "Seu ganho não tem teto: quanto mais o ativo andar na direção que você espera, mais você ganha.",
    );
  linhas.push(
    i.perdaLimitada
      ? `E a perda tem teto: no máximo ${brl(i.capitalEmRisco)}. Nada além disso, mesmo que o mercado surpreenda.`
      : `Atenção: esta estrutura tem venda descoberta — a perda pode ir muito além do prêmio recebido.`,
  );
  return linhas;
}

/**
 * Narra a diferença entre dois estados de pernas.
 * Retorna null quando nada mudou de verdade (mesma estrutura, mesmo payoff).
 */
export function narrarMudanca(
  prev: Perna[],
  next: Perna[],
  ativo: string,
  centro: number,
): PassoNarrativa | null {
  const prevKeys = prev.map(chavePerna);
  const nextKeys = next.map(chavePerna);

  const mesmosKeys =
    prevKeys.length === nextKeys.length && prevKeys.every((k, i) => k === nextKeys[i]);

  if (mesmosKeys) return null;

  const adicionadas = next.filter((p) => !prevKeys.includes(chavePerna(p)));
  const removidas = prev.filter((p) => !nextKeys.includes(chavePerna(p)));

  const nomePrev = prev.length ? detectarEstrategia(prev).nome : null;
  const nomeNext = next.length ? detectarEstrategia(next).nome : null;
  const estruturaMudou = nomePrev !== nomeNext;

  // Apenas ajustes (strike, prêmio, quantidade): mesmo número de pernas e
  // mesmos papéis (compra/venda de call/put), mas parâmetros diferentes.
  const papel = (p: Perna) => `${p.acao}:${p.tipo}`;
  const mesmoPapel =
    prev.length === next.length &&
    prev.map(papel).sort().join(",") === next.map(papel).sort().join(",");
  if (mesmoPapel && !mesmosKeys) {
    const ajustadas = next.filter((p, i) => prev[i] && chavePerna(prev[i]) !== chavePerna(p));
    return {
      titulo: "Você ajustou uma perna",
      linhas: [
        ajustadas.map((p) => descreverPerna(p, ativo)).join(" "),
        "Confira o gráfico: cada ajuste de strike, prêmio ou quantidade redesenha a zona de ganho e de perda.",
      ],
      tom: "info",
    };
  }

  // Zerou a estrutura.
  if (next.length === 0) {
    return {
      titulo: "Você zerou a estrutura",
      linhas: ["Nenhuma perna restante. Sem posição, sem risco — e sem oportunidade."],
      tom: "info",
    };
  }

  // Primeira perna (ou salto direto para estrutura com duas pernas).
  if (prev.length === 0) {
    if (next.length === 1) {
      return {
        titulo: "Você acabou de adicionar a primeira perna",
        linhas: [
          descreverPerna(next[0], ativo),
          "Agora vamos entender o restante da estrutura: cada perna que você adicionar muda o risco e o potencial.",
        ],
        tom: "info",
      };
    }
    return {
      titulo: `Você montou uma ${nomeNext ?? "estrutura"}`,
      linhas: [...next.map((p) => descreverPerna(p, ativo)), ...linhasDaTroca(next, ativo, centro)],
      tom: "bom",
    };
  }

  // Removeu pernas.
  if (removidas.length > 0 && adicionadas.length === 0) {
    const linhas = removidas.map(
      (p) =>
        `Você removeu ${p.acao === "compra" ? "a compra" : "a venda"} de ${p.tipo.toUpperCase()} ${brl(p.strike)}.`,
    );
    if (estruturaMudou && next.length > 0) {
      const i = interpretar(next, centro, ativo);
      linhas.push(
        `Sua estrutura agora é uma ${nomeNext}.`,
        i.perdaLimitada
          ? `O risco mudou de novo: a perda máxima agora é ${brl(i.capitalEmRisco)}.`
          : `O risco mudou de novo: agora existe venda descoberta — a perda não tem teto.`,
      );
    } else {
      linhas.push("Confira no gráfico como o payoff mudou com essa remoção.");
    }
    return { titulo: "Você removeu uma perna", linhas, tom: "atencao" };
  }

  // Adicionou perna(s) a uma estrutura existente.
  if (adicionadas.length > 0) {
    const linhas = adicionadas.map((p) => descreverPerna(p, ativo));
    linhas.push(
      estruturaMudou
        ? `A combinação agora é uma ${nomeNext}.`
        : `A estrutura continua sendo uma ${nomeNext}, mas com o risco recalibrado.`,
    );
    linhas.push(...linhasDaTroca(next, ativo, centro));
    return {
      titulo: estruturaMudou
        ? `Você montou uma ${nomeNext ?? "nova estrutura"}`
        : "Mais uma perna na estrutura",
      linhas,
      tom: estruturaMudou ? "bom" : "info",
    };
  }

  // Apenas ajustes (strike, prêmio, quantidade ou sentido).
  return null;
}

/** Narração do tempo: publicada quando o Theta vira crítico. */
export function narrarThetaCritico(dias: number, perdaDiaria: number): PassoNarrativa {
  return {
    titulo: "O Theta começa a acelerar",
    linhas: [
      `Faltam apenas ${dias} dias para o vencimento. A cada dia, esta estrutura perde ${brl(Math.abs(perdaDiaria))} só pela passagem do tempo — e a velocidade aumenta.`,
      "Se a tese depende de um evento com data, o prazo tem que ter folga depois dele.",
    ],
    tom: "atencao",
  };
}

/** Narração de regra quebrada: publicada quando uma regra crítica é violada. */
export function narrarRegraQuebrada(regras: string[]): PassoNarrativa {
  return {
    titulo: "Sua própria regra foi acionada",
    linhas: regras.map(
      (r) => `Sua regra diz: "${r}". Hoje, esta estrutura está quebrando essa regra.`,
    ),
    tom: "atencao",
  };
}
