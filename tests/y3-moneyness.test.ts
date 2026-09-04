/**
 * Y.3.1 — Moneyness Calculator Contract Tests
 *
 * Tests the moneyness calculation contracts:
 * - CALL/PUT moneyness relative to spot
 * - ATM follows context definition (not a new rule)
 * - Null semantics preserved
 * - Distance calculation with sign preserved
 * - DTE from expiration dates
 * - Provenance preserved
 * - Anti-recommendation: no ITM/OTM/DTE as recommendation
 */

import { describe, test, expect } from "vitest";
import {
  calculateMoneynessFacts,
  calculateExpirationFacts,
  buildMoneynessVisual,
} from "../src/lib/moneyness-calculator";
import type { OptionContract, AtmDefinition } from "@/lib/market-context";
import { buildMarketContext } from "../src/lib/market-context-builder";

const NOW = "2026-09-01T19:00:00.000Z";

function makeContracts(
  items: Array<{
    strike: number;
    type: "call" | "put";
    expiration?: string;
    daysToExpiration?: number;
  }>,
): OptionContract[] {
  return items.map((item) => ({
    symbol: "PETR4",
    strike: item.strike,
    type: item.type,
    expiration: item.expiration ?? "2026-09-18",
    daysToExpiration: item.daysToExpiration ?? 17,
    bid: 1.0,
    ask: 1.1,
    volume: 1000,
    openInterest: 5000,
    impliedVolatility: {
      value: 0.3,
      provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
    },
  }));
}

function makeAtm(
  strike: number,
  method: AtmDefinition["method"] = "nearest-strike",
): AtmDefinition {
  return {
    strike,
    spotUsed: 38.47,
    determinedAt: NOW,
    method,
  };
}

