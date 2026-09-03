/**
 * RAW TYPES — os formatos brutos que o gateway troca com as fontes externas.
 * O contrato IMarketGateway é `any` por natureza (dados sujos do mundo real);
 * estes tipos tipam o que os NOSSOS gateways (Real/Http) realmente entregam.
 */
export type RawGreeks = {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  impliedVolatility: number;
};

export type RawOptionContract = {
  symbol: string;
  strikePrice: number;
  right: "C" | "P";
  bid: number | null;
  ask: number | null;
  last: number | null;
  expiration: string;
  volume?: number | null;
  openInterest?: number | null;
  impliedVolatility?: number | null;
  greeks?: RawGreeks;
};

export type RawOptionChain = {
  underlying: string;
  timestamp: number;
  source: "yahoo" | "modelo"; // yahoo = book real; modelo = prêmios calculados
  contracts: RawOptionContract[];
};

export type RawAsset = {
  ticker: string;
  symbol: string;
  name: string;
  price: number;
  lastUpdate: number;
  realizedVol: number | null;
  ivRank: number | null;
};

export type RawDICurvePoint = {
  days: number;
  rate: number;
};

export type RawCorporateEvent = {
  ticker: string;
  type: string;
  value: number;
  exDate: string;
};
