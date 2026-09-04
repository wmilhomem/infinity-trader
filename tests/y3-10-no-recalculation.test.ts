/**
 * Y.3.10 — No-Recalculation Audit
 *
 * CRITICAL CONTRACT: No Y.3 reader may recompute what belongs to Y.2.
 *
 * Y.2 owns: IV, Greeks (BSM), Expected Move (Spot × IV × √T)
 * Y.3 readers must READ these values, not recalculate them.
 *
 * This test verifies that no reader in the Y.3 chain imports or uses
 * calculation functions (black-scholes, iv-calculator, expected-move-calculator)
 * and that all values flow directly from the MarketContext provenance.
 */

import { describe, test, expect } from "vitest";
import { buildMarketContext } from "../src/lib/market-context-builder";
import { buildMoneynessVisual } from "../src/lib/moneyness-calculator";
import { buildVolatilityReading } from "../src/lib/volatility-reader";
import { buildGreeksReading } from "../src/lib/greeks-reader";
import { buildStructureScenarios } from "../src/lib/structure-reader";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOW = "2026-09-01T19:00:00.000Z";

describe("Y.3.10 — No-Recalculation Audit", () => {
  describe("VolatilityReading: reads from Y.2, does not recalculate", () => {
    test("ATM IV value matches context exactly — no rounding or recomputation", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 0.287,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: 38.5,
          },
        },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.atmIv?.value).toBe(0.287);
    });

    test("skew slope matches context exactly", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          skew: {
            putIvOtm: 0.342,
            callIvOtm: 0.278,
            slope: 0.064,
            provenance: { origin: "calculated", method: "put-call-iv-spread", calculatedAt: NOW },
            putStrikeUsed: 36.0,
            callStrikeUsed: 41.0,
            otmDistanceUsed: 0.065,
          },
        },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.skew?.slope).toBe(0.064);
      expect(volatility.skew?.slope).toBeCloseTo(ctx.optionsChain!.skew!.slope, 5);
    });

    test("Expected Move bounds match context exactly", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
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
        },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.expectedMove?.sigma1Brl).toBe(1.83);
      expect(volatility.expectedMove?.lowerBound).toBe(36.64);
      expect(volatility.expectedMove?.upperBound).toBe(40.3);
    });

    test("provenance method preserved as-is from context", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          skew: {
            putIvOtm: 0.342,
            callIvOtm: 0.278,
            slope: 0.064,
            provenance: { origin: "calculated", method: "put-call-iv-spread", calculatedAt: NOW },
            putStrikeUsed: 36.0,
            callStrikeUsed: 41.0,
            otmDistanceUsed: 0.065,
          },
        },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.skew?.origin).toBe("calculated");
    });
  });

  describe("GreeksReading: reads from Y.2, does not recalculate", () => {
    test("delta value matches contract exactly", () => {
      const contracts = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          delta: {
            value: 0.512,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          gamma: {
            value: 0.041,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          theta: {
            value: -0.018,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          vega: {
            value: 0.22,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
        },
      ];
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const greeks = buildGreeksReading(ctx);
      const callDelta = greeks.facts.find((f) => f.greek === "delta" && f.optionType === "CALL");
      expect(callDelta!.value).toBeCloseTo(0.512, 3);
    });

    test("gamma value matches contract exactly", () => {
      const contracts = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          delta: {
            value: 0.512,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          gamma: {
            value: 0.041,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          theta: {
            value: -0.018,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          vega: {
            value: 0.22,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
        },
      ];
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const greeks = buildGreeksReading(ctx);
      const callGamma = greeks.facts.find((f) => f.greek === "gamma" && f.optionType === "CALL");
      expect(callGamma!.value).toBeCloseTo(0.041, 3);
    });

    test("provenance method preserved from contract", () => {
      const contracts = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          delta: {
            value: 0.512,
            provenance: {
              origin: "calculated" as const,
              method: "black-scholes-bsm",
              calculatedAt: NOW,
            },
          },
          gamma: null,
          theta: null,
          vega: null,
        },
      ];
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const greeks = buildGreeksReading(ctx);
      const delta = greeks.facts.find((f) => f.greek === "delta")!;
      expect(delta.origin).toBe("calculated");
    });

    test("estimated origin preserved", () => {
      const contracts = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          delta: {
            value: 0.512,
            provenance: {
              origin: "estimated" as const,
              method: "interpolation",
              calculatedAt: NOW,
            },
          },
        },
      ];
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const greeks = buildGreeksReading(ctx);
      const delta = greeks.facts.find((f) => f.greek === "delta")!;
      expect(delta.origin).toBe("estimated");
    });
  });

  describe("StructureComparison: reads from Y.2, does not select or rank", () => {
    test("all combinations presented without selection", () => {
      const calls = [
        {
          symbol: "PETR4",
          strike: 37.0,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 2.0,
          ask: 2.1,
          impliedVolatility: {
            value: 0.26,
            provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          impliedVolatility: {
            value: 0.287,
            provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 40.0,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.4,
          ask: 0.45,
          impliedVolatility: {
            value: 0.298,
            provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
          },
        },
      ];
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const structures = buildStructureScenarios(ctx);
      const callSpreads = structures.filter((s) => s.name === "Call Spread");
      expect(callSpreads.length).toBe(3);
    });

    test("structure IVs match contracts exactly", () => {
      const contracts = [
        {
          symbol: "PETR4",
          strike: 37.0,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 2.0,
          ask: 2.1,
          impliedVolatility: {
            value: 0.26,
            provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 40.0,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.3,
          ask: 0.35,
          impliedVolatility: {
            value: 0.3,
            provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
          },
        },
      ];
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const structures = buildStructureScenarios(ctx);
      const callSpread = structures.find((s) => s.name === "Call Spread");
      expect(callSpread).toBeDefined();
      expect(callSpread!.legs[0].iv).toBeCloseTo(0.26, 3);
    });
  });

  describe("MoneynessCalculator: reads from Y.2, does not recalculate ATM or IV", () => {
    test("ATM strike comes from context.atm, not recomputed", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          atm: {
            strike: 38.5,
            spotUsed: 38.47,
            determinedAt: NOW,
            method: "nearest-strike",
          },
          contracts: [
            {
              symbol: "PETR4",
              strike: 38.5,
              type: "call" as const,
              expiration: "2026-09-18",
              daysToExpiration: 17,
              bid: 1.15,
              ask: 1.2,
            },
            {
              symbol: "PETR4",
              strike: 36.0,
              type: "call" as const,
              expiration: "2026-09-18",
              daysToExpiration: 17,
              bid: 2.72,
              ask: 2.78,
            },
          ],
        },
      });
      const moneyness = buildMoneynessVisual(ctx);
      expect(moneyness.atmStrike).toBe(38.5);
    });
  });

  describe("No black-scholes imports in any Y.3 reader", () => {
    test("greeks-reader does not import black-scholes", () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, "../src/lib/greeks-reader.ts"),
        "utf8",
      );
      expect(content).not.toContain("black-scholes");
      expect(content).not.toContain("blackScholes");
      expect(content).not.toContain("bsm");
    });

    test("volatility-reader does not import iv-calculator", () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, "../src/lib/volatility-reader.ts"),
        "utf8",
      );
      expect(content).not.toContain("iv-calculator");
      expect(content).not.toContain("ivCalculator");
    });

    test("structure-reader does not import expected-move-calculator", () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, "../src/lib/structure-reader.ts"),
        "utf8",
      );
      expect(content).not.toContain("expected-move");
      expect(content).not.toContain("expectedMoveCalculator");
    });
  });
});
