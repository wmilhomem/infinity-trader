/**
 * Y.2.3 — TESTES DO NORMALIZER
 */
import { describe, test, expect } from "vitest";
import {
  normalizeAssetPackage,
  normalizeOptionChainPackage,
  normalizeDICurvePackage,
  normalizeCorporateEventsPackage,
  makeObservedProvenance,
  makeCalculatedProvenance,
} from "../src/lib/market-data/normalizer";
import { combineAssessments, schemaErrorAssessment } from "../src/lib/market-data/validators";
import type { RawAsset, RawOptionChain } from "../src/market/raw-types";

const NOW = "2026-09-02T12:00:00.000Z";

const observedProv = makeObservedProvenance("yahoo-finance", NOW);

describe("Y.2.3 — normalizer", () => {
  describe("normalizeAssetPackage", () => {
    test("Yahoo entregou last → origin observed, source yahoo-finance", () => {
      const raw: RawAsset = {
        ticker: "PETR4",
        symbol: "PETR4.SA",
        name: "Petrobras",
        price: 38.5,
        lastUpdate: Date.parse(NOW),
        realizedVol: 0.25,
        ivRank: 42,
      };
      const env = normalizeAssetPackage(raw, { quality: "valid", reasons: [] }, observedProv);
      expect(env).not.toBeNull();
      expect(env!.value?.price).toBe(38.5);
      expect(env!.provenance.origin).toBe("observed");
      expect(env!.provenance.source).toBe("yahoo-finance");
      expect(env!.quality).toBe("valid");
    });

    test("price=0 legítimo preservado com quality suspicious", () => {
      const raw: RawAsset = {
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 0,
        lastUpdate: Date.parse(NOW),
        realizedVol: null,
        ivRank: null,
      };
      const env = normalizeAssetPackage(raw, { quality: "valid", reasons: [] }, observedProv);
      // price=0 vira suspicious (não vira null)
      expect(env!.value?.price).toBe(0);
      expect(env!.value?.price).not.toBeNull();
      expect(env!.quality).toBe("suspicious");
      expect(env!.reasons).toContain("zero-price");
    });

    test("ivRank null → quality absent, reason not-provided-by-source", () => {
      const raw: RawAsset = {
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 10,
        lastUpdate: Date.parse(NOW),
        realizedVol: 0.2,
        ivRank: null,
      };
      const env = normalizeAssetPackage(raw, { quality: "valid", reasons: [] }, observedProv);
      expect(env!.value?.ivRank).toBeNull();
      expect(env!.quality).toBe("absent");
      expect(env!.absenceReason).toBe("not-provided-by-source");
    });

    test("ivRank 0 (zero legítimo) preservado, não vira null", () => {
      const raw: RawAsset = {
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 10,
        lastUpdate: Date.parse(NOW),
        realizedVol: 0.2,
        ivRank: 0,
      };
      const env = normalizeAssetPackage(raw, { quality: "valid", reasons: [] }, observedProv);
      expect(env!.value?.ivRank).toBe(0);
      expect(env!.value?.ivRank).not.toBeNull();
    });

    test("raw null → envelope com value null", () => {
      const env = normalizeAssetPackage(
        null,
        { quality: "absent", absenceReason: "not-provided-by-source", reasons: [] },
        observedProv,
      );
      expect(env!.value).toBeNull();
      expect(env!.quality).toBe("absent");
    });

    test("schema-error → quality invalid", () => {
      const raw = { ticker: "X" } as unknown as RawAsset; // faltam campos
      const assessment = schemaErrorAssessment(["price missing", "lastUpdate missing"]);
      const env = normalizeAssetPackage(raw, assessment, observedProv);
      // Como o raw é parcial, value será criado mesmo assim, mas com assessment invalid
      expect(env!.quality).toBe("invalid");
      expect(env!.absenceReason).toBe("schema-error");
    });
  });

  describe("normalizeOptionChainPackage", () => {
    const futureExp = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);

    test("source yahoo → provenance observed", () => {
      const raw: RawOptionChain = {
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "yahoo",
        contracts: [
          {
            symbol: "PETR4A38",
            strikePrice: 38,
            right: "C",
            expiration: futureExp,
            bid: 1.0,
            ask: 1.2,
            last: 1.1,
            impliedVolatility: 0.3,
          },
        ],
      };
      const env = normalizeOptionChainPackage(raw, { quality: "valid", reasons: [] }, 38.5);
      expect(env!.provenance.origin).toBe("observed");
      expect(env!.provenance.source).toBe("yahoo-finance");
      expect(env!.value?.contracts.length).toBe(1);
    });

    test("source modelo → provenance calculated + method black-scholes-bsm", () => {
      const raw: RawOptionChain = {
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "modelo",
        contracts: [],
      };
      const env = normalizeOptionChainPackage(raw, { quality: "valid", reasons: [] }, 38.5);
      expect(env!.provenance.origin).toBe("calculated");
      expect(env!.provenance.method).toBe("black-scholes-bsm");
      expect(env!.provenance.inputs?.spot).toBe(38.5);
    });

    test("contrato com bid > ask é filtrado (não silenciado)", () => {
      const raw: RawOptionChain = {
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "yahoo",
        contracts: [
          {
            symbol: "PETR4A38",
            strikePrice: 38,
            right: "C",
            expiration: futureExp,
            bid: 1.3, // > ask
            ask: 1.2,
            last: 1.25,
          },
          {
            symbol: "PETR4A40",
            strikePrice: 40,
            right: "C",
            expiration: futureExp,
            bid: 0.5,
            ask: 0.7,
            last: 0.6,
          },
        ],
      };
      const env = normalizeOptionChainPackage(raw, { quality: "valid", reasons: [] }, 38.5);
      // 1 contrato filtrado (crossed), 1 mantido
      expect(env!.value?.contracts.length).toBe(1);
      expect(env!.reasons).toContain("crossed-book");
    });

    test("contratos com expiration passada são filtrados", () => {
      const raw: RawOptionChain = {
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "yahoo",
        contracts: [
          {
            symbol: "EXPIRED",
            strikePrice: 38,
            right: "C",
            expiration: "2020-01-01",
            bid: 1.0,
            ask: 1.2,
            last: 1.1,
          },
        ],
      };
      const env = normalizeOptionChainPackage(raw, { quality: "valid", reasons: [] }, 38.5);
      expect(env!.value?.contracts.length).toBe(0);
      expect(env!.quality).toBe("absent");
    });

    test("contrato com bid=0 preservado como suspicious", () => {
      const raw: RawOptionChain = {
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "yahoo",
        contracts: [
          {
            symbol: "PETR4A38",
            strikePrice: 38,
            right: "C",
            expiration: futureExp,
            bid: 0,
            ask: 1.2,
            last: null,
          },
        ],
      };
      const env = normalizeOptionChainPackage(raw, { quality: "valid", reasons: [] }, 38.5);
      // bid=0 entregue vira value 0, quality suspicious (não null, não estimado)
      const c = env!.value?.contracts[0];
      expect(c?.bid).toBe(0);
      expect(c?.bid).not.toBeNull();
      expect(env!.quality).toBe("suspicious");
    });
  });

  describe("normalizeDICurvePackage", () => {
    test("raw válido → envelope com source bcb", () => {
      const env = normalizeDICurvePackage(
        [
          { days: 21, rate: 0.1065 },
          { days: 252, rate: 0.108 },
        ],
        { quality: "valid", reasons: [] },
      );
      expect(env!.value?.points.length).toBe(2);
      expect(env!.provenance.source).toBe("bcb");
    });

    test("raw null → absent", () => {
      const env = normalizeDICurvePackage(null, {
        quality: "absent",
        absenceReason: "source-unavailable",
        reasons: [],
      });
      expect(env!.value).toBeNull();
      expect(env!.absenceReason).toBe("source-unavailable");
    });
  });

  describe("normalizeCorporateEventsPackage", () => {
    test("raw válido preserva eventos", () => {
      const env = normalizeCorporateEventsPackage(
        [
          {
            ticker: "PETR4",
            type: "DIVIDEND",
            value: 1.5,
            exDate: "2026-12-15",
          },
        ],
        { quality: "valid", reasons: [] },
      );
      expect(env!.value?.length).toBe(1);
      expect(env!.value?.[0]?.type).toBe("DIVIDEND");
    });
  });

  describe("makeCalculatedProvenance", () => {
    test("registra method, inputs e calculatedAt", () => {
      const p = makeCalculatedProvenance(
        "black-scholes-bsm",
        { spot: 38.5, strike: 38, dte: 30, r: 0.1 },
        NOW,
      );
      expect(p.origin).toBe("calculated");
      expect(p.method).toBe("black-scholes-bsm");
      expect(p.inputs?.spot).toBe(38.5);
      expect(p.calculatedAt).toBe(NOW);
    });
  });
});
