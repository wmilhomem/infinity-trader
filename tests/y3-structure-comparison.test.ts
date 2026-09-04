/**
 * Y.3.4 — Structure Comparison Contract Tests
 *
 * Tests structure reader contracts:
 * - Reads from Y.2 MarketContext (no recalculation)
 * - Call spreads, put spreads, straddle, strangle detected
 * - Null semantics preserved (no contracts = no scenarios)
 * - Quality propagated from contracts
 * - Anti-recommendation: no structure as best/ideal/recommended
 */

import { describe, test, expect } from "vitest";
import { buildStructureScenarios } from "../src/lib/structure-reader";
import { buildMarketContext } from "../src/lib/market-context-builder";

const NOW = "2026-09-01T19:00:00.000Z";

function makeCalls(spot: number, strikes: number[]) {
  return strikes.map((strike) => ({
    symbol: "PETR4",
    strike,
    type: "call" as const,
    expiration: "2026-09-18",
    daysToExpiration: 17,
    bid: strike < spot ? 2.5 : 0.15,
    ask: strike < spot ? 2.6 : 0.18,
    impliedVolatility: {
      value: 0.28,
      provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
    },
    delta: {
      value: strike < spot ? 0.6 : 0.15,
      provenance: { origin: "calculated" as const, method: "black-scholes-bsm", calculatedAt: NOW },
    },
  }));
}

function makePuts(spot: number, strikes: number[]) {
  return strikes.map((strike) => ({
    symbol: "PETR4",
    strike,
    type: "put" as const,
    expiration: "2026-09-18",
    daysToExpiration: 17,
    bid: strike > spot ? 2.5 : 0.15,
    ask: strike > spot ? 2.6 : 0.18,
    impliedVolatility: {
      value: 0.31,
      provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
    },
    delta: {
      value: strike > spot ? -0.6 : -0.15,
      provenance: { origin: "calculated" as const, method: "black-scholes-bsm", calculatedAt: NOW },
    },
  }));
}

describe("Y.3.4 — Structure Comparison", () => {
  describe("Call spreads detected", () => {
    test("2 calls produce 1 call spread", () => {
      const spot = 38.5;
      const calls = makeCalls(spot, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const scenarios = buildStructureScenarios(ctx);
      const spreads = scenarios.filter((s) => s.name === "Call Spread");
      expect(spreads.length).toBe(1);
    });

    test("3 calls produce 3 call spreads (n choose 2)", () => {
      const spot = 38.5;
      const calls = makeCalls(spot, [36.0, 38.0, 40.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const scenarios = buildStructureScenarios(ctx);
      const spreads = scenarios.filter((s) => s.name === "Call Spread");
      expect(spreads.length).toBe(3);
    });

    test("call spread legs preserve strikes", () => {
      const spot = 38.5;
      const calls = makeCalls(spot, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const scenarios = buildStructureScenarios(ctx);
      const spread = scenarios.find((s) => s.name === "Call Spread")!;
      expect(spread.legs[0].strike).toBe(37.0);
      expect(spread.legs[1].strike).toBe(39.0);
    });
  });

  describe("Put spreads detected", () => {
    test("2 puts produce 1 put spread", () => {
      const spot = 38.5;
      const puts = makePuts(spot, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: puts },
      });
      const scenarios = buildStructureScenarios(ctx);
      const spreads = scenarios.filter((s) => s.name === "Put Spread");
      expect(spreads.length).toBe(1);
    });

    test("3 puts produce 3 put spreads", () => {
      const spot = 38.5;
      const puts = makePuts(spot, [36.0, 38.0, 40.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: puts },
      });
      const scenarios = buildStructureScenarios(ctx);
      const spreads = scenarios.filter((s) => s.name === "Put Spread");
      expect(spreads.length).toBe(3);
    });
  });

  describe("Straddle and Strangle detected", () => {
    test("1 call + 1 put produce straddle", () => {
      const spot = 38.5;
      const calls = makeCalls(spot, [38.0]);
      const puts = makePuts(spot, [38.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [...calls, ...puts] },
      });
      const scenarios = buildStructureScenarios(ctx);
      const straddles = scenarios.filter((s) => s.name === "Straddle");
      expect(straddles.length).toBe(1);
    });

    test("2 calls + 2 puts produce strangle", () => {
      const spot = 38.5;
      const calls = makeCalls(spot, [38.0, 40.0]);
      const puts = makePuts(spot, [36.0, 38.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: spot },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [...calls, ...puts] },
      });
      const scenarios = buildStructureScenarios(ctx);
      const strangles = scenarios.filter((s) => s.name === "Strangle");
      expect(strangles.length).toBe(1);
    });
  });

  describe("Null semantics", () => {
    test("null context returns empty", () => {
      expect(buildStructureScenarios(null)).toEqual([]);
    });

    test("no contracts returns empty", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      expect(buildStructureScenarios(ctx)).toEqual([]);
    });

    test("1 call only returns empty (needs 2 for spread)", () => {
      const calls = makeCalls(38.5, [38.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      expect(buildStructureScenarios(ctx)).toEqual([]);
    });

    test("spot preserved in scenario", () => {
      const calls = makeCalls(38.5, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const scenarios = buildStructureScenarios(ctx);
      expect(scenarios[0].spot).toBe(38.5);
    });
  });

  describe("Quality propagation", () => {
    test("valid IVs produce quality=valid", () => {
      const calls = makeCalls(38.5, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const scenarios = buildStructureScenarios(ctx);
      expect(scenarios[0].quality).toBe("valid");
    });

    test("suspicious IVs produce quality=suspicious", () => {
      const suspiciousContract = {
        symbol: "PETR4",
        strike: 38.5,
        type: "call" as const,
        expiration: "2026-09-18",
        daysToExpiration: 17,
        bid: 1.0,
        ask: 1.05,
        impliedVolatility: {
          value: 15.0,
          provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
        },
      };
      const normalContract = {
        symbol: "PETR4",
        strike: 40.0,
        type: "call" as const,
        expiration: "2026-09-18",
        daysToExpiration: 17,
        bid: 0.1,
        ask: 0.12,
        impliedVolatility: {
          value: 0.28,
          provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
        },
      };
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [suspiciousContract, normalContract] },
      });
      const scenarios = buildStructureScenarios(ctx);
      expect(scenarios[0].quality).toBe("suspicious");
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("no structure name contains recommendation language", () => {
      const calls = makeCalls(38.5, [37.0, 39.0]);
      const puts = makePuts(38.5, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [...calls, ...puts] },
      });
      const scenarios = buildStructureScenarios(ctx);
      const recommendationKeywords = [
        "ideal",
        "best",
        "recomend",
        "otimo",
        "bom",
        "perfeito",
        "melhor",
        "indicada",
        "sugeri",
        "apropriad",
      ];
      for (const scenario of scenarios) {
        for (const kw of recommendationKeywords) {
          expect(scenario.name.toLowerCase()).not.toContain(kw);
          expect(scenario.description.toLowerCase()).not.toContain(kw);
        }
      }
    });

    test("scenario description is factual, not evaluative", () => {
      const calls = makeCalls(38.5, [37.0, 39.0]);
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.5 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: calls },
      });
      const scenarios = buildStructureScenarios(ctx);
      for (const s of scenarios) {
        const text = s.description;
        expect(text).toMatch(/^\S+ \d+\.\d+ → \d+\.\d+$/);
      }
    });
  });
});
