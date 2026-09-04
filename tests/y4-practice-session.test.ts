import { describe, test, expect } from "vitest";
import {
  createFrozenContext,
  createPracticeSession,
  completeStep,
  setChoice,
  terminateSession,
  scheduleReflection,
  buildPracticeSummary,
  getTerminationDescription,
  getSessionCompleteness,
} from "../src/lib/practice-session";
import { buildMarketContext } from "../src/lib/market-context-builder";
import type { MarketContext } from "../src/lib/market-context";

const PETR4_GOLDEN: MarketContext = buildMarketContext({
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
      {
        symbol: "PETR4",
        strike: 37.0,
        type: "put",
        expiration: "2026-09-18",
        daysToExpiration: 17,
        bid: 0.72,
        ask: 0.75,
        volume: 2100,
        openInterest: 12400,
        impliedVolatility: {
          value: 0.321,
          provenance: {
            origin: "observed",
            source: "yahoo-finance",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
        },
        delta: {
          value: -0.318,
          provenance: {
            origin: "calculated",
            method: "black-scholes-bsm",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
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
        strike: 40.0,
        type: "call",
        expiration: "2026-09-18",
        daysToExpiration: 17,
        bid: 0.38,
        ask: 0.4,
        volume: 980,
        openInterest: 7800,
        impliedVolatility: {
          value: 0.294,
          provenance: {
            origin: "observed",
            source: "yahoo-finance",
            calculatedAt: "2026-09-04T15:00:00.000Z",
          },
        },
        delta: {
          value: 0.201,
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

describe("Y.4.1 — Practice Session", () => {
  describe("Golden Scenario: do-not-follow (most important case)", () => {
    test("1. FrozenPracticeContext created from PETR4 golden scenario", () => {
      const fpc = createFrozenContext(PETR4_GOLDEN, "laboratory");

      expect(fpc.id).toBeTruthy();
      expect(fpc.origin).toBe("laboratory");
      expect(fpc.outcomeRevealed).toBe(false);
      expect(fpc.context.instrument.symbol).toBe("PETR4");
    });

    test("2. PracticeSession created and has 8 protocol steps", () => {
      const fpc = createFrozenContext(PETR4_GOLDEN, "laboratory");
      const session = createPracticeSession(fpc.id);

      expect(session.id).toBeTruthy();
      expect(session.contextId).toBe(fpc.id);
      expect(session.startedAt).toBeTruthy();
      expect(session.endedAt).toBeNull();
      expect(session.protocolSteps).toHaveLength(8);
      expect(session.choice).toBeNull();
      expect(session.terminationStep).toBeNull();
      expect(session.reflectionScheduled).toBe(false);
      expect(session.reflectionCompleted).toBe(false);
    });

    test("3. Session completes observe step with content", () => {
      const session = createPracticeSession("fpc-1");
      const after = completeStep(session, "observe", "PETR4 em 38.47, ATM em 38.5, IV 28.7%");

      expect(after.protocolSteps.find((s) => s.step === "observe")?.completed).toBe(true);
      expect(after.protocolSteps.find((s) => s.step === "observe")?.content).toBe(
        "PETR4 em 38.47, ATM em 38.5, IV 28.7%",
      );
    });

    test("4. Session completes all steps up to choice", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "spot 38.47, ATM IV 28.7%");
      session = completeStep(session, "interpret", "moneyness ITM marginal, skew positivo");
      session = completeStep(session, "hypothesize", "possível realização parcial");
      session = completeStep(session, "evidence", "skew +6.4pts indica demanda por puts");
      session = completeStep(session, "contra-evidence", "DTE 17 ainda permite tempo");
      session = completeStep(session, "risk", "risco de reversão do skew");

      expect(session.protocolSteps.find((s) => s.step === "observe")?.completed).toBe(true);
      expect(session.protocolSteps.find((s) => s.step === "interpret")?.completed).toBe(true);
      expect(session.protocolSteps.find((s) => s.step === "hypothesize")?.completed).toBe(true);
      expect(session.protocolSteps.find((s) => s.step === "evidence")?.completed).toBe(true);
      expect(session.protocolSteps.find((s) => s.step === "contra-evidence")?.completed).toBe(true);
      expect(session.protocolSteps.find((s) => s.step === "risk")?.completed).toBe(true);
      expect(session.protocolSteps.find((s) => s.step === "choice")?.completed).toBe(false);
    });

    test("5. do-not-follow is a valid terminal choice", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "contexto de exemplo");
      session = completeStep(session, "interpret", "interpretação");
      session = completeStep(session, "hypothesize", "hipótese");
      session = completeStep(session, "evidence", "evidência");
      session = completeStep(session, "contra-evidence", "contra-evidência");
      session = completeStep(session, "risk", "risco");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");

      expect(session.choice).toBe("do-not-follow");
      expect(session.terminationStep).toBe("choice");
      expect(session.endedAt).toBeTruthy();
      expect(session.protocolSteps.find((s) => s.step === "choice")?.completed).toBe(true);
    });

    test("6. do-not-follow produces same structural completeness as follow", () => {
      let doNotFollow = createPracticeSession("fpc-1");
      doNotFollow = completeStep(doNotFollow, "observe", "contexto");
      doNotFollow = completeStep(doNotFollow, "interpret", "interpretação");
      doNotFollow = completeStep(doNotFollow, "hypothesize", "hipótese");
      doNotFollow = completeStep(doNotFollow, "evidence", "evidência");
      doNotFollow = completeStep(doNotFollow, "contra-evidence", "contra-evidência");
      doNotFollow = completeStep(doNotFollow, "risk", "risco");
      doNotFollow = setChoice(doNotFollow, "do-not-follow");
      doNotFollow = terminateSession(doNotFollow, "choice");

      let follow = createPracticeSession("fpc-2");
      follow = completeStep(follow, "observe", "contexto");
      follow = completeStep(follow, "interpret", "interpretação");
      follow = completeStep(follow, "hypothesize", "hipótese");
      follow = completeStep(follow, "evidence", "evidência");
      follow = completeStep(follow, "contra-evidence", "contra-evidência");
      follow = completeStep(follow, "risk", "risco");
      follow = setChoice(follow, "follow");
      follow = terminateSession(follow, "choice");

      const doNotFollowComplete = doNotFollow.protocolSteps.filter((s) => s.completed).length;
      const followComplete = follow.protocolSteps.filter((s) => s.completed).length;

      expect(doNotFollowComplete).toBe(followComplete);
      expect(doNotFollow.terminationStep).toBe(follow.terminationStep);
    });

    test("7. buildPracticeSummary for do-not-follow", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "PETR4 em 38.47");
      session = completeStep(session, "interpret", "moneyness ATM");
      session = completeStep(session, "hypothesize", "consolidação");
      session = completeStep(session, "evidence", "IV elevada");
      session = completeStep(session, "contra-evidence", "");
      session = completeStep(session, "risk", "tempo de增值");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");

      const summary = buildPracticeSummary(session);

      expect(summary).toContain("Observou");
      expect(summary).toContain("interpretou");
      expect(summary).toContain("formulou hipótese");
      expect(summary).toContain("registrou evidência");
      expect(summary).toContain("não registrou contra-evidência");
      expect(summary).toContain("avaliou risco");
      expect(summary).toContain("escolheu não seguir");
    });

    test("8. do-not-follow session can be scheduled for reflection", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "contexto");
      session = completeStep(session, "interpret", "interpretação");
      session = completeStep(session, "hypothesize", "hipótese");
      session = completeStep(session, "evidence", "evidência");
      session = completeStep(session, "contra-evidence", "contra-evidência");
      session = completeStep(session, "risk", "risco");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");
      session = scheduleReflection(session);

      expect(session.reflectionScheduled).toBe(true);
      expect(session.reflectionCompleted).toBe(false);
    });

    test("9. getTerminationDescription for do-not-follow", () => {
      let session = createPracticeSession("fpc-1");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");

      const desc = getTerminationDescription(session);
      expect(desc).toBe("Decidiu não seguir.");
    });
  });

  describe("Golden Scenario: simulate", () => {
    test("10. simulate is a valid terminal choice", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "contexto");
      session = completeStep(session, "interpret", "interpretação");
      session = completeStep(session, "hypothesize", "hipótese");
      session = completeStep(session, "evidence", "evidência");
      session = completeStep(session, "contra-evidence", "contra-evidência");
      session = completeStep(session, "risk", "risco");
      session = setChoice(session, "simulate");
      session = terminateSession(session, "choice");

      expect(session.choice).toBe("simulate");
      expect(session.terminationStep).toBe("choice");
    });

    test("11. buildPracticeSummary for simulate", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "PETR4 em 38.47");
      session = completeStep(session, "interpret", "moneyness ATM");
      session = completeStep(session, "hypothesize", "spread de alta");
      session = completeStep(session, "evidence", "skew positivo");
      session = completeStep(session, "contra-evidence", "DTE elevado");
      session = completeStep(session, "risk", "risco limitado");
      session = setChoice(session, "simulate");
      session = terminateSession(session, "choice");

      const summary = buildPracticeSummary(session);

      expect(summary).toContain("Observou");
      expect(summary).toContain("escolheu simular");
    });

    test("12. getTerminationDescription for simulate", () => {
      let session = createPracticeSession("fpc-1");
      session = setChoice(session, "simulate");
      session = terminateSession(session, "choice");

      const desc = getTerminationDescription(session);
      expect(desc).toBe("Escolheu simular.");
    });
  });

  describe("Protocol lifecycle", () => {
    test("13. observe / simulate / follow / do-not-follow are all valid choices", () => {
      const choices = ["observe", "simulate", "follow", "do-not-follow"] as const;

      for (const choice of choices) {
        let session = createPracticeSession("fpc-1");
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
    });

    test("14. Session can terminate early (before choice)", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "contexto");
      session = completeStep(session, "interpret", "interpretação");
      session = terminateSession(session, "interpret");

      expect(session.terminationStep).toBe("interpret");
      expect(session.endedAt).toBeTruthy();
      expect(session.choice).toBeNull();
    });

    test("15. getSessionCompleteness returns correct counts", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "contexto");
      session = completeStep(session, "interpret", "interpretação");

      const { completed, total, percentage } = getSessionCompleteness(session);

      expect(completed).toBe(2);
      expect(total).toBe(8);
      expect(percentage).toBe(25);
    });
  });

  describe("Anti-recommendation contract", () => {
    test("16. Session summary contains no directional language from system", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "PETR4 em 38.47, ATM IV 28.7%");
      session = completeStep(session, "interpret", "moneyness ATM, skew positivo");
      session = completeStep(session, "hypothesize", "possível consolidação");
      session = completeStep(session, "evidence", "IV elevada sugere incerteza");
      session = completeStep(session, "contra-evidence", "DTE 17 permite tempo");
      session = completeStep(session, "risk", "risco de compressão de IV");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");

      const summary = buildPracticeSummary(session);
      const directionalPatterns = [/\balta\b/, /\bbaixa\b/, /\bcomprar\b/, /\bvender\b/];

      const hasDirectional = directionalPatterns.some((pattern) =>
        pattern.test(summary.toLowerCase()),
      );

      expect(hasDirectional).toBe(false);
    });

    test("17. No choice is treated as incomplete — do-not-follow is complete", () => {
      let sessionNoChoice = createPracticeSession("fpc-1");
      sessionNoChoice = completeStep(sessionNoChoice, "observe", "contexto");
      sessionNoChoice = completeStep(sessionNoChoice, "interpret", "interpretação");
      sessionNoChoice = completeStep(sessionNoChoice, "hypothesize", "hipótese");
      sessionNoChoice = completeStep(sessionNoChoice, "evidence", "evidência");
      sessionNoChoice = completeStep(sessionNoChoice, "contra-evidence", "contra-evidência");
      sessionNoChoice = completeStep(sessionNoChoice, "risk", "risco");
      sessionNoChoice = terminateSession(sessionNoChoice, "risk");

      let sessionDoNotFollow = createPracticeSession("fpc-2");
      sessionDoNotFollow = completeStep(sessionDoNotFollow, "observe", "contexto");
      sessionDoNotFollow = completeStep(sessionDoNotFollow, "interpret", "interpretação");
      sessionDoNotFollow = completeStep(sessionDoNotFollow, "hypothesize", "hipótese");
      sessionDoNotFollow = completeStep(sessionDoNotFollow, "evidence", "evidência");
      sessionDoNotFollow = completeStep(sessionDoNotFollow, "contra-evidence", "contra-evidência");
      sessionDoNotFollow = completeStep(sessionDoNotFollow, "risk", "risco");
      sessionDoNotFollow = setChoice(sessionDoNotFollow, "do-not-follow");
      sessionDoNotFollow = terminateSession(sessionDoNotFollow, "choice");

      const noChoiceCompleted = getSessionCompleteness(sessionNoChoice).completed;
      const doNotFollowCompleted = getSessionCompleteness(sessionDoNotFollow).completed;

      expect(doNotFollowCompleted).toBe(noChoiceCompleted + 1);
    });
  });

  describe("Historical frozen context integrity", () => {
    test("18. Frozen context does not leak outcome", () => {
      const fpc = createFrozenContext(PETR4_GOLDEN, "historical");

      expect(fpc.origin).toBe("historical");
      expect(fpc.outcomeRevealed).toBe(false);
      expect(fpc.context).toBeDefined();
    });

    test("19. Frozen context preserves full market context", () => {
      const fpc = createFrozenContext(PETR4_GOLDEN, "laboratory");

      expect(fpc.context.instrument.symbol).toBe("PETR4");
      expect(fpc.context.optionsChain?.atm?.strike).toBe(38.5);
      expect(fpc.context.optionsChain?.impliedVolatilityAtm?.value).toBe(0.287);
      expect(fpc.context.optionsChain?.skew?.slope).toBe(0.064);
    });
  });

  describe("ADR-010 contracts", () => {
    test("20. Session records 8 protocol steps in correct order", () => {
      const session = createPracticeSession("fpc-1");

      const steps = session.protocolSteps.map((s) => s.step);
      expect(steps).toEqual([
        "observe",
        "interpret",
        "hypothesize",
        "evidence",
        "contra-evidence",
        "risk",
        "choice",
        "register",
      ]);
    });

    test("21. Session choice field accepts all 4 valid values", () => {
      const choices = ["observe", "simulate", "follow", "do-not-follow"] as const;

      for (const choice of choices) {
        let session = createPracticeSession("fpc-1");
        session = setChoice(session, choice);
        expect(session.choice).toBe(choice);
      }
    });

    test("22. Session with null content on contra-evidence is valid", () => {
      let session = createPracticeSession("fpc-1");
      session = completeStep(session, "observe", "contexto");
      session = completeStep(session, "interpret", "interpretação");
      session = completeStep(session, "hypothesize", "hipótese");
      session = completeStep(session, "evidence", "evidência");
      session = completeStep(session, "contra-evidence", "");
      session = completeStep(session, "risk", "risco");

      expect(session.protocolSteps.find((s) => s.step === "contra-evidence")?.content).toBe("");
    });
  });
});
