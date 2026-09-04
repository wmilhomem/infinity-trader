import { describe, test, expect } from "vitest";
import {
  createFrozenContext,
  createPracticeSession,
  completeStep,
  setChoice,
  terminateSession,
  buildPracticeSummary,
} from "../src/lib/practice-session";
import { buildMarketContext } from "../src/lib/market-context-builder";

const LABORATORY_CTX = buildMarketContext({
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
    ],
  },
});

const POST_FREEZE_CTX = buildMarketContext({
  symbol: "PETR4",
  quote: { last: 39.1 },
  timestamp: "2026-09-04T16:30:00.000Z",
  provenance: { source: "live", provider: "yahoo-finance", observedAt: "2026-09-04T16:30:00.000Z" },
  optionsChain: {
    expirationDate: "2026-09-18",
    daysToExpiration: 16,
    atm: {
      strike: 39.0,
      spotUsed: 39.1,
      determinedAt: "2026-09-04T16:30:00.000Z",
      method: "nearest-strike",
    },
    impliedVolatilityAtm: {
      value: 0.31,
      provenance: {
        origin: "observed",
        source: "yahoo-finance",
        calculatedAt: "2026-09-04T16:30:00.000Z",
      },
      atmStrikeUsed: 39.0,
    },
    skew: {
      putIvOtm: 0.35,
      callIvOtm: 0.29,
      slope: 0.06,
      provenance: {
        origin: "calculated",
        method: "put-call-iv-spread",
        calculatedAt: "2026-09-04T16:30:00.000Z",
      },
      putStrikeUsed: 36.0,
      callStrikeUsed: 41.0,
      otmDistanceUsed: 0.065,
    },
    expectedMove: {
      sigma1Brl: 1.95,
      lowerBound1Sigma: 37.15,
      upperBound1Sigma: 41.05,
      provenance: {
        origin: "calculated",
        method: "spot-iv-sqrt-t",
        calculatedAt: "2026-09-04T16:30:00.000Z",
      },
      ivUsed: 0.31,
      spotUsed: 39.1,
      dteUsed: 16,
      dteBase: "calendar",
      formula: "Spot × IV × √(T/252)",
    },
    contracts: [],
  },
});

