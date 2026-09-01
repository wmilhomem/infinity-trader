import type { MarketContext } from "./market-context";

/**
 * DERIVED OBSERVATIONS & INTERPRETATION TYPES — RODADA X
 * 
 * Transforma dados numéricos brutos em observações verificáveis (fatos).
 * 
 * REGRA CRÍTICA:
 * Observações são matematicamente verificáveis ("Preço acima da VWAP").
 * NUNCA contêm linguagem prescritiva (sinais de compra/venda, metas, oportunidades).
 */

export interface MarketObservation {
  id: string;
  fact: string;
  sourceFields: string[];
  observedAt?: string | null;
}

export interface MarketInterpretation {
  statement: string;
  basedOn: string[];
  author: "user" | "system" | "copilot";
  confidence?: "low" | "medium" | "high" | null;
}

export const FORBIDDEN_PRESCRIPTIVE_TERMS = [
  "compre",
  "venda",
  "entrada",
  "sinal de compra",
  "sinal de venda",
  "oportunidade",
  "alvo",
  "stop recomendado",
  "deve subir",
  "deve cair",
  "confirma compra",
  "confirma venda",
  "forte oportunidade",
  "setup comprador",
  "setup vendedor",
];

export function containsPrescriptiveLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_PRESCRIPTIVE_TERMS.some((term) => lower.includes(term));
}

/**
 * Deriva fatos numéricos verificáveis a partir do MarketContext.
 */
