import type { 
  Asset, 
  OptionContract, 
  OptionChain, 
  CorporateEvent, 
  MarketCalendar,
  YieldCurve
} from "./types";

/**
 * Normalizer
 * Nenhuma tela consome JSON bruto da B3. Esta camada converte pacotes sujos
 * de dados externos para nossos objetos internos imutáveis.
 */
export class MarketNormalizer {
  static normalizeAsset(raw: any): Asset {
    return {
      ticker: String(raw?.ticker || raw?.symbol || ""),
      name: String(raw?.name || raw?.companyName || ""),
      price: Number(raw?.price || raw?.last || 0),
      lastUpdate: new Date(raw?.timestamp || raw?.lastUpdate || Date.now()),
    };
  }

  static normalizeOptionContract(raw: any, underlying: string): OptionContract {
    const rawType = String(raw?.type || raw?.right || "").toLowerCase();
    const isCall = rawType === "call" || rawType === "c";
    return {
      ticker: String(raw?.ticker || raw?.symbol || ""),
      underlying,
      type: isCall ? "call" : "put",
      strike: Number(raw?.strike || raw?.strikePrice || 0),
      expiration: new Date(raw?.expiration || raw?.maturity || Date.now()),
      bid: Number(raw?.bid || 0),
      ask: Number(raw?.ask || 0),
      last: Number(raw?.last || raw?.price || 0),
      greeks: raw?.greeks ? {
        delta: Number(raw.greeks.delta || 0),
        gamma: Number(raw.greeks.gamma || 0),
        theta: Number(raw.greeks.theta || 0),
        vega: Number(raw.greeks.vega || 0),
        rho: Number(raw.greeks.rho || 0),
        impliedVolatility: Number(raw.greeks.impliedVolatility || raw.greeks.iv || 0),
      } : undefined
    };
  }

  static normalizeOptionChain(raw: any): OptionChain {
    const underlying = String(raw?.underlying || raw?.symbol || "");
    const rawContracts = Array.isArray(raw?.contracts || raw?.options) 
      ? (raw.contracts || raw.options) 
      : [];
      
    return {
      underlying,
      contracts: rawContracts.map((c: any) => this.normalizeOptionContract(c, underlying)),
      lastUpdate: new Date(raw?.timestamp || Date.now())
    };
  }

  static normalizeDICurve(rawArray: any[]): YieldCurve {
    if (!Array.isArray(rawArray)) return { points: [], baseDate: new Date() };
    return {
      baseDate: new Date(),
      points: rawArray.map(r => ({
        days: Number(r?.days || r?.du || 0),
        rate: Number(r?.rate || r?.taxa || 0)
      })).sort((a, b) => a.days - b.days)
    };
  }

  static normalizeCorporateEvents(rawArray: any[]): CorporateEvent[] {
    if (!Array.isArray(rawArray)) return [];
    return rawArray.map(raw => ({
      ticker: String(raw?.ticker || ""),
      type: raw?.type === "DIVIDEND" ? "dividendo" : "outro",
      valueOrRatio: Number(raw?.value || raw?.ratio || 0),
      exDate: new Date(raw?.exDate || Date.now()),
      paymentDate: raw?.paymentDate ? new Date(raw.paymentDate) : undefined,
    }));
  }
}
