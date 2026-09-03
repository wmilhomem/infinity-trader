/**
 * CONSTRUTOR CANÔNICO DE CONTEXTO DE MERCADO — RODADA Y.1
 * Market Data Integrity & B3 Data Contract
 *
 * Função pura, determinística e null-safe.
 * NENHUM DADO NULO É CONVERTIDO SILENCIOSAMENTE PARA ZERO.
 * NENHUM CAMPO DERIVADO É PREENCHIDO SEM PROVENIÊNCIA EXPLÍCITA.
 */

import type {
  MarketContext,
  MarketContextEvent,
  MarketDataProvenance,
  MarketDataQuality,
  OptionContract,
  FieldProvenance,
} from "./market-context";
import { calculateMarketFreshness } from "./market-freshness";
import { getSourceReliability } from "./market-source-policy";

export interface BuildMarketContextInput {
  symbol: string;
  market?: string | null;
  assetClass?: MarketContext["instrument"]["assetClass"];

  timestamp?: string | null;
  observedAt?: string | null;

  provenance?: Partial<MarketDataProvenance> | null;
  quality?: Partial<MarketDataQuality> | null;

  quote?: MarketContext["quote"];
  candle?: MarketContext["candle"];
  indicators?: MarketContext["indicators"];
  representation?: MarketContext["representation"];
  volatility?: MarketContext["volatility"];
  liquidity?: MarketContext["liquidity"];

  /**
   * Cadeia de opções com proveniência por campo (Rodada Y.1).
   * Aceita a estrutura canônica completa. Campos sem proveniência
   * explícita devem ser omitidos — nunca preenchidos com estimativa silenciosa.
   */
  optionsChain?: MarketContext["optionsChain"];

  events?: MarketContextEvent[];
  macro?: MarketContextEvent[];
  fundamental?: MarketContextEvent[];
}

/**
 * Proveniência padrão para campos observados externamente.
 * Usar como base ao passar dados diretos de provider B3.
 */
export function observedProvenance(source: string, observedAt: string): FieldProvenance {
  return { origin: "observed", source, calculatedAt: observedAt };
}

/**
 * Proveniência padrão para campos calculados pelo sistema.
 */
export function calculatedProvenance(
  method: string,
  inputs: Record<string, number | string | null>,
  calculatedAt: string,
): FieldProvenance {
  return { origin: "calculated", method, inputs, calculatedAt };
}

/**
 * Proveniência para campos estimados (aproximações/interpolações).
 * Deve ser usado com cautela — o usuário deve saber que é uma estimativa.
 */
export function estimatedProvenance(
  method: string,
  inputs: Record<string, number | string | null>,
  calculatedAt: string,
): FieldProvenance {
  return { origin: "estimated", method, inputs, calculatedAt };
}

