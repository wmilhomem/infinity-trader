/**
 * CANONICAL MARKET CONTEXT — RODADA X
 * 
 * Estrutura canônica de Contexto de Mercado que consolida:
 * - Dados observados (Market Data)
 * - Inteligência Externa (Market Intelligence: eventos, notícias, macro)
 * - Proveniência e temporalidade dos dados
 * - Qualidade dos dados (Freshness, Completeness, Reliability, Confidence)
 * 
 * REGRA ABSOLUTA:
 * null ≠ 0. Dados não observados são representados como null ou ausentes, jamais 0.
 * Sem interpretação prescritiva, sinais, recomendações ou alvos automáticos.
 */

export type MarketDataSource =
  | "mock"
  | "live"
  | "delayed"
  | "provider"
  | "model"
  | "replay"
  | "manual"
  | "unknown";

export interface MarketDataProvenance {
  source: MarketDataSource;
  provider?: string | null;
  observedAt?: string | null;
  receivedAt?: string | null;
  isDelayed?: boolean | null;
  delaySeconds?: number | null;
}

export interface MarketDataQuality {
  freshness: "fresh" | "delayed" | "stale" | "unknown";
  completeness: "complete" | "partial" | "minimal" | "empty" | "unknown";
  sourceReliability: "official" | "provider" | "secondary" | "manual" | "unknown";
  confidence: "high" | "medium" | "low" | "unknown";
}

export interface MarketContextEvent {
  id?: string;
  category:
    | "corporate"
    | "economic"
    | "political"
    | "commodity"
    | "expiration"
    | "earnings"
    | "dividend"
    | "other";
  title: string;
  description?: string | null;
  source?: string | null;
  publishedAt?: string | null;
  observedAt?: string | null;
  reference?: string | null;
  /** Relevância contextual (nunca potencial de valorização ou sentido de trade). */
  relevance?: "low" | "medium" | "high" | null;
}

export interface MarketContext {
  version: 1;

  instrument: {
    symbol: string;
    market?: string | null;
    assetClass?: "stock" | "option" | "future" | "etf" | "index" | "unknown";
  };

  timestamp: string;

  provenance: MarketDataProvenance;

  quality: MarketDataQuality;

  quote?: {
    last?: number | null;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    previousClose?: number | null;

    bid?: number | null;
    ask?: number | null;

    volume?: number | null;
  } | null;

  candle?: {
    timeframe?: string | null;

    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;

    direction?: "up" | "down" | "neutral" | null;

    body?: number | null;
    upperWick?: number | null;
    lowerWick?: number | null;
  } | null;

  indicators?: {
    vwap?: number | null;

    movingAverages?: Array<{
      period: number;
      type: "SMA" | "EMA";
      value: number | null;
    }>;

    fibonacci?: {
      referenceHigh?: number | null;
      referenceLow?: number | null;

      levels?: Array<{
        ratio: number;
        price: number;
      }>;
    } | null;
  } | null;

  representation?: {
    type?: "candle" | "renko" | null;

    renko?: {
      blockSize?: number | null;
      direction?: "up" | "down" | "neutral" | null;
      sequence?: number | null;
    } | null;
  } | null;

  volatility?: {
    impliedVolatility?: number | null;
    ivRank?: number | null;
    expectedMove?: number | null;
  } | null;

  liquidity?: {
    bidAskSpread?: number | null;
    openInterest?: number | null;
    volume?: number | null;
  } | null;

  optionsChain?: {
    expirationDate?: string | null;
    daysToExpiration?: number | null;
    atmStrike?: number | null;
    impliedVolatilityAtm?: number | null;
    skew?: {
      putIvOtm?: number | null;
      callIvOtm?: number | null;
      slope?: number | null;
    } | null;
    expectedMove?: {
      sigma1Brl?: number | null;
      lowerBound1Sigma?: number | null;
      upperBound1Sigma?: number | null;
    } | null;
    contracts?: Array<{
      symbol: string;
      strike: number;
      type: "call" | "put";
      style?: "american" | "european" | null;
      expiration: string;
      daysToExpiration: number;
      last?: number | null;
      bid?: number | null;
      ask?: number | null;
      volume?: number | null;
      openInterest?: number | null;
      impliedVolatility?: number | null;
      delta?: number | null;
      gamma?: number | null;
      theta?: number | null;
      vega?: number | null;
    }>;
  } | null;

  events?: MarketContextEvent[];

  macro?: MarketContextEvent[];

  fundamental?: MarketContextEvent[];
}
