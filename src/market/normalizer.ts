import type {
  Asset,
  OptionContract,
  OptionChain,
  CorporateEvent,
  MarketCalendar,
  YieldCurve,
} from "./types";

type Raw = Record<string, unknown>;

/**
 * Normalizer
 * Nenhuma tela consome JSON bruto da B3. Esta camada converte pacotes sujos
 * de dados externos para nossos objetos internos imutáveis.
 */
export class MarketNormalizer {
  static normalizeAsset(raw: unknown): Asset {
    const r = (raw ?? {}) as Raw;
    const ivRank = Number(r.ivRank ?? null);
    return {
      ticker: String(r.ticker || r.symbol || ""),
      name: String(r.name || r.companyName || ""),
      price: Number(r.price || r.last || 0),
      lastUpdate: new Date(Number(r.timestamp || r.lastUpdate) || Date.now()),
      ivRank: Number.isFinite(ivRank) && ivRank >= 0 ? ivRank : undefined,
    };
  }

  static normalizeOptionContract(raw: unknown, underlying: string): OptionContract {
    const r = (raw ?? {}) as Raw;
    const rawType = String(r.type || r.right || "").toLowerCase();
    const isCall = rawType === "call" || rawType === "c";
    const g = (r.greeks ?? undefined) as Raw | undefined;
    return {
      ticker: String(r.ticker || r.symbol || ""),
      underlying,
      type: isCall ? "call" : "put",
      strike: Number(r.strike || r.strikePrice || 0),
      expiration: new Date(Number(r.expiration || r.maturity) || Date.now()),
      bid: Number(r.bid || 0),
      ask: Number(r.ask || 0),
      last: Number(r.last || r.price || 0),
      greeks: g
        ? {
            delta: Number(g.delta || 0),
            gamma: Number(g.gamma || 0),
            theta: Number(g.theta || 0),
            vega: Number(g.vega || 0),
            rho: Number(g.rho || 0),
            impliedVolatility: Number(g.impliedVolatility || g.iv || 0),
          }
        : undefined,
    };
  }

  static normalizeOptionChain(raw: unknown): OptionChain {
    const r = (raw ?? {}) as Raw;
    const underlying = String(r.underlying || r.symbol || "");
    const listaRaw = r.contracts || r.options;
    const rawContracts: unknown[] = Array.isArray(listaRaw) ? listaRaw : [];

    return {
      underlying,
      contracts: rawContracts.map((c: unknown) => this.normalizeOptionContract(c, underlying)),
      lastUpdate: new Date(Number(r.timestamp) || Date.now()),
    };
  }

  static normalizeDICurve(rawArray: unknown[]): YieldCurve {
    if (!Array.isArray(rawArray)) return { points: [], baseDate: new Date() };
    return {
      baseDate: new Date(),
      points: rawArray
        .map((p) => {
          const r = (p ?? {}) as Raw;
          return {
            days: Number(r.days || r.du || 0),
            rate: Number(r.rate || r.taxa || 0),
          };
        })
        .sort((a, b) => a.days - b.days),
    };
  }

  static normalizeCorporateEvents(rawArray: unknown[]): CorporateEvent[] {
    if (!Array.isArray(rawArray)) return [];
    return rawArray.map((raw) => {
      const r = (raw ?? {}) as Raw;
      return {
        ticker: String(r.ticker || ""),
        type: r.type === "DIVIDEND" ? "dividendo" : "outro",
        valueOrRatio: Number(r.value || r.ratio || 0),
        exDate: new Date(Number(r.exDate) || Date.now()),
        paymentDate: r.paymentDate ? new Date(Number(r.paymentDate)) : undefined,
      };
    });
  }
}
