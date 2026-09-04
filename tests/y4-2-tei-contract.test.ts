import { describe, test, expect, beforeEach } from "vitest";
import {
  freezeHistoricalContext,
  storeOutcome,
  revealOutcome,
  getHistoricalContext,
  getFrozenContextForPractice,
  getOutcomeForReplay,
  listHistoricalContexts,
  clearHistoricalStore,
  getStoreSize,
} from "../src/lib/historical-context-store";
import { buildMarketContext } from "../src/lib/market-context-builder";
import type { MarketContext } from "../src/lib/market-context";

const PETR4_T0: MarketContext = buildMarketContext({
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

const PETR4_OUTCOME_T1 = {
  symbol: "PETR4",
  finalPrice: 37.82,
  realizedVolatility: 0.31,
  eventsOccurred: [" earnings ", "iv crush "],
  recordedAt: "2026-09-19T18:00:00.000Z",
};

describe("Y.4.2 — Historical Frozen Context & TEI", () => {
  beforeEach(() => {
    clearHistoricalStore();
  });

  describe("TEI Core Contract: context T0 is never modified by T1", () => {
    test("1. freezeHistoricalContext stores context with null outcome", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);

      expect(hfc.id).toBeTruthy();
      expect(hfc.outcome).toBeNull();
      expect(hfc.outcomeRevealedAt).toBeNull();
      expect(hfc.marketContext.instrument.symbol).toBe("PETR4");
      expect(hfc.marketContext.optionsChain?.atm?.strike).toBe(38.5);
    });

    test("2. storeOutcome does NOT modify the marketContext field", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      const contextBeforeOutcome = JSON.stringify(hfc.marketContext);

      const withOutcome = storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      expect(withOutcome).not.toBeNull();
      expect(withOutcome!.marketContext).toBe(hfc.marketContext);
      expect(JSON.stringify(withOutcome!.marketContext)).toBe(contextBeforeOutcome);
    });

    test("3. Context T0 is byte-for-byte identical before and after outcome stored", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      const contextSnapshot = structuredClone(hfc.marketContext);

      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const afterOutcome = getHistoricalContext(hfc.id);
      expect(afterOutcome).not.toBeNull();
      expect(afterOutcome!.marketContext).toEqual(contextSnapshot);
      expect(afterOutcome!.marketContext).toEqual(PETR4_T0);
    });

    test("4. Multiple outcomes stored do not accumulate on context", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      const contextSnapshot = structuredClone(hfc.marketContext);

      storeOutcome(hfc.id, PETR4_OUTCOME_T1);
      storeOutcome(hfc.id, { ...PETR4_OUTCOME_T1, finalPrice: 39.1 });
      storeOutcome(hfc.id, { ...PETR4_OUTCOME_T1, finalPrice: 36.5 });

      const final = getHistoricalContext(hfc.id);
      expect(final!.marketContext).toEqual(contextSnapshot);
      expect(final!.outcome?.finalPrice).toBe(36.5);
    });
  });

  describe("Practice interface never exposes outcome", () => {
    test("5. getFrozenContextForPractice returns context WITHOUT outcome", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const practice = getFrozenContextForPractice(hfc.id);

      expect(practice).not.toBeNull();
      expect(practice!.context).toEqual(PETR4_T0);
      expect(Object.keys(practice!).some((k) => k === "outcome")).toBe(false);
    });

    test("6. getFrozenContextForPractice reports outcomeRevealed=false before reveal", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const practice = getFrozenContextForPractice(hfc.id);

      expect(practice!.outcomeRevealed).toBe(false);
    });

    test("7. getFrozenContextForPractice reports outcomeRevealed=true after reveal", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const revealed = revealOutcome(hfc.id);
      const practice = getFrozenContextForPractice(hfc.id);

      expect(revealed!.outcomeRevealedAt).toBeTruthy();
      expect(practice!.outcomeRevealed).toBe(true);
    });

    test("8. getOutcomeForReplay returns outcome only when available", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);

      const before = getOutcomeForReplay(hfc.id);
      expect(before).toBeNull();

      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const after = getOutcomeForReplay(hfc.id);
      expect(after).not.toBeNull();
      expect(after!.finalPrice).toBe(37.82);
      expect(after!.realizedVolatility).toBe(0.31);
    });

    test("9. getHistoricalContext still returns context intact after reveal", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      storeOutcome(hfc.id, PETR4_OUTCOME_T1);
      revealOutcome(hfc.id);

      const retrieved = getHistoricalContext(hfc.id);

      expect(retrieved!.marketContext).toEqual(PETR4_T0);
      expect(retrieved!.outcome).not.toBeNull();
      expect(retrieved!.outcomeRevealedAt).toBeTruthy();
    });
  });

  describe("ADR-010 C4 — Temporal Epistemic Integrity", () => {
    test("10. Context T0 used for practice is identical to original after T1 outcome exists", () => {
      const original = PETR4_T0;
      const hfc = freezeHistoricalContext(original);

      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const forPractice = getFrozenContextForPractice(hfc.id);

      expect(forPractice!.context).toEqual(original);
      expect(forPractice!.context.instrument.symbol).toBe("PETR4");
      expect(forPractice!.context.optionsChain?.atm?.strike).toBe(38.5);
      expect(forPractice!.context.optionsChain?.impliedVolatilityAtm?.value).toBe(0.287);
      expect(forPractice!.context.optionsChain?.expectedMove?.sigma1Brl).toBe(1.83);
    });

    test("11. outcomeRevealed flag correctly tracks revelation state", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      expect(hfc.outcomeRevealedAt).toBeNull();

      storeOutcome(hfc.id, PETR4_OUTCOME_T1);
      expect(getHistoricalContext(hfc.id)!.outcomeRevealedAt).toBeNull();

      revealOutcome(hfc.id);
      expect(getHistoricalContext(hfc.id)!.outcomeRevealedAt).not.toBeNull();
    });

    test("12. There is no field on HistoricalFrozenContext that links context to outcome", () => {
      const hfc = freezeHistoricalContext(PETR4_T0);
      storeOutcome(hfc.id, PETR4_OUTCOME_T1);

      const keys = Object.keys(hfc);
      expect(keys).not.toContain("context");
      expect(keys).toContain("marketContext");
      expect(keys).toContain("outcome");

      const keysWithLinks = keys.filter(
        (k) =>
          k.includes("link") ||
          k.includes("ref") ||
          k.includes("pointer") ||
          k.includes("outcomeContext"),
      );
      expect(keysWithLinks).toHaveLength(0);
    });
  });

  describe("List and management", () => {
    test("13. listHistoricalContexts returns all stored contexts", () => {
      const a = freezeHistoricalContext(PETR4_T0);
      const b = freezeHistoricalContext(PETR4_T0);

      const list = listHistoricalContexts();

      expect(list).toHaveLength(2);
      expect(list.map((h) => h.id)).toContain(a.id);
      expect(list.map((h) => h.id)).toContain(b.id);
    });

    test("14. listHistoricalContexts sorted by frozenAt descending", () => {
      const first = freezeHistoricalContext(PETR4_T0);
      const second = freezeHistoricalContext(PETR4_T0);

      const list = listHistoricalContexts();

      const timestamps = list.map((h) => h.frozenAt);
      const sorted = [...timestamps].sort((a, b) => b.localeCompare(a));
      expect(timestamps).toEqual(sorted);
      expect(list.map((h) => h.id)).toContain(first.id);
      expect(list.map((h) => h.id)).toContain(second.id);
    });

    test("15. getStoreSize returns correct count", () => {
      expect(getStoreSize()).toBe(0);
      freezeHistoricalContext(PETR4_T0);
      freezeHistoricalContext(PETR4_T0);
      expect(getStoreSize()).toBe(2);
    });
  });
});
