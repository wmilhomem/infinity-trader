import { describe, test, expect } from "vitest";
import {
  PRACTICE_COMPLEXITY_STAGES,
  COMPLEXITY_STAGES,
  getNextComplexity,
  getPreviousComplexity,
  isValidComplexity,
} from "../src/lib/practice-complexity-types";
import { buildContextByComplexity } from "../src/lib/practice-complexity-builder";
import {
  determineNextComplexity,
  getComplexityCoverage,
  hasCompletedMinimumPractice,
} from "../src/lib/practice-progression";
import { buildScenario } from "../src/lib/practice-scenario-builder";
import {
  createPracticeSession,
  completeStep,
  setChoice,
  terminateSession,
} from "../src/lib/practice-session";
import { buildMarketContext } from "../src/lib/market-context-builder";

const BASE_CTX = buildMarketContext({
  symbol: "PETR4",
  quote: { last: 38.47 },
  timestamp: "2026-09-04T15:00:00.000Z",
  provenance: { source: "live", provider: "yahoo-finance", observedAt: "2026-09-04T15:00:00.000Z" },
  optionsChain: {
    expirationDate: "2026-09-18",
    daysToExpiration: 17,
    atm: {
      strike: 38.5,
      spotUsed: 38.47,
      determinedAt: "2026-09-04T15:00:00.000Z",
      method: "nearest-strike",
    },
    impliedVolatilityAtm: {
      value: 0.287,
      provenance: {
        origin: "observed",
        source: "yahoo-finance",
        calculatedAt: "2026-09-04T15:00:00.000Z",
      },
      atmStrikeUsed: 38.5,
    },
    skew: {
      putIvOtm: 0.342,
      callIvOtm: 0.278,
      slope: 0.064,
      provenance: {
        origin: "calculated",
        method: "put-call-iv-spread",
        calculatedAt: "2026-09-04T15:00:00.000Z",
      },
      putStrikeUsed: 36.0,
      callStrikeUsed: 41.0,
      otmDistanceUsed: 0.065,
    },
    expectedMove: {
      sigma1Brl: 1.83,
      lowerBound1Sigma: 36.64,
      upperBound1Sigma: 40.3,
      provenance: {
        origin: "calculated",
        method: "spot-iv-sqrt-t",
        calculatedAt: "2026-09-04T15:00:00.000Z",
      },
      ivUsed: 0.287,
      spotUsed: 38.47,
      dteUsed: 17,
      dteBase: "calendar",
      formula: "Spot × IV × √(T/252)",
    },
    contracts: [
      {
        symbol: "PETR4",
        strike: 38.5,
        type: "call",
        expiration: "2026-09-18",
        daysToExpiration: 17,
        bid: 1.15,
        ask: 1.2,
        volume: 3420,
        openInterest: 12400,
        impliedVolatility: {
          value: 0.287,
          provenance: {
            origin: "observed",
            source: "yahoo-finance",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
        },
        delta: {
          value: 0.512,
          provenance: {
            origin: "calculated",
            method: "black-scholes-bsm",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
        },
      },
      {
        symbol: "PETR4",
        strike: 36.0,
        type: "put",
        expiration: "2026-09-18",
        daysToExpiration: 17,
        bid: 0.42,
        ask: 0.45,
        volume: 1240,
        openInterest: 8920,
        impliedVolatility: {
          value: 0.342,
          provenance: {
            origin: "observed",
            source: "yahoo-finance",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
        },
        delta: {
          value: -0.234,
          provenance: {
            origin: "calculated",
            method: "black-scholes-bsm",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
        },
      },
    ],
  },
});

describe("Y.4.4 — Progressive Complexity", () => {
  describe("Y.4.4.0 — Complexity Model", () => {
    test("1. All 6 complexity stages are defined", () => {
      expect(PRACTICE_COMPLEXITY_STAGES).toHaveLength(6);
      expect(PRACTICE_COMPLEXITY_STAGES).toContain("simple");
      expect(PRACTICE_COMPLEXITY_STAGES).toContain("composed");
      expect(PRACTICE_COMPLEXITY_STAGES).toContain("conflict");
      expect(PRACTICE_COMPLEXITY_STAGES).toContain("uncertainty");
      expect(PRACTICE_COMPLEXITY_STAGES).toContain("structure");
      expect(PRACTICE_COMPLEXITY_STAGES).toContain("explanation");
    });

    test("2. Each complexity has correct order", () => {
      PRACTICE_COMPLEXITY_STAGES.forEach((c, i) => {
        expect(COMPLEXITY_STAGES[c].order).toBe(i + 1);
      });
    });

    test("3. Each complexity has userTask defined", () => {
      for (const c of PRACTICE_COMPLEXITY_STAGES) {
        expect(COMPLEXITY_STAGES[c].userTask.length).toBeGreaterThan(0);
      }
    });

    test("4. getNextComplexity advances in order", () => {
      expect(getNextComplexity("simple")).toBe("composed");
      expect(getNextComplexity("composed")).toBe("conflict");
      expect(getNextComplexity("conflict")).toBe("uncertainty");
      expect(getNextComplexity("uncertainty")).toBe("structure");
      expect(getNextComplexity("structure")).toBe("explanation");
      expect(getNextComplexity("explanation")).toBe("explanation");
    });

    test("5. getPreviousComplexity goes backwards", () => {
      expect(getPreviousComplexity("explanation")).toBe("structure");
      expect(getPreviousComplexity("structure")).toBe("uncertainty");
      expect(getPreviousComplexity("uncertainty")).toBe("conflict");
      expect(getPreviousComplexity("conflict")).toBe("composed");
      expect(getPreviousComplexity("composed")).toBe("simple");
      expect(getPreviousComplexity("simple")).toBe("simple");
    });

    test("6. isValidComplexity validates correctly", () => {
      expect(isValidComplexity("simple")).toBe(true);
      expect(isValidComplexity("composed")).toBe(true);
      expect(isValidComplexity("invalid")).toBe(false);
      expect(isValidComplexity("")).toBe(false);
    });
  });

  describe("Y.4.4.1 — Context Complexity Builder", () => {
    test("7. simple context reduces to minimal contracts", () => {
      const simple = buildContextByComplexity(BASE_CTX, "simple");

      expect(simple.optionsChain).toBeDefined();
      expect(simple.optionsChain!.contracts!.length).toBeLessThanOrEqual(2);
    });

    test("8. uncertainty context makes data incomplete", () => {
      const uncertain = buildContextByComplexity(BASE_CTX, "uncertainty");

      expect(uncertain.optionsChain!.atm!.determinedAt).toBeNull();
      expect(uncertain.optionsChain!.contracts![0].volume).toBeNull();
      expect(uncertain.optionsChain!.contracts![0].openInterest).toBeNull();
    });

    test("9. conflict context has contradictory signals", () => {
      const conflict = buildContextByComplexity(BASE_CTX, "conflict");

      expect(conflict.optionsChain).toBeDefined();
      const contracts = conflict.optionsChain!.contracts!;
      const hasCall = contracts.some((c) => c.type === "call");
      const hasPut = contracts.some((c) => c.type === "put");
      expect(hasCall && hasPut).toBe(true);
    });

    test("10. explanation context sets requiresExplanation flag", () => {
      const explanation = buildContextByComplexity(BASE_CTX, "explanation");

      expect(Object.keys(explanation.optionsChain ?? {}).includes("requiresExplanation")).toBe(
        true,
      );
    });

    test("11. No complexity adds directional content to context", () => {
      const complexities = [
        "simple",
        "composed",
        "conflict",
        "uncertainty",
        "structure",
        "explanation",
      ] as const;

      for (const c of complexities) {
        const result = buildContextByComplexity(BASE_CTX, c);
        const contextStr = JSON.stringify(result);

        const directionalTerms = ["alta", "baixa", "buy", "sell", "call!", "put!"];
        const hasDirectional = directionalTerms.some((term) =>
          contextStr.toLowerCase().includes(term.toLowerCase()),
        );
        expect(hasDirectional).toBe(false);
      }
    });
  });

  describe("Y.4.4.2 — Internal Progression", () => {
    test("12. No history returns simple", () => {
      const result = determineNextComplexity({ sessions: [] });

      expect(result.recommendedComplexity).toBe("simple");
    });

    test("13. Sessions at simple returns composed as next", () => {
      let s = createPracticeSession("fpc-1", "simple");
      s = setChoice(s, "do-not-follow");
      s = terminateSession(s, "choice");

      const result = determineNextComplexity({ sessions: [s] });

      expect(result.recommendedComplexity).toBe("composed");
    });

    test("14. All levels practiced returns explanation", () => {
      const sessions = PRACTICE_COMPLEXITY_STAGES.map((c) => {
        let s = createPracticeSession(`fpc-${c}`, c);
        s = setChoice(s, "do-not-follow");
        s = terminateSession(s, "choice");
        return s;
      });

      const result = determineNextComplexity({ sessions });

      expect(result.hasPracticedAll).toBe(true);
    });

    test("15. Progression ignores choice type — do-not-follow treated equally to follow", () => {
      let dnf = createPracticeSession("fpc-1", "simple");
      dnf = setChoice(dnf, "do-not-follow");
      dnf = terminateSession(dnf, "choice");

      let follow = createPracticeSession("fpc-2", "simple");
      follow = setChoice(follow, "follow");
      follow = terminateSession(follow, "choice");

      const dnfResult = determineNextComplexity({ sessions: [dnf] });
      const followResult = determineNextComplexity({ sessions: [follow] });

      expect(dnfResult.recommendedComplexity).toBe(followResult.recommendedComplexity);
      expect(dnfResult.recommendedComplexity).toBe("composed");
    });

    test("16. No scoring, ranking, or accuracy metrics in progression output", () => {
      let s = createPracticeSession("fpc-1", "simple");
      s = setChoice(s, "do-not-follow");
      s = terminateSession(s, "choice");

      const result = determineNextComplexity({ sessions: [s] });

      const resultStr = JSON.stringify(result);
      const scoreTerms = ["score", "accuracy", "rate", "rank", "xp", "level", "performance"];
      const hasScoreTerm = scoreTerms.some((term) => resultStr.includes(term));
      expect(hasScoreTerm).toBe(false);
    });

    test("17. getComplexityCoverage returns practiced and unpracticed", () => {
      let s = createPracticeSession("fpc-1", "simple");
      s = setChoice(s, "do-not-follow");
      s = terminateSession(s, "choice");

      const coverage = getComplexityCoverage([s]);

      expect(coverage.practiced).toContain("simple");
      expect(coverage.unpracticed).toContain("composed");
    });
  });

  describe("Y.4.4.3 — Scenario Construction", () => {
    test("18. buildScenario creates FrozenPracticeContext with correct complexity", () => {
      const scenario = buildScenario({
        complexity: "uncertainty",
        baseContext: BASE_CTX,
        origin: "laboratory",
      });

      expect(scenario.id).toBeTruthy();
      expect(scenario.origin).toBe("laboratory");
      expect(scenario.outcomeRevealed).toBe(false);
      expect(scenario.context).toBeDefined();
    });

    test("19. Scenario preserves TEI — context frozen at T0 without outcome", () => {
      const scenario = buildScenario({
        complexity: "conflict",
        baseContext: BASE_CTX,
        origin: "historical",
      });

      expect(scenario.outcomeRevealed).toBe(false);
      expect(Object.keys(scenario).includes("outcome")).toBe(false);
    });
  });

  describe("C4 — TEI Contract under complexity", () => {
    test("20. Context at each complexity level preserves TEI", () => {
      for (const c of PRACTICE_COMPLEXITY_STAGES) {
        const scenario = buildScenario({
          complexity: c,
          baseContext: BASE_CTX,
          origin: "laboratory",
        });

        expect(scenario.outcomeRevealed).toBe(false);
        expect(scenario.context.instrument.symbol).toBe("PETR4");
      }
    });
  });

  describe("C1 — Anti-Recommendation under complexity", () => {
    test("21. No complexity level produces recommendation content", () => {
      for (const c of PRACTICE_COMPLEXITY_STAGES) {
        const scenario = buildScenario({
          complexity: c,
          baseContext: BASE_CTX,
          origin: "laboratory",
        });
        const str = JSON.stringify(scenario.context);

        const prescriptive = ["call!", "put!", "compre", "venda", "buy now"];
        const hasPrescriptive = prescriptive.some((term) =>
          str.toLowerCase().includes(term.toLowerCase()),
        );
        expect(hasPrescriptive).toBe(false);
      }
    });
  });

  describe("C5 — 4 choices equivalent under complexity", () => {
    test("22. All 4 choices remain valid regardless of complexity level", () => {
      const choices = ["observe", "simulate", "follow", "do-not-follow"] as const;

      for (const complexity of PRACTICE_COMPLEXITY_STAGES) {
        const scenario = buildScenario({
          complexity,
          baseContext: BASE_CTX,
          origin: "laboratory",
        });

        for (const choice of choices) {
          let session = createPracticeSession(scenario.id, complexity);
          session = completeStep(session, "observe", "contexto");
          session = completeStep(session, "interpret", "interpretação");
          session = completeStep(session, "hypothesize", "hipótese");
          session = completeStep(session, "evidence", "evidência");
          session = completeStep(session, "contra-evidence", "contra-evidência");
          session = completeStep(session, "risk", "risco");
          session = setChoice(session, choice);
          session = terminateSession(session, "choice");

          expect(session.choice).toBe(choice);
          expect(session.terminationStep).toBe("choice");
        }
      }
    });
  });

  describe("C7 — No performance metrics in progression", () => {
    test("23. determineNextComplexity produces no performance-related fields", () => {
      let s = createPracticeSession("fpc-1", "conflict");
      s = setChoice(s, "do-not-follow");
      s = terminateSession(s, "choice");

      const result = determineNextComplexity({ sessions: [s] });

      const keys = Object.keys(result);
      const performanceKeys = keys.filter((k) =>
        ["score", "accuracy", "rate", "rank", "xp", "level", "result", "performance"].includes(k),
      );
      expect(performanceKeys).toHaveLength(0);
    });
  });
});