export function buildMarketContext(input: BuildMarketContextInput): MarketContext {
  const timestamp = input.timestamp ?? new Date().toISOString();

  const source = input.provenance?.source ?? "mock";
  const observedAt = input.observedAt ?? input.provenance?.observedAt ?? timestamp;

  const provenance: MarketDataProvenance = {
    source,
    provider: input.provenance?.provider ?? null,
    observedAt,
    receivedAt: input.provenance?.receivedAt ?? timestamp,
    isDelayed: input.provenance?.isDelayed ?? source === "delayed",
    delaySeconds: input.provenance?.delaySeconds ?? (source === "delayed" ? 900 : null),
  };

  const calculatedFreshness = calculateMarketFreshness(observedAt, timestamp, source);
  const calculatedReliability = getSourceReliability(source);

  // Determinar completude com base nos campos observados
  let completeness: MarketDataQuality["completeness"] = "minimal";
  if (
    input.quote?.last === null &&
    input.quote?.open === null &&
    input.quote?.high === null &&
    input.quote?.low === null
  ) {
    completeness = "empty";
  } else if (input.quote?.last !== undefined && input.quote?.last !== null) {
    completeness = "partial";
    if (
      input.volatility?.impliedVolatility !== undefined &&
      input.volatility?.impliedVolatility !== null &&
      input.indicators?.vwap !== undefined &&
      input.indicators?.vwap !== null
    ) {
      completeness = "complete";
    }
  }

  const quality: MarketDataQuality = {
    freshness: input.quality?.freshness ?? calculatedFreshness,
    completeness: input.quality?.completeness ?? completeness,
    sourceReliability: input.quality?.sourceReliability ?? calculatedReliability,
    confidence:
      input.quality?.confidence ??
      (source === "live" ? "high" : source === "provider" ? "medium" : "low"),
  };

  // Mapeamento null-safe dos contratos de opções com proveniência por campo
  const mapContracts = (contracts: OptionContract[] | undefined): OptionContract[] => {
    if (!contracts) return [];
    return contracts.map((c) => ({
      symbol: c.symbol,
      strike: c.strike,
      type: c.type,
      style: c.style ?? null,
      expiration: c.expiration,
      daysToExpiration: c.daysToExpiration,
      last: c.last ?? null,
      bid: c.bid ?? null,
      ask: c.ask ?? null,
      volume: c.volume ?? null,
      openInterest: c.openInterest ?? null,
      // IV: preserva proveniência ou declara como null
      impliedVolatility: c.impliedVolatility ?? null,
      // Greeks: preserva proveniência completa ou null
      delta: c.delta ?? null,
      gamma: c.gamma ?? null,
      theta: c.theta ?? null,
      vega: c.vega ?? null,
    }));
  };

  return {
    version: 1,
    instrument: {
      symbol: input.symbol.toUpperCase(),
      market: input.market ?? "B3",
      assetClass: input.assetClass ?? "stock",
    },
    timestamp,
    provenance,
    quality,
    quote: input.quote
      ? {
          last: input.quote.last ?? null,
          open: input.quote.open ?? null,
          high: input.quote.high ?? null,
          low: input.quote.low ?? null,
          previousClose: input.quote.previousClose ?? null,
          bid: input.quote.bid ?? null,
          ask: input.quote.ask ?? null,
          volume: input.quote.volume ?? null,
        }
      : null,
    candle: input.candle
      ? {
          timeframe: input.candle.timeframe ?? null,
          open: input.candle.open ?? null,
          high: input.candle.high ?? null,
          low: input.candle.low ?? null,
          close: input.candle.close ?? null,
          direction: input.candle.direction ?? null,
          body: input.candle.body ?? null,
          upperWick: input.candle.upperWick ?? null,
          lowerWick: input.candle.lowerWick ?? null,
        }
      : null,
    indicators: input.indicators
      ? {
          vwap: input.indicators.vwap ?? null,
          movingAverages: input.indicators.movingAverages
            ? input.indicators.movingAverages.map((ma) => ({
                period: ma.period,
                type: ma.type,
                value: ma.value ?? null,
              }))
            : undefined,
          fibonacci: input.indicators.fibonacci
            ? {
                referenceHigh: input.indicators.fibonacci.referenceHigh ?? null,
                referenceLow: input.indicators.fibonacci.referenceLow ?? null,
                levels: input.indicators.fibonacci.levels ?? [],
              }
            : null,
        }
      : null,
    representation: input.representation
      ? {
          type: input.representation.type ?? "candle",
          renko: input.representation.renko
            ? {
                blockSize: input.representation.renko.blockSize ?? null,
                direction: input.representation.renko.direction ?? null,
                sequence: input.representation.renko.sequence ?? null,
              }
            : null,
        }
      : null,
    volatility: input.volatility
      ? {
          impliedVolatility: input.volatility.impliedVolatility ?? null,
          ivRank: input.volatility.ivRank ?? null,
          expectedMove: input.volatility.expectedMove ?? null,
        }
      : null,
    liquidity: input.liquidity
      ? {
          bidAskSpread: input.liquidity.bidAskSpread ?? null,
          openInterest: input.liquidity.openInterest ?? null,
          volume: input.liquidity.volume ?? null,
        }
      : null,
    events: input.events ?? [],
    macro: input.macro ?? [],
    fundamental: input.fundamental ?? [],
    optionsChain: input.optionsChain
      ? {
          expirationDate: input.optionsChain.expirationDate ?? null,
          daysToExpiration: input.optionsChain.daysToExpiration ?? null,
          // ATM: preserva definição metodológica completa
          atm: input.optionsChain.atm ?? null,
          // IV ATM: preserva proveniência (observed/calculated)
          impliedVolatilityAtm: input.optionsChain.impliedVolatilityAtm ?? null,
          // Skew: preserva metodologia, strikes e distância OTM
          skew: input.optionsChain.skew ?? null,
          // Expected Move: preserva fórmula, IV usada, spot, DTE e base temporal
          expectedMove: input.optionsChain.expectedMove ?? null,
          // Contratos individuais com Greeks rastreáveis
          contracts: mapContracts(input.optionsChain.contracts),
        }
      : null,
  };
}
