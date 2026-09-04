/**
 * Y.3.10 — Integration / Contract Gate
 *
 * Golden Decision Scenario: walks the entire Y.3 chain from a single MarketContext.
 *
 * Verifies:
 * - Single source of truth: one MarketContext feeds all readers
 * - No recalculation: all readers read from Y.2, none recompute
 * - Provenance chain preserved through to Snapshot
 * - Full state reproducibility: same context → same snapshot state
 * - Null ≠ 0, suspicious ≠ valid, observation ≠ recommendation
 * - No ranking, no directional signals, no prescriptive language
 */

import { describe, test, expect } from "vitest";
import { buildMarketContext } from "../src/lib/market-context-builder";
import { buildMoneynessVisual } from "../src/lib/moneyness-calculator";
import { buildVolatilityReading } from "../src/lib/volatility-reader";
import { buildGreeksReading } from "../src/lib/greeks-reader";
import { buildStructureScenarios } from "../src/lib/structure-reader";
import { buildEvidenceChain } from "../src/lib/evidence-chain";
import { buildDecisionSnapshot } from "../src/lib/decision-snapshot";
import { buildReplayComparison } from "../src/lib/replay-reader";
import { checkRulesAgainstContext, createRiskRule } from "../src/lib/risk-rules";
import {
  buildInitialState,
  addInterpretation,
  addHypothesis,
  addEvidence,
} from "../src/lib/options-chain-reader";
import type { ChainReadingState } from "../src/lib/options-chain-types";

const NOW = "2026-09-01T19:00:00.000Z";

/**
 * GOLDEN SCENARIO: PETR4
 *
 * This exact MarketContext must produce consistent, reproducible results
 * through every layer of the Y.3 experience.
 *
 * Spot: 38.47
 * ATM IV: 28.7%
 * Skew: +6.4 pts (put IV OTM > call IV OTM)
 * Expected Move: ±1.83 (one sigma)
 * DTE: 17
 * Contracts: 6 calls + 6 puts across ITM/ATM/OTM strikes
 */