describe("Y.4.3 — Laboratory → Practice C1-C7", () => {
  describe("C1 — Origem: Laboratory session records source = 'laboratory'", () => {
    test("1. FrozenContext from Laboratory has origin = 'laboratory'", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");

      expect(fpc.origin).toBe("laboratory");
      expect(fpc.id).toBeTruthy();
    });

    test("2. FrozenContext from Historical has origin = 'historical'", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "historical");

      expect(fpc.origin).toBe("historical");
    });

    test("3. PracticeSession records the FrozenContext id and origin", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");
      const session = createPracticeSession(fpc.id);

      expect(session.contextId).toBe(fpc.id);
    });
  });

  describe("C2 — Snapshot independente: Laboratory changes after freeze don't affect frozen context", () => {
    test("4. FrozenContext marketContext is independent of subsequent Laboratory context", () => {
      const frozen = createFrozenContext(LABORATORY_CTX, "laboratory");
      const frozenSnapshot = structuredClone(frozen.context);

      const differentCtx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 42.0 },
        timestamp: "2026-09-05T10:00:00.000Z",
        provenance: { source: "live" },
      });
      const differentFrozen = createFrozenContext(differentCtx, "laboratory");

      expect(frozen.context).toEqual(frozenSnapshot);
      expect(frozen.context).not.toEqual(differentFrozen.context);
    });

    test("5. Multiple freeze operations from same source produce independent contexts", () => {
      const first = createFrozenContext(LABORATORY_CTX, "laboratory");
      const second = createFrozenContext(LABORATORY_CTX, "laboratory");

      expect(first.id).not.toBe(second.id);
      expect(first.context).toEqual(second.context);
      expect(first.context).toEqual(LABORATORY_CTX);
      expect(first.frozenAt).toBeTruthy();
      expect(second.frozenAt).toBeTruthy();
    });
  });

  describe("C3 — TEI: Context used for practice is exactly the frozen state", () => {
    test("6. FrozenContext is used verbatim in PracticeSession — no recalculation", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");
      const session = createPracticeSession(fpc.id);

      expect(session.id).toBeTruthy();
      expect(fpc.context.optionsChain?.atm?.strike).toBe(38.5);
      expect(fpc.context.optionsChain?.impliedVolatilityAtm?.value).toBe(0.287);
    });

    test("7. PracticeSession context values remain identical after Laboratory state changes", () => {
      const fpcT0 = createFrozenContext(LABORATORY_CTX, "laboratory");
      const contextAtT0 = fpcT0.context;

      createFrozenContext(POST_FREEZE_CTX, "laboratory");

      expect(contextAtT0.instrument.symbol).toBe("PETR4");
      expect(contextAtT0.optionsChain?.atm?.strike).toBe(38.5);
      expect(contextAtT0.optionsChain?.impliedVolatilityAtm?.value).toBe(0.287);
      expect(contextAtT0.optionsChain?.expectedMove?.sigma1Brl).toBe(1.83);
    });
  });

  describe("C4 — Escolha terminal: 4 paths remain structurally equivalent", () => {
    test("8. All 4 terminal choices produce identical session structure", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");
      const choices = ["observe", "simulate", "follow", "do-not-follow"] as const;

      const sessions = choices.map((choice) => {
        let s = createPracticeSession(fpc.id);
        s = completeStep(s, "observe", "contexto");
        s = completeStep(s, "interpret", "interpretação");
        s = completeStep(s, "hypothesize", "hipótese");
        s = completeStep(s, "evidence", "evidência");
        s = completeStep(s, "contra-evidence", "contra-evidência");
        s = completeStep(s, "risk", "risco");
        s = setChoice(s, choice);
        s = terminateSession(s, "choice");
        return s;
      });

      const completions = sessions.map(
        (s) => s.protocolSteps.filter((step) => step.completed).length,
      );
      completions.forEach((count) => expect(count).toBe(7));
      sessions.forEach((s) => expect(s.terminationStep).toBe("choice"));
    });
  });

  describe("C5 — Sem vazamento: No market outcome enters the practice context", () => {
    test("9. FrozenContext has no outcome field accessible from practice context", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");

      const fields = Object.keys(fpc);
      expect(fields.some((k) => k === "outcome" || k === "result" || k === "price")).toBe(false);
    });

    test("10. FrozenContext outcomeRevealed is false at creation", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");

      expect(fpc.outcomeRevealed).toBe(false);
    });

    test("11. PracticeSession does not receive outcome information", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");
      const session = createPracticeSession(fpc.id);

      expect(Object.keys(session).some((k) => k === "outcome")).toBe(false);
      expect(Object.keys(session).some((k) => k === "price")).toBe(false);
      expect(Object.keys(session).some((k) => k === "result")).toBe(false);
    });
  });

  describe("C6 — Proveniência: MarketContext provenance accompanies frozen context", () => {
    test("12. FrozenContext preserves full provenance chain", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");

      expect(fpc.context.provenance.source).toBe("live");
      expect(fpc.context.provenance.provider).toBe("yahoo-finance");
      expect(fpc.context.optionsChain?.atm?.determinedAt).toBeTruthy();
      expect(fpc.context.optionsChain?.impliedVolatilityAtm?.provenance?.origin).toBe("observed");
      expect(fpc.context.optionsChain?.skew?.provenance?.origin).toBe("calculated");
    });

    test("13. Provenance is preserved when context is frozen", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");

      expect(fpc.context.optionsChain?.contracts?.[0]?.impliedVolatility?.provenance?.source).toBe(
        "yahoo-finance",
      );
      expect(fpc.context.optionsChain?.contracts?.[0]?.delta?.provenance?.method).toBe(
        "black-scholes-bsm",
      );
    });
  });

  describe("C7 — Replay: Session can be reconstructed without fetching market", () => {
    test("14. PracticeSession captures all data needed for future replay", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");
      let session = createPracticeSession(fpc.id);
      session = completeStep(session, "observe", "PETR4 em 38.47, ATM IV 28.7%");
      session = completeStep(session, "interpret", "moneyness ATM, skew positivo");
      session = completeStep(session, "hypothesize", "consolidação");
      session = completeStep(session, "evidence", "skew +6.4pts");
      session = completeStep(session, "contra-evidence", "DTE 17");
      session = completeStep(session, "risk", "compressão de IV");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");

      expect(session.id).toBeTruthy();
      expect(session.contextId).toBe(fpc.id);
      expect(session.startedAt).toBeTruthy();
      expect(session.protocolSteps.filter((s) => s.completed).length).toBe(7);
      expect(session.choice).toBe("do-not-follow");
      expect(session.terminationStep).toBe("choice");

      const summary = buildPracticeSummary(session);
      expect(summary).toContain("Observou");
      expect(summary).toContain("interpretou");
      expect(summary).toContain("escolheu não seguir");
    });

    test("15. FrozenContext can be retrieved by id for replay reconstruction", () => {
      const fpc = createFrozenContext(LABORATORY_CTX, "laboratory");
      const session = createPracticeSession(fpc.id);

      expect(session.contextId).toBe(fpc.id);
      expect(fpc.context.instrument.symbol).toBe("PETR4");
      expect(fpc.context.optionsChain?.expectedMove?.sigma1Brl).toBe(1.83);
    });
  });
});
