export type Asset = {
  ticker: string;
  name: string;
  price: number;
  lastUpdate: Date;
  ivRank?: number; // Percentil 0-100 da volatilidade atual no histórico do ativo
};

export type OptionGreeks = {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  impliedVolatility: number;
};

export type OptionContract = {
  ticker: string;
  underlying: string;
  type: "call" | "put";
  strike: number;
  expiration: Date;
  bid: number;
  ask: number;
  last: number;
  greeks?: OptionGreeks;
};

export type OptionChain = {
  underlying: string;
  contracts: OptionContract[];
  lastUpdate: Date;
};

export type DICurvePoint = {
  days: number;
  rate: number; // Ex: 0.105 para 10.5%
};

export type YieldCurve = {
  points: DICurvePoint[];
  baseDate: Date;
};

export type CorporateEvent = {
  ticker: string;
  type: "dividendo" | "jcp" | "desdobramento" | "grupamento" | "outro";
  valueOrRatio: number; // Ex: R$ por cota, ou proporção 1:4
  exDate: Date;
  paymentDate?: Date;
};

export type MarketCalendar = {
  holidays: Date[]; // Feriados que fecham a bolsa
  expirations: {
    options: Date[];
    futures: Date[];
  };
};
