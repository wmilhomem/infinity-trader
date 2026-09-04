/**
 * Y.3.10 — Null Safety Audit
 *
 * Verifies: null ≠ 0 throughout the entire Y.3 chain.
 * Every null must remain null — never defaulted to 0 or falsy.
 */

import { describe, test, expect } from "vitest";
import { buildMarketContext } from "../src/lib/market-context-builder";
import { buildMoneynessVisual } from "../src/lib/moneyness-calculator";
import { buildVolatilityReading } from "../src/lib/volatility-reader";
import { buildGreeksReading } from "../src/lib/greeks-reader";
import { buildStructureScenarios } from "../src/lib/structure-reader";
import { buildEvidenceChain } from "../src/lib/evidence-chain";
import { buildDecisionSnapshot } from "../src/lib/decision-snapshot";
import { checkRulesAgainstContext, createRiskRule } from "../src/lib/risk-rules";

const NOW = "2026-09-01T19:00:00.000Z";

describe("Y.3.10 — Null Safety Audit", () => {
  describe("null ≠ 0 in MoneynessReading", () => {
    test("null spot in context → moneyness spot is null, not 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: {},
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {},
      });
      const moneyness = buildMoneynessVisual(ctx);
      expect(moneyness.spot).toBeNull();
      expect(moneyness.spot).not.toBe(0);
    });

    test("null ATM → moneyness ATM is null", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      const moneyness = buildMoneynessVisual(ctx);
      expect(moneyness.atmStrike).toBeNull();
    });

    test("null spot → moneyness facts empty, not error", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: {},
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {},
      });
      const moneyness = buildMoneynessVisual(ctx);
      expect(moneyness.facts).toHaveLength(0);
    });
  });

  describe("null ≠ 0 in VolatilityReading", () => {
    test("null IV → volatility reading ATM is null, not 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.atmIv?.value ?? null).toBeNull();
    });

    test("null skew → skew is null, not 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.skew).toBeNull();
    });

    test("null expectedMove → expectedMove is null, not 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.expectedMove).toBeNull();
    });
  });

  describe("null ≠ 0 in GreeksReading", () => {
    test("null delta → delta fact absent, not 0", () => {
      const contracts = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call" as const,
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          delta: null,
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
      const deltas = greeks.facts.filter((f) => f.greek === "delta");
      expect(deltas).toHaveLength(0);
    });

    test("null context → GreeksReading spot is null, not 0", () => {
      const greeks = buildGreeksReading(null);
      expect(greeks.spot).toBeNull();
      expect(greeks.spot).not.toBe(0);
    });
  });

  describe("null ≠ 0 in StructureScenarios", () => {
    test("null context → empty structures, not error", () => {
      const structures = buildStructureScenarios(null);
      expect(structures).toEqual([]);
    });

    test("no contracts → empty structures", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      const structures = buildStructureScenarios(ctx);
      expect(structures).toEqual([]);
    });
  });

  describe("null ≠ 0 in DecisionSnapshot", () => {
    test("null spot → snapshot spot is null, not 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: {},
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {},
      });
      const state = { facts: [], interpretations: [], hypotheses: [], evidences: [] };
      const snapshot = buildDecisionSnapshot(ctx, state, []);
      expect(snapshot.spot).toBeNull();
      expect(snapshot.spot).not.toBe(0);
    });

    test("null IV → snapshot IV is null, not 0", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {},
      });
      const state = { facts: [], interpretations: [], hypotheses: [], evidences: [] };
      const snapshot = buildDecisionSnapshot(ctx, state, []);
      expect(snapshot.ivAtm).toBeNull();
      expect(snapshot.ivAtm).not.toBe(0);
    });
  });

  describe("null ≠ 0 in RiskChecks", () => {
    test("null context → empty checks", () => {
      const rule = createRiskRule("IV > 40%", "iv-filter");
      const checks = checkRulesAgainstContext([rule], null);
      expect(checks).toEqual([]);
    });
  });

  describe("suspicious ≠ valid", () => {
    test("suspicious IV → quality = suspicious, never valid", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 15.0,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            atmStrikeUsed: 38.5,
          },
        },
      });
      const volatility = buildVolatilityReading(ctx);
      expect(volatility.atmIv?.quality).toBe("suspicious");
      expect(volatility.atmIv?.quality).not.toBe("valid");
    });
  });
});