export function deriveMarketObservations(ctx: MarketContext): MarketObservation[] {
  const obs: MarketObservation[] = [];
  const time = ctx.provenance.observedAt ?? ctx.timestamp;

  const quote = ctx.quote;
  const ind = ctx.indicators;
  const rep = ctx.representation;
  const vol = ctx.volatility;

  // 1. Preço vs VWAP
  if (quote?.last !== undefined && quote?.last !== null && ind?.vwap !== undefined && ind?.vwap !== null) {
    if (quote.last > ind.vwap) {
      obs.push({
        id: "price-above-vwap",
        fact: `Preço observado (R$ ${quote.last.toFixed(2)}) acima da VWAP (R$ ${ind.vwap.toFixed(2)})`,
        sourceFields: ["quote.last", "indicators.vwap"],
        observedAt: time,
      });
    } else if (quote.last < ind.vwap) {
      obs.push({
        id: "price-below-vwap",
        fact: `Preço observado (R$ ${quote.last.toFixed(2)}) abaixo da VWAP (R$ ${ind.vwap.toFixed(2)})`,
        sourceFields: ["quote.last", "indicators.vwap"],
        observedAt: time,
      });
    } else {
      obs.push({
        id: "price-equals-vwap",
        fact: `Preço observado (R$ ${quote.last.toFixed(2)}) alinhado à VWAP (R$ ${ind.vwap.toFixed(2)})`,
        sourceFields: ["quote.last", "indicators.vwap"],
        observedAt: time,
      });
    }
  }

  // 2. Médias Móveis
  if (ind?.movingAverages && ind.movingAverages.length >= 2) {
    const maFast = ind.movingAverages[0];
    const maSlow = ind.movingAverages[1];
    if (maFast.value !== null && maSlow.value !== null) {
      if (maFast.value > maSlow.value) {
        obs.push({
          id: `ma-${maFast.period}-above-${maSlow.period}`,
          fact: `A média de ${maFast.period} períodos (${maFast.value.toFixed(2)}) está acima da média de ${maSlow.period} períodos (${maSlow.value.toFixed(2)})`,
          sourceFields: ["indicators.movingAverages"],
          observedAt: time,
        });
      } else if (maFast.value < maSlow.value) {
        obs.push({
          id: `ma-${maFast.period}-below-${maSlow.period}`,
          fact: `A média de ${maFast.period} períodos (${maFast.value.toFixed(2)}) está abaixo da média de ${maSlow.period} períodos (${maSlow.value.toFixed(2)})`,
          sourceFields: ["indicators.movingAverages"],
          observedAt: time,
        });
      }
    }
  }

  // 3. Renko
  if (rep?.type === "renko" && rep.renko) {
    const r = rep.renko;
    if (r.sequence !== undefined && r.sequence !== null && r.direction) {
      const dirText = r.direction === "up" ? "alta" : r.direction === "down" ? "baixa" : "neutralidade";
      obs.push({
        id: "renko-sequence",
        fact: `Foram observados ${r.sequence} blocos Renko consecutivos na direção de ${dirText} (tamanho do bloco: ${r.blockSize ?? "não informado"})`,
        sourceFields: ["representation.renko"],
        observedAt: time,
      });
    }
  }

  // 4. Volatilidade Implícita (IV)
  if (vol?.impliedVolatility !== undefined && vol?.impliedVolatility !== null) {
    obs.push({
      id: "iv-observed",
      fact: `Volatilidade Implícita observada em ${vol.impliedVolatility.toFixed(1)}%${vol.ivRank !== null && vol.ivRank !== undefined ? ` (IV Rank: percentil ${vol.ivRank}%)` : ""}`,
      sourceFields: ["volatility.impliedVolatility", "volatility.ivRank"],
      observedAt: time,
    });
  }

  // 5. Fibonacci
  if (quote?.last !== undefined && quote?.last !== null && ind?.fibonacci?.levels) {
    for (const lvl of ind.fibonacci.levels) {
      const pctRatio = (lvl.ratio * 100).toFixed(1);
      const diffPct = Math.abs(quote.last - lvl.price) / quote.last;
      if (diffPct <= 0.005) { // dentro de 0.5%
        obs.push({
          id: `fib-${lvl.ratio}`,
          fact: `Preço em R$ ${quote.last.toFixed(2)} está próximo do nível de ${pctRatio}% de Fibonacci (R$ ${lvl.price.toFixed(2)})`,
          sourceFields: ["quote.last", "indicators.fibonacci"],
          observedAt: time,
        });
      }
    }
  }

  // 6. Inteligência de Opções (Rodada Y.1 — com proveniência por campo)
  if (ctx.optionsChain) {
    const opt = ctx.optionsChain;
    const atmMethod = opt.atm?.method ?? null;

    // IV ATM: agora é um objeto { value, provenance } — extrair .value
    const ivAtmValue = opt.impliedVolatilityAtm?.value;
    if (ivAtmValue !== null && ivAtmValue !== undefined) {
      const ivOrigin = opt.impliedVolatilityAtm?.provenance?.origin ?? "unknown";
      obs.push({
        id: "options-iv-atm",
        fact: `Volatilidade Implícita ATM da cadeia ${ivOrigin === "calculated" ? "calculada" : "observada"} em ${ivAtmValue.toFixed(1)}% a.a. para o vencimento de ${opt.daysToExpiration ?? "N/A"} dias${atmMethod ? ` (ATM: ${atmMethod})` : ""}`,
        sourceFields: ["optionsChain.impliedVolatilityAtm", "optionsChain.daysToExpiration"],
        observedAt: time,
      });
    }

    // Skew: ainda { putIvOtm, callIvOtm, slope, provenance, strikes }
    if (opt.skew?.putIvOtm !== null && opt.skew?.callIvOtm !== null
        && opt.skew?.putIvOtm !== undefined && opt.skew?.callIvOtm !== undefined) {
      const diff = opt.skew.putIvOtm - opt.skew.callIvOtm;
      const incl = diff > 0
        ? "inclinado para Puts (Put IV maior que Call IV)"
        : diff < 0
        ? "inclinado para Calls (Call IV maior que Put IV)"
        : "simétrico";
      const putStrike = opt.skew.putStrikeUsed != null ? ` (strike ${opt.skew.putStrikeUsed})` : "";
      const callStrike = opt.skew.callStrikeUsed != null ? ` (strike ${opt.skew.callStrikeUsed})` : "";
      obs.push({
        id: "options-skew",
        fact: `Skew de volatilidade observado ${incl}: Put OTM${putStrike} com ${opt.skew.putIvOtm.toFixed(1)}% vs. Call OTM${callStrike} com ${opt.skew.callIvOtm.toFixed(1)}%`,
        sourceFields: ["optionsChain.skew"],
        observedAt: time,
      });
    }

    // Expected Move: agora é objeto com .value fields + .formula + .ivUsed
    if (opt.expectedMove?.lowerBound1Sigma !== null && opt.expectedMove?.upperBound1Sigma !== null
        && opt.expectedMove?.lowerBound1Sigma !== undefined && opt.expectedMove?.upperBound1Sigma !== undefined) {
      const formula = opt.expectedMove.formula ? ` [fórmula: ${opt.expectedMove.formula}]` : "";
      const ivUsed = opt.expectedMove.ivUsed != null
        ? `, IV usada: ${(opt.expectedMove.ivUsed * 100).toFixed(1)}%`
        : "";
      const dteUsed = opt.expectedMove.dteUsed != null
        ? `, DTE: ${opt.expectedMove.dteUsed} dias ${opt.expectedMove.dteBase ?? ""}`
        : "";
      obs.push({
        id: "options-expected-move",
        fact: `Faixa de variação esperada em 1 sigma (68% prob. implícita): entre R$ ${opt.expectedMove.lowerBound1Sigma.toFixed(2)} e R$ ${opt.expectedMove.upperBound1Sigma.toFixed(2)} (amplitude de ±R$ ${opt.expectedMove.sigma1Brl?.toFixed(2) ?? "N/A"})${formula}${ivUsed}${dteUsed}`,
        sourceFields: ["optionsChain.expectedMove"],
        observedAt: time,
      });
    }
  }

  // Sanity check: garantir ausência de linguagem prescritiva em todas as observações
  for (const o of obs) {
    if (containsPrescriptiveLanguage(o.fact)) {
      throw new Error(`VIOLAÇÃO EPISTÊMICA DA RODADA X/Y: Observação automática contém termo prescritivo: "${o.fact}"`);
    }
  }

  return obs;
}
