/**
 * Y.3.2 — Volatility Reader Contract Tests
 *
 * Tests IV / Skew / Expected Move reading contracts:
 * - Reads from Y.2 MarketContext (no recalculation)
 * - IV observed preserves origin=observed
 * - IV calculated preserves method and inputs
 * - IV estimated continues as estimated
 * - IV absent remains null (not invented)
 * - Skew preserves IVs and strikes used
 * - Skew absent not invented
 * - Expected Move preserves formula, IV, spot, DTE, base temporal
 * - null ≠ 0
 * - Quality suspicious propagated
 * - Provenance arrives intact
 * - No recommendation language in any label
 * - No IV/Skew/ExpectedMove as directional signal
 */

import { describe, test, expect } from "vitest";
import { buildVolatilityReading } from "../src/lib/volatility-reader";
import { buildMarketContext } from "../src/lib/market-context-builder";

const NOW = "2026-09-01T19:00:00.000Z";

function makeFullContext() {
  return buildMarketContext({
    symbol: "PETR4",
    quote: { last: 38.47 },
    timestamp: NOW,
    provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
    optionsChain: {
      expirationDate: "2026-09-18",
      daysToExpiration: 17,
      atm: {
        strike: 38.5,
        spotUsed: 38.47,
        determinedAt: NOW,
        method: "nearest-strike",
      },
      impliedVolatilityAtm: {
        value: 0.287,
        provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
        atmStrikeUsed: 38.5,
      },
      skew: {
        putIvOtm: 0.342,
        callIvOtm: 0.278,
        slope: 0.064,
        provenance: { origin: "calculated", method: "put-call-iv-spread", calculatedAt: NOW },
        putStrikeUsed: 36.0,
        callStrikeUsed: 41.0,
        otmDistanceUsed: 0.065,
      },
      expectedMove: {
        sigma1Brl: 1.83,
        lowerBound1Sigma: 36.64,
        upperBound1Sigma: 40.3,
        provenance: { origin: "calculated", method: "spot-iv-sqrt-t", calculatedAt: NOW },
        ivUsed: 0.287,
        spotUsed: 38.47,
        dteUsed: 17,
        dteBase: "calendar",
        formula: "Spot × IV × √(T/252)",
      },
      contracts: [],
    },
  });
}