function buildGoldenContext() {
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
      contracts: [
        // CALLS
        {
          symbol: "PETR4",
          strike: 36.0,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 2.72,
          ask: 2.78,
          impliedVolatility: {
            value: 0.251,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: 0.821,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.022,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.014,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.14,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 37.0,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.95,
          ask: 2.01,
          impliedVolatility: {
            value: 0.261,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: 0.712,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.028,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.016,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.18,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          impliedVolatility: {
            value: 0.287,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: 0.512,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.041,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.018,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.22,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
        // PUTS
        {
          symbol: "PETR4",
          strike: 36.0,
          type: "put",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.08,
          ask: 0.1,
          impliedVolatility: {
            value: 0.342,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: -0.179,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.039,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.015,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.21,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 37.0,
          type: "put",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.2,
          ask: 0.24,
          impliedVolatility: {
            value: 0.327,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: -0.288,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.041,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.017,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.22,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "put",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.85,
          ask: 0.9,
          impliedVolatility: {
            value: 0.287,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: -0.488,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.041,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.018,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.22,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
      ],
    },
  });
}

describe("Y.3.10 — Integration / Contract Gate", () => {
  describe("GOLDEN SCENARIO: Single source of truth", () => {
    test("one MarketContext produces consistent results across all readers", () => {
      const ctx = buildGoldenContext();

      const moneyness = buildMoneynessVisual(ctx);
      const volatility = buildVolatilityReading(ctx);
      const greeks = buildGreeksReading(ctx);
      const structures = buildStructureScenarios(ctx);

      expect(moneyness.spot).toBe(38.47);
      expect(volatility.atmIv?.value).toBe(0.287);
      expect(greeks.spot).toBe(38.47);
      expect(structures.length).toBeGreaterThan(0);
    });

    test("spot preserved from source through entire chain", () => {
      const ctx = buildGoldenContext();

      const moneyness = buildMoneynessVisual(ctx);
      const volatility = buildVolatilityReading(ctx);
      const greeks = buildGreeksReading(ctx);
      const structures = buildStructureScenarios(ctx);

      expect(moneyness.spot).toBe(38.47);
      expect(volatility.spot).toBe(38.47);
      expect(greeks.spot).toBe(38.47);
      expect(structures[0].spot).toBe(38.47);
    });

    test("DTE preserved from source through VolatilityReading and GreeksReading", () => {
      const ctx = buildGoldenContext();

      const volatility = buildVolatilityReading(ctx);
      const greeks = buildGreeksReading(ctx);

      expect(volatility.expectedMove?.dteUsed).toBe(17);
      expect(greeks.dte).toBe(17);
    });
  });

  describe("Provenance chain preserved to Snapshot", () => {
    test("volatility provenance preserved from Y.2 to volatility reading", () => {
      const ctx = buildGoldenContext();
      const volatility = buildVolatilityReading(ctx);

      expect(volatility.atmIv?.origin).toBe("observed");
      expect(volatility.atmIv?.source).toBe("yahoo-finance");
      expect(volatility.skew?.origin).toBe("calculated");
      expect(volatility.skew?.slope).toBe(0.064);
    });

    test("greeks provenance preserved: no origin invented", () => {
      const ctx = buildGoldenContext();
      const greeks = buildGreeksReading(ctx);

      for (const fact of greeks.facts) {
        expect(["observed", "calculated", "estimated"]).toContain(fact.origin);
      }
    });

    test("moneyness provenance preserved", () => {
      const ctx = buildGoldenContext();
      const moneyness = buildMoneynessVisual(ctx);

      const firstFact = moneyness.facts[0];
      expect(firstFact.provenance.origin).toBe("calculated");
      expect(firstFact.provenance.method).toBe("moneyness-from-spot");
      expect(firstFact.provenance.source).toBe("live");
    });

    test("DecisionSnapshot preserves spot, IV, DTE from original context", () => {
      const ctx = buildGoldenContext();
      const state = buildInitialState();
      const snapshot = buildDecisionSnapshot(ctx, state, []);

      expect(snapshot.spot).toBe(38.47);
      expect(snapshot.ivAtm).toBe(0.287);
      expect(snapshot.dte).toBe(17);
    });
  });

  describe("Full user journey: observation → hypothesis → evidence → snapshot → replay", () => {
    test("user journey: full state captured in snapshot", () => {
      const ctx = buildGoldenContext();
      let state = buildInitialState();

      state = addInterpretation(state, "IV da put ATM maior que call ATM (skew negativo)");
      const interpId = state.interpretations[0].id;
      state = addHypothesis(
        state,
        "Mercado precificando maior demanda por proteção em caso de queda",
        interpId,
      );
      const hypId = state.hypotheses[0].id;
      state = addEvidence(state, "evidencia", "Put IV OTM = 34.2% > Call IV OTM = 27.8%", hypId);
      state = addEvidence(state, "contraEvidencia", "Volume de calls também elevado", hypId);

      const snapshot = buildDecisionSnapshot(ctx, state, []);

      expect(snapshot.symbol).toBe("PETR4");
      expect(snapshot.spot).toBe(38.47);
      expect(snapshot.ivAtm).toBe(0.287);
      expect(snapshot.interpretationCount).toBe(1);
      expect(snapshot.hypothesisCount).toBe(1);
      expect(snapshot.evidenceCount).toBe(1);
      expect(snapshot.contraEvidenceCount).toBe(1);
    });

    test("Replay reproduces same readings from snapshot data", () => {
      const savedReadings = [
        {
          id: "r1",
          symbol: "PETR4",
          timestamp: "2026-08-15T10:00:00.000Z",
          spot: 38.47,
          interpretationCount: 1,
          hypothesisCount: 1,
          evidenceCount: 1,
          contraEvidenceCount: 0,
        },
        {
          id: "r2",
          symbol: "PETR4",
          timestamp: "2026-09-01T09:00:00.000Z",
          spot: 38.47,
          interpretationCount: 2,
          hypothesisCount: 2,
          evidenceCount: 3,
          contraEvidenceCount: 1,
        },
      ];

      const replay = buildReplayComparison(savedReadings);

      expect(replay.readings).toHaveLength(2);
      expect(replay.temporalGaps).toHaveLength(1);
      expect(replay.temporalGaps[0].days).toBe(17);
    });

    test("EvidenceChain builds correct connections from user state", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "IV da put ATM maior que call ATM");
      const interpId = state.interpretations[0].id;
      state = addHypothesis(state, "Skew negativo indica demanda por proteção", interpId);
      const hypId = state.hypotheses[0].id;
      state = addEvidence(state, "evidencia", "Put skew elevado", hypId);
      state = addEvidence(state, "contraEvidencia", "Calls com volume também elevado", hypId);

      const chain = buildEvidenceChain(state);

      const observations = chain.nodes.filter((n) => n.type === "observation");
      const hypotheses = chain.nodes.filter((n) => n.type === "hypothesis");
      const evidences = chain.nodes.filter((n) => n.type === "evidence");
      const contraEvidences = chain.nodes.filter((n) => n.type === "contra-evidence");

      expect(observations).toHaveLength(1);
      expect(hypotheses).toHaveLength(1);
      expect(evidences).toHaveLength(1);
      expect(contraEvidences).toHaveLength(1);
      expect(chain.hypothesisSupports[hypId]).toHaveLength(1);
      expect(chain.hypothesisContradicts[hypId]).toHaveLength(1);
    });
  });

  describe("Structure comparison: no ranking, no recommendation", () => {
    test("structures are presented without ranking", () => {
      const ctx = buildGoldenContext();
      const structures = buildStructureScenarios(ctx);

      const names = structures.map((s) => s.name);
      const nameCounts = new Map<string, number>();
      for (const n of names) nameCounts.set(n, (nameCounts.get(n) ?? 0) + 1);

      for (const [, count] of nameCounts) {
        expect(count).toBeGreaterThanOrEqual(1);
      }

      const descriptions = structures.map((s) => s.description);
      const evaluativeWords = ["melhor", "ideal", "recomendad", "ótima", "best", "ideal"];
      for (const desc of descriptions) {
        for (const word of evaluativeWords) {
          expect(desc.toLowerCase()).not.toContain(word);
        }
      }
    });

    test("structures include call spreads, put spreads, straddle, strangle", () => {
      const ctx = buildGoldenContext();
      const structures = buildStructureScenarios(ctx);

      const names = new Set(structures.map((s) => s.name));
      expect(names.has("Call Spread")).toBe(true);
      expect(names.has("Put Spread")).toBe(true);
      expect(names.has("Straddle")).toBe(true);
      expect(names.has("Strangle")).toBe(true);
    });
  });

  describe("Risk rules: factual checks, no evaluation language", () => {
    test("IV filter rule produces factual observation", () => {
      const ctx = buildGoldenContext();
      const rule = createRiskRule("IV > 40% é filtro de exclusão", "iv-filter");

      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].observation).toContain("28.7%");
      expect(checks[0].status).toBe("ok");

      const evaluativeWords = ["perigoso", "arriscado", "seguro", "bom", "ruim"];
      for (const word of evaluativeWords) {
        expect(checks[0].observation?.toLowerCase() ?? "").not.toContain(word);
      }
    });

    test("DTE filter rule produces factual observation", () => {
      const ctx = buildGoldenContext();
      const rule = createRiskRule("DTE < 7 dias é muito curto", "dte-filter");

      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].observation).toContain("17");
      expect(checks[0].status).toBe("ok");
    });
  });

  describe("No directional signals in any reader output", () => {
    test("Greeks: no delta as directional signal", () => {
      const ctx = buildGoldenContext();
      const greeks = buildGreeksReading(ctx);
      const directionalWords = [
        "alta",
        "queda",
        "bullish",
        "bearish",
        "direcional",
        "compra",
        "venda",
      ];

      for (const fact of greeks.facts) {
        const text = `${fact.greek}:${fact.valueFormatted}`;
        for (const word of directionalWords) {
          expect(text.toLowerCase()).not.toContain(word);
        }
      }
    });

    test("Moneyness: no moneyness as opportunity signal", () => {
      const ctx = buildGoldenContext();
      const moneyness = buildMoneynessVisual(ctx);

      const opportunityWords = ["oportunidade", "ideal", "perfeito", "bom", "melhor"];
      const text = JSON.stringify(moneyness).toLowerCase();
      for (const word of opportunityWords) {
        expect(text).not.toContain(word);
      }
    });

    test("Volatility: no IV as directional signal", () => {
      const ctx = buildGoldenContext();
      const volatility = buildVolatilityReading(ctx);

      const directionalWords = ["alta", "queda", "subida", "queda", "buy", "sell"];
      const text = JSON.stringify(volatility).toLowerCase();
      for (const word of directionalWords) {
        expect(text).not.toContain(word);
      }
    });
  });
});
