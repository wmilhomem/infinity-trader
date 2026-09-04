/**
 * Y.3.3 — Greeks Reader Contract Tests
 *
 * Tests Delta, Gamma, Theta, Vega reading contracts:
 * - Reads from Y.2 MarketContext (no recalculation)
 * - Greek absent remains null (not invented)
 * - Greek observed preserves origin
 * - Greek calculated preserves method
 * - Greek estimated continues as estimated
 * - Quality suspicious propagated
 * - Provenance preserved
 * - Null semantics preserved
 * - Anti-recommendation: no greek as directional signal
 */

import { describe, test, expect } from "vitest";
import { buildGreeksReading } from "../src/lib/greeks-reader";
import { buildMarketContext } from "../src/lib/market-context-builder";

const NOW = "2026-09-01T19:00:00.000Z";

function makeContractsWithGreeks() {
  return [
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
    {
      symbol: "PETR4",
      strike: 36.0,
      type: "put" as const,
      expiration: "2026-09-18",
      daysToExpiration: 17,
      bid: 0.42,
      ask: 0.45,
      impliedVolatility: {
        value: 0.342,
        provenance: { origin: "observed" as const, source: "yahoo-finance", calculatedAt: NOW },
      },
      delta: {
        value: -0.234,
        provenance: {
          origin: "calculated" as const,
          method: "black-scholes-bsm",
          calculatedAt: NOW,
        },
      },
      gamma: {
        value: 0.039,
        provenance: {
          origin: "calculated" as const,
          method: "black-scholes-bsm",
          calculatedAt: NOW,
        },
      },
      theta: {
        value: -0.015,
        provenance: {
          origin: "calculated" as const,
          method: "black-scholes-bsm",
          calculatedAt: NOW,
        },
      },
      vega: {
        value: 0.21,
        provenance: {
          origin: "calculated" as const,
          method: "black-scholes-bsm",
          calculatedAt: NOW,
        },
      },
    },
  ];
}

describe("Y.3.3 — Greeks Reader", () => {
  describe("Greek facts extraction", () => {
    test("delta extracted from contract", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const deltas = reading.facts.filter((f) => f.greek === "delta");
      expect(deltas.length).toBe(2);
    });

    test("gamma extracted from contract", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const gammas = reading.facts.filter((f) => f.greek === "gamma");
      expect(gammas.length).toBe(2);
    });

    test("theta extracted from contract", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const thetas = reading.facts.filter((f) => f.greek === "theta");
      expect(thetas.length).toBe(2);
    });

    test("vega extracted from contract", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const vegas = reading.facts.filter((f) => f.greek === "vega");
      expect(vegas.length).toBe(2);
    });

    test("strike and optionType preserved in fact", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const callDelta = reading.facts.find((f) => f.greek === "delta" && f.optionType === "CALL");
      expect(callDelta!.strike).toBe(38.5);
      expect(callDelta!.optionType).toBe("CALL");
      const putDelta = reading.facts.find((f) => f.greek === "delta" && f.optionType === "PUT");
      expect(putDelta!.strike).toBe(36.0);
      expect(putDelta!.optionType).toBe("PUT");
    });
  });

  describe("Null semantics", () => {
    test("greek absent remains null", () => {
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
      const reading = buildGreeksReading(ctx);
      expect(reading.facts).toHaveLength(0);
    });

    test("null context returns empty facts", () => {
      const reading = buildGreeksReading(null);
      expect(reading.facts).toEqual([]);
      expect(reading.spot).toBeNull();
    });

    test("spot and dte extracted from context", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { daysToExpiration: 17, contracts },
      });
      const reading = buildGreeksReading(ctx);
      expect(reading.spot).toBe(38.47);
      expect(reading.dte).toBe(17);
    });
  });

  describe("Provenance and quality", () => {
    test("greek calculated preserves origin=calculated", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const delta = reading.facts.find((f) => f.greek === "delta")!;
      expect(delta.origin).toBe("calculated");
    });

    test("greek observed preserves origin", () => {
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
            provenance: { origin: "observed" as const, source: "provider", calculatedAt: NOW },
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
      const reading = buildGreeksReading(ctx);
      const delta = reading.facts.find((f) => f.greek === "delta")!;
      expect(delta.origin).toBe("observed");
    });

    test("greek estimated continues as estimated", () => {
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
      const reading = buildGreeksReading(ctx);
      const delta = reading.facts.find((f) => f.greek === "delta")!;
      expect(delta.origin).toBe("estimated");
    });

    test("suspicious greek value propagates quality=suspicious", () => {
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
            value: 15,
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
      const reading = buildGreeksReading(ctx);
      const delta = reading.facts.find((f) => f.greek === "delta")!;
      expect(delta.quality).toBe("suspicious");
    });

    test("valid greek propagates quality=valid", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const delta = reading.facts.find((f) => f.greek === "delta")!;
      expect(delta.quality).toBe("valid");
    });
  });

  describe("Value formatting", () => {
    test("delta formatted as decimal (3 places)", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const callDelta = reading.facts.find((f) => f.greek === "delta" && f.optionType === "CALL")!;
      expect(callDelta.valueFormatted).toBe("0.512");
      expect(callDelta.value).toBeCloseTo(0.512, 3);
    });

    test("theta formatted with R$/dia unit", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const theta = reading.facts.find((f) => f.greek === "theta")!;
      expect(theta.unit).toBe("R$/dia");
    });

    test("vega formatted with R$/1% unit", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const vega = reading.facts.find((f) => f.greek === "vega")!;
      expect(vega.unit).toBe("R$/1%");
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("no directional language in greek labels", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const directionalKeywords = [
        "buy",
        "sell",
        "compra",
        "venda",
        "long",
        "short",
        "alta",
        "queda",
        "direção",
        "direcional",
        "entrada",
        "saída",
        "bom",
        "ruim",
        "melhor",
        "pior",
      ];
      for (const fact of reading.facts) {
        const text = `${fact.label} ${fact.valueFormatted} ${fact.greek}`;
        for (const kw of directionalKeywords) {
          expect(text.toLowerCase()).not.toContain(kw);
        }
      }
    });

    test("no greek describes opportunity", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const opportunityKeywords = [
        "oportunidade",
        "opportunity",
        "interessante",
        "ideal",
        "perfeito",
      ];
      for (const fact of reading.facts) {
        const text = `${fact.label} ${fact.greek}`;
        for (const kw of opportunityKeywords) {
          expect(text.toLowerCase()).not.toContain(kw);
        }
      }
    });

    test("delta is not presented as directional signal", () => {
      const contracts = makeContractsWithGreeks();
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts },
      });
      const reading = buildGreeksReading(ctx);
      const delta = reading.facts.find((f) => f.greek === "delta")!;
      const directionalKeywords = ["alta", "queda", "bullish", "bearish", "direcional"];
      const deltaText = `delta:${delta.value}`;
      for (const kw of directionalKeywords) {
        expect(deltaText.toLowerCase()).not.toContain(kw);
      }
    });
  });
});
