import { standardNormalCDF } from "./math";

/**
 * Expected Move (Desvio Padrão Precificado pelo Mercado)
 * Baseado na Volatilidade Implícita (IV) front-month. Expressa a oclusão do mercado sobre qual
 * raio o ativo subjacente irá fechar pelo prazo. (Aproximação straddle ATM em 1 StDev).
 *
 * @param spot Preço atual do ativo
 * @param ivImplied Volatilidade implícita em numeral simples (Ex: 35.5 para 35.5%)
 * @param tradeDays Dias úteis de negociação até vencimento
 */
export function getExpectedMove(spot: number, ivImplied: number, tradeDays: number): number {
  if (tradeDays <= 0) return 0;
  const t = tradeDays / 252;
  return spot * (ivImplied / 100) * Math.sqrt(t);
}

/**
 * Probability of Profit (POP)
 * Calcula a probabilidade matemática do preço no vencimento fechar
 * adequadamente acima (ou abaixo, dependendo da direção) da linha de breakeven, baseando-se no modelo Lognormal.
 * Assume taxa livre de risco driftada apenas no diferencial (simplificado 0 pra PoP rápido).
 */
export function calculateProbabilityOfProfit(
  spot: number,
  ivImplied: number,
  tYears: number,
  breakevens: number[],
  direction: "alta" | "baixa" | "lateralizacao" | "renda" | "protecao" | "indefinido",
): number {
  if (tYears <= 0 || breakevens.length === 0) return 50; // Incógnita limítrofe

  const volatility = ivImplied / 100;

  // CDF Lognormal: Probabilidade do Spot no Vencimento > Breakeven.
  const getProbAbove = (k: number) => {
    // Calculo do d2 do B&S onde K é o breakeven e R = 0 assumido (probabilidade pura do passeio aleatório)
    const d_2 =
      (Math.log(spot / k) - 0.5 * volatility * volatility * tYears) /
      (volatility * Math.sqrt(tYears));
    return standardNormalCDF(d_2) * 100;
  };

  // 1 Breakeven (Maioria das compras a seco, travas alinhadas, covers)
  if (breakevens.length === 1) {
    const b = breakevens[0];
    const pAbove = getProbAbove(b);

    if (direction === "alta") return pAbove;
    if (direction === "baixa") return 100 - pAbove;

    // Uma Venda Coberta (Renda) ganha desde que o ativo não despenque fatalmente abaixo da linha zero.
    // Uma Long Put (Protecao) ganha se estiver abaixo do breakeven.
    if (direction === "renda") return spot < b ? 100 - pAbove : pAbove;
    if (direction === "protecao") return 100 - pAbove;

    return 50;
  }

  // 2 Breakevens (Condores, Borboletas, Strangles limitados)
  // O usuário quer que fique DENTRO da janela de breakevens.
  if (breakevens.length === 2 && direction === "lateralizacao") {
    // Ordenar breakevens para segurança
    const [bInf, bSup] = [...breakevens].sort((a, b) => a - b);

    const pAboveInf = getProbAbove(bInf);
    const pAboveSup = getProbAbove(bSup);

    // A probabilidade de estar entre bInf e bSup é p(>bInf) - p(>bSup)
    return Math.max(0, pAboveInf - pAboveSup);
  }

  // Straddles/Strangles comprados tem 2 breakevens, mas a direção não é "lateralização".
  // Eles ganham saindo de DENTRO do canal (Cauda).
  if (breakevens.length === 2 && direction === "indefinido") {
    const [bInf, bSup] = [...breakevens].sort((a, b) => a - b);
    const pAboveInf = getProbAbove(bInf);
    const pAboveSup = getProbAbove(bSup);
    return Math.max(0, 100 - (pAboveInf - pAboveSup));
  }

  return 50;
}