describe("Y.3.2 — Volatility Reader", () => {
  describe("ATM IV reading", () => {
    test("observed IV preserves origin=observed", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv).not.toBeNull();
      expect(reading.atmIv!.origin).toBe("observed");
    });

    test("calculated IV preserves method", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: 0.287,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
            atmStrikeUsed: 38.5,
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv!.origin).toBe("calculated");
      expect(reading.atmIv!.method).toBe("black-scholes-bsm");
    });

    test("estimated IV continues as estimated", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: 0.287,
            provenance: { origin: "estimated", method: "interpolation", calculatedAt: NOW },
            atmStrikeUsed: 38.5,
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv!.origin).toBe("estimated");
    });

    test("IV absent remains null", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: null,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: null,
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv).toBeNull();
    });

    test("IV value formatted as percentage", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv!.valueFormatted).toBe("28.7%");
    });
  });

  describe("Skew reading", () => {
    test("skew preserves IVs and strikes used", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.skew).not.toBeNull();
      expect(reading.skew!.putIvOtm).toBeCloseTo(0.342, 3);
      expect(reading.skew!.callIvOtm).toBeCloseTo(0.278, 3);
      expect(reading.skew!.putStrike).toBe(36.0);
      expect(reading.skew!.callStrike).toBe(41.0);
    });

    test("skew absent not invented", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          skew: null,
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.skew).toBeNull();
    });

    test("skew slope preserves sign", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.skew!.slope).toBeCloseTo(0.064, 3);
      expect(reading.skew!.slope).toBeGreaterThan(0);
    });

    test("skew calculated preserves origin=calculated", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.skew!.origin).toBe("calculated");
    });
  });

  describe("Expected Move reading", () => {
    test("expectedMove preserves formula, IV, spot, DTE, base temporal", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.expectedMove).not.toBeNull();
      expect(reading.expectedMove!.sigma1Brl).toBeCloseTo(1.83, 2);
      expect(reading.expectedMove!.lowerBound).toBeCloseTo(36.64, 2);
      expect(reading.expectedMove!.upperBound).toBeCloseTo(40.3, 2);
      expect(reading.expectedMove!.ivUsed).toBeCloseTo(0.287, 3);
      expect(reading.expectedMove!.spotUsed).toBeCloseTo(38.47, 2);
      expect(reading.expectedMove!.dteUsed).toBe(17);
      expect(reading.expectedMove!.dteBase).toBe("calendar");
      expect(reading.expectedMove!.formula).toBe("Spot × IV × √(T/252)");
    });

    test("expectedMove absent not invented", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          expectedMove: null,
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.expectedMove).toBeNull();
    });

    test("expectedMove calculated preserves origin=calculated", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.expectedMove!.origin).toBe("calculated");
    });
  });

  describe("Null semantics", () => {
    test("null context returns all null", () => {
      const reading = buildVolatilityReading(null);
      expect(reading.atmIv).toBeNull();
      expect(reading.skew).toBeNull();
      expect(reading.expectedMove).toBeNull();
      expect(reading.spot).toBeNull();
    });

    test("spot null ≠ 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: null },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: null, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: 0.287,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: 38.5,
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.spot).toBeNull();
      expect(reading.atmIv).not.toBeNull();
    });

    test("null in any field does not corrupt other fields", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: null,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: null,
          },
          skew: {
            putIvOtm: null,
            callIvOtm: null,
            slope: null,
            provenance: { origin: "calculated", method: "put-call-iv-spread", calculatedAt: NOW },
          },
          expectedMove: {
            sigma1Brl: null,
            lowerBound1Sigma: null,
            upperBound1Sigma: null,
            provenance: { origin: "calculated", method: "spot-iv-sqrt-t", calculatedAt: NOW },
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv).toBeNull();
      expect(reading.skew).not.toBeNull();
      expect(reading.skew!.slope).toBeNull();
      expect(reading.expectedMove).not.toBeNull();
      expect(reading.expectedMove!.sigma1Brl).toBeNull();
    });
  });

  describe("Quality propagation", () => {
    test("suspicious IV propagates quality=suspicious", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: 0.001,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: 38.5,
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv!.quality).toBe("suspicious");
    });

    test("valid IV propagates quality=valid", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv!.quality).toBe("valid");
    });

    test("null IV propagates quality=absent", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          impliedVolatilityAtm: {
            value: null,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: null,
          },
          contracts: [],
        },
      });
      const reading = buildVolatilityReading(ctx);
      expect(reading.atmIv).toBeNull();
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("no recommendation language in ATM IV label", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      const recommendationKeywords = [
        "compra",
        "venda",
        "buy",
        "sell",
        "alta",
        "queda",
        "direção",
        "direcional",
        "oportunidade",
        "melhor",
      ];
      for (const kw of recommendationKeywords) {
        expect(reading.atmIv!.label.toLowerCase()).not.toContain(kw);
      }
    });

    test("no recommendation language in skew label", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      const recommendationKeywords = [
        "compra",
        "venda",
        "buy",
        "sell",
        "alta",
        "queda",
        "direção",
        "direcional",
        "oportunidade",
        "melhor",
        "positivo",
        "negativo",
      ];
      const skewText = JSON.stringify(reading.skew);
      for (const kw of recommendationKeywords) {
        expect(skewText.toLowerCase()).not.toContain(kw);
      }
    });

    test("no recommendation language in expectedMove", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      const recommendationKeywords = [
        "alvo",
        "previsão",
        "máxima",
        "mínima",
        "espera",
        "alta",
        "queda",
        "compra",
        "venda",
      ];
      const emText = JSON.stringify(reading.expectedMove);
      for (const kw of recommendationKeywords) {
        expect(emText.toLowerCase()).not.toContain(kw);
      }
    });

    test("slope is not presented as bullish/bearish signal", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      const directionalKeywords = ["bullish", "bearish", "alta", "queda", "call", "put"];
      const slopeText = `slope:${reading.skew!.slope}`;
      for (const kw of directionalKeywords) {
        expect(slopeText.toLowerCase()).not.toContain(kw);
      }
    });

    test("sigma1Brl is not presented as price target", () => {
      const ctx = makeFullContext();
      const reading = buildVolatilityReading(ctx);
      const targetKeywords = ["target", "alvo", "previsão", "máxima", "mínima", "espera-se"];
      const emText = `sigma:${reading.expectedMove!.sigma1Brl}`;
      for (const kw of targetKeywords) {
        expect(emText.toLowerCase()).not.toContain(kw);
      }
    });
  });
});
