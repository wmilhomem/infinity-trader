import type { Asset, OptionContract, OptionChain, CorporateEvent, YieldCurve } from "./types";
import {
  parseAsset,
  parseOptionContract,
  parseOptionChain,
  parseDICurve,
  parseCorporateEvents,
} from "@/lib/market-data/schemas";
import {
  normalizeAssetPackage,
  normalizeOptionChainPackage,
  normalizeDICurvePackage,
  normalizeCorporateEventsPackage,
  makeObservedProvenance,
} from "@/lib/market-data/normalizer";

type Raw = Record<string, unknown>;

/**
 * Normalizer
 * Y.2 — delega para src/lib/market-data/ (camada Y.2) e converte
 * o FieldEnvelope<Snapshot> para o tipo legado.
 *
 * Mantém a interface pública (LiveProvider legado continua funcionando),
 * mas usa o pipeline Y.2 (schema + validators + normalizer) internamente.
 */
export class MarketNormalizer {
  static normalizeAsset(raw: unknown): Asset {
    const parsed = parseAsset(raw);
    if (!parsed.ok) {
      // Falha de schema: fallback com valores vazios, mas mantém interface
      return {
        ticker: "",
        name: "",
        price: 0,
        lastUpdate: new Date(),
        ivRank: undefined,
      };
    }
    const observedAt = new Date(parsed.data.lastUpdate).toISOString();
    const provenance = makeObservedProvenance("yahoo-finance", observedAt);
    const env = normalizeAssetPackage(parsed.data, { quality: "valid", reasons: [] }, provenance);
    const snap = env?.value;
    if (!snap) {
      return {
        ticker: parsed.data.ticker,
        name: parsed.data.name,
        price: 0,
        lastUpdate: new Date(parsed.data.lastUpdate),
        ivRank: undefined,
      };
    }
    // Converte Snapshot → Asset legado. Mantém price (mesmo 0).
    return {
      ticker: snap.ticker,
      name: snap.name,
      price: snap.price ?? 0,
      lastUpdate: new Date(parsed.data.lastUpdate),
      // ivRank null preservado como undefined para o tipo legado
      ivRank: snap.ivRank === null ? undefined : snap.ivRank,
    };
  }

  static normalizeOptionContract(raw: unknown, underlying: string): OptionContract {
    const parsed = parseOptionContract(raw);
    const r = (raw ?? {}) as Raw;
    if (!parsed.ok) {
      const rawType = String(r.type || r.right || "").toLowerCase();
      const isCall = rawType === "call" || rawType === "c";
      return {
        ticker: String(r.ticker || r.symbol || ""),
        underlying,
        type: isCall ? "call" : "put",
        strike: Number(r.strike || r.strikePrice || 0),
        expiration: new Date(Number(r.expiration || r.maturity) || Date.now()),
        bid: 0,
        ask: 0,
        last: 0,
        greeks: undefined,
      };
    }
    const c = parsed.data;
    const rawType = String(c.right);
    const isCall = rawType === "C";
    return {
      ticker: c.symbol,
      underlying,
      type: isCall ? "call" : "put",
      strike: c.strikePrice,
      expiration: new Date(c.expiration),
      // Converte null → 0 para compatibilidade com tipo legado (não-nullable)
      // IMPORTANTE: Y.2 preservou o null. A conversão aqui é apenas para o
      // tipo legado; o tipo Y.2 (OptionContractSnapshot) preserva null.
      bid: c.bid ?? 0,
      ask: c.ask ?? 0,
      last: c.last ?? 0,
      greeks: c.greeks
        ? {
            delta: c.greeks.delta,
            gamma: c.greeks.gamma,
            theta: c.greeks.theta,
            vega: c.greeks.vega,
            rho: c.greeks.rho,
            impliedVolatility: c.greeks.impliedVolatility,
          }
        : undefined,
    };
  }

  static normalizeOptionChain(raw: unknown): OptionChain {
    const parsed = parseOptionChain(raw);
    if (!parsed.ok) {
      return { underlying: "", contracts: [], lastUpdate: new Date() };
    }
    const r = parsed.data;
    const env = normalizeOptionChainPackage(r, { quality: "valid", reasons: [] }, null);
    const snap = env?.value;
    return {
      underlying: r.underlying,
      contracts: snap
        ? snap.contracts.map((c) =>
            this.normalizeOptionContract(
              {
                symbol: c.symbol,
                strikePrice: c.strike,
                right: c.right,
                expiration: c.expiration,
                bid: c.bid,
                ask: c.ask,
                last: c.last,
              },
              r.underlying,
            ),
          )
        : [],
      lastUpdate: new Date(r.timestamp),
    };
  }

  static normalizeDICurve(rawArray: unknown[]): YieldCurve {
    const parsed = parseDICurve(rawArray);
    if (!parsed.ok) {
      return { points: [], baseDate: new Date() };
    }
    const env = normalizeDICurvePackage(parsed.data, { quality: "valid", reasons: [] });
    return {
      baseDate: new Date(),
      points: env?.value ? env.value.points.map((p) => ({ days: p.days, rate: p.rate })) : [],
    };
  }

  static normalizeCorporateEvents(rawArray: unknown[]): CorporateEvent[] {
    const parsed = parseCorporateEvents(rawArray);
    if (!parsed.ok) {
      return [];
    }
    const env = normalizeCorporateEventsPackage(parsed.data, { quality: "valid", reasons: [] });
    if (!env?.value) return [];
    return env.value.map((e) => ({
      ticker: e.ticker,
      type: e.type === "DIVIDEND" ? "dividendo" : "outro",
      valueOrRatio: e.valueOrRatio,
      exDate: new Date(e.exDate),
      paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
    }));
  }
}