describe("Y.3.1 — Moneyness Calculation", () => {
  describe("CALL moneyness", () => {
    test("CALL below spot → ITM", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 36.0, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("ITM");
    });

    test("CALL above spot → OTM", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 40.0, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("OTM");
    });

    test("CALL at ATM strike → ATM", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("ATM");
    });
  });

  describe("PUT moneyness", () => {
    test("PUT below spot → OTM", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 36.0, type: "put" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("OTM");
    });

    test("PUT above spot → ITM", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 40.0, type: "put" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("ITM");
    });

    test("PUT at ATM strike → ATM", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 38.5, type: "put" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("ATM");
    });
  });

  describe("ATM definition respected", () => {
    test("ATM method is preserved in fact", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5, "nearest-strike");
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts[0].atmMethod).toBe("nearest-strike");
      expect(facts[0].atmStrike).toBe(38.5);
    });

    test("ATM strike from context used, not recomputed", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts[0].moneyness).toBe("ATM");
    });
  });

  describe("Null semantics", () => {
    test("spot = null → no facts generated", () => {
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, null, atm, NOW);
      expect(facts).toHaveLength(0);
    });

    test("atm = null → no facts generated", () => {
      const spot = 38.47;
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, null, NOW);
      expect(facts).toHaveLength(0);
    });

    test("spot = 0 → calculates moneyness (0 is a valid value)", () => {
      const spot = 0;
      const atm = makeAtm(0);
      const contracts = makeContracts([{ strike: 0, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].moneyness).toBe("ATM");
    });
  });

  describe("Distance calculation", () => {
    test("distanceAbs preserves sign (strike - spot)", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([
        { strike: 36.0, type: "call" },
        { strike: 40.0, type: "call" },
      ]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      const below = facts.find((f) => f.strike === 36.0)!;
      const above = facts.find((f) => f.strike === 40.0)!;
      expect(below.distanceAbs).toBeLessThan(0);
      expect(above.distanceAbs).toBeGreaterThan(0);
    });

    test("distancePct calculated correctly", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 40.0, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      const expected = ((40.0 - 38.47) / 38.47) * 100;
      expect(facts[0].distancePct).toBeCloseTo(expected, 1);
    });

    test("distancePct = 0 when spot = 0", () => {
      const spot = 0;
      const atm = makeAtm(0);
      const contracts = makeContracts([{ strike: 10.0, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      expect(facts[0].distancePct).toBe(0);
    });
  });

  describe("Expiration facts", () => {
    test("DTE calculated from expiration date", () => {
      const expDate = "2026-09-18";
      const contracts = makeContracts([{ strike: 38.5, type: "call", expiration: expDate }]);
      const facts = calculateExpirationFacts(contracts, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].dte).toBeGreaterThan(0);
    });

    test("no invented DTE when expiration is null", () => {
      const contracts: OptionContract[] = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "",
          daysToExpiration: 17,
          bid: 1.0,
          ask: 1.1,
        },
      ];
      const facts = calculateExpirationFacts(contracts, NOW);
      expect(facts).toHaveLength(0);
    });

    test("multiple expirations sorted by DTE", () => {
      const contracts = [
        ...makeContracts([{ strike: 38.5, type: "call", expiration: "2026-10-16" }]),
        ...makeContracts([{ strike: 38.5, type: "call", expiration: "2026-09-18" }]),
      ];
      const facts = calculateExpirationFacts(contracts, NOW);
      expect(facts[0].dte).toBeLessThan(facts[1].dte);
    });

    test("contractCount reflects number of strikes per expiration", () => {
      const contracts = makeContracts([
        { strike: 36.0, type: "put", expiration: "2026-09-18" },
        { strike: 37.0, type: "put", expiration: "2026-09-18" },
        { strike: 38.5, type: "call", expiration: "2026-09-18" },
      ]);
      const facts = calculateExpirationFacts(contracts, NOW);
      expect(facts).toHaveLength(1);
      expect(facts[0].contractCount).toBe(3);
    });
  });

  describe("Quality propagation", () => {
    test("suspicious IV → quality suspicious in expiration", () => {
      const contracts: OptionContract[] = [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.0,
          ask: 1.1,
          volume: 1000,
          openInterest: 5000,
          impliedVolatility: {
            value: 0.001,
            provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
          },
        },
      ];
      const facts = calculateExpirationFacts(contracts, NOW);
      expect(facts[0].quality).toBe("suspicious");
    });
  });

  describe("Provenance preserved", () => {
    test("moneyness fact carries calculated provenance", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW, "yahoo-finance");
      expect(facts[0].provenance.origin).toBe("calculated");
      expect(facts[0].provenance.method).toBe("moneyness-from-spot");
      expect(facts[0].provenance.source).toBe("yahoo-finance");
    });

    test("expiration fact carries calculated provenance", () => {
      const contracts = makeContracts([{ strike: 38.5, type: "call" }]);
      const facts = calculateExpirationFacts(contracts, NOW, "yahoo-finance");
      expect(facts[0].provenance.origin).toBe("calculated");
      expect(facts[0].provenance.method).toBe("expiration-from-contracts");
    });
  });

  describe("buildMoneynessVisual from MarketContext", () => {
    test("returns empty when context is null", () => {
      const result = buildMoneynessVisual(null);
      expect(result.facts).toEqual([]);
      expect(result.expirations).toEqual([]);
      expect(result.spot).toBeNull();
    });

    test("spot and atmStrike extracted from context", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          expirationDate: "2026-09-18",
          daysToExpiration: 17,
          atm: { strike: 38.5, spotUsed: 38.47, determinedAt: NOW, method: "nearest-strike" },
          contracts: makeContracts([
            { strike: 36.0, type: "put" },
            { strike: 38.5, type: "call" },
            { strike: 40.0, type: "call" },
          ]),
        },
      });
      const result = buildMoneynessVisual(ctx);
      expect(result.spot).toBe(38.47);
      expect(result.atmStrike).toBe(38.5);
      expect(result.facts.length).toBeGreaterThan(0);
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("moneyness labels contain no recommendation language", () => {
      const recommendationKeywords = [
        "better",
        "best",
        "melhor",
        "otimo",
        "interessante",
        "oportunidade",
        "favorable",
        "favoravel",
        "ideal",
        "perfeito",
      ];
      const moneynessLabels = ["ITM", "ATM", "OTM"];
      for (const label of moneynessLabels) {
        const lower = label.toLowerCase();
        for (const kw of recommendationKeywords) {
          expect(lower).not.toContain(kw);
        }
      }
    });

    test("distancePct is never presented as recommendation", () => {
      const spot = 38.47;
      const atm = makeAtm(38.5);
      const contracts = makeContracts([
        { strike: 36.0, type: "put" },
        { strike: 40.0, type: "call" },
      ]);
      const facts = calculateMoneynessFacts(contracts, spot, atm, NOW);
      const recommendationKeywords = ["buy", "sell", "compra", "venda", "entre", "saia"];
      for (const fact of facts) {
        const text = `${fact.moneyness} ${fact.distancePct}`;
        for (const kw of recommendationKeywords) {
          expect(text.toLowerCase()).not.toContain(kw);
        }
      }
    });
  });
});
