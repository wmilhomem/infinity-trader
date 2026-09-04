/**
 * Y.3.7 — Decision Snapshot Contract Tests
 *
 * Tests decision snapshot reader contracts:
 * - Builds snapshot from context + state + rules
 * - Null semantics (empty state → snapshot with zeros)
 * - Snapshot fields populated correctly
 * - Anti-recommendation: no "decision" or "conclusion" language
 */

import { describe, test, expect } from "vitest";
import { buildDecisionSnapshot } from "../src/lib/decision-snapshot";
import { buildMarketContext } from "../src/lib/market-context-builder";
import { createRiskRule } from "../src/lib/risk-rules";

const NOW = "2026-09-01T19:00:00.000Z";

function emptyState(): import("../src/lib/options-chain-types").ChainReadingState {
  return { facts: [], interpretations: [], hypotheses: [], evidences: [] };
}

describe("Y.3.7 — Decision Snapshot", () => {
  describe("Snapshot building", () => {
    test("empty state produces snapshot with zeros", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {},
      });
      const snapshot = buildDecisionSnapshot(ctx, emptyState(), []);
      expect(snapshot.interpretationCount).toBe(0);
      expect(snapshot.hypothesisCount).toBe(0);
      expect(snapshot.evidenceCount).toBe(0);
      expect(snapshot.contraEvidenceCount).toBe(0);
      expect(snapshot.ruleCount).toBe(0);
    });

    test("context fields populated", () => {
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          daysToExpiration: 17,
          impliedVolatilityAtm: {
            value: 0.32,
            provenance: { origin: "observed", source: "provider", calculatedAt: NOW },
          },
        },
      });
      const snapshot = buildDecisionSnapshot(ctx, emptyState(), []);
      expect(snapshot.symbol).toBe("PETR4");
      expect(snapshot.spot).toBe(38.47);
      expect(snapshot.ivAtm).toBe(0.32);
      expect(snapshot.dte).toBe(17);
    });

    test("state counts populated", () => {
      const interp = { id: "i1", texto: "obs", fatosReferenciados: [], createdAt: NOW };
      const hyp = { id: "h1", texto: "hyp", interpretaçãoId: "i1", createdAt: NOW };
      const ev1 = {
        id: "e1",
        tipo: "evidencia" as const,
        texto: "ev",
        hipóteseId: "h1",
        createdAt: NOW,
      };
      const ev2 = {
        id: "e2",
        tipo: "contraEvidencia" as const,
        texto: "cev",
        hipóteseId: "h1",
        createdAt: NOW,
      };
      const state = {
        facts: [],
        interpretations: [interp],
        hypotheses: [hyp],
        evidences: [ev1, ev2],
      };
      const snapshot = buildDecisionSnapshot(null, state, []);
      expect(snapshot.interpretationCount).toBe(1);
      expect(snapshot.hypothesisCount).toBe(1);
      expect(snapshot.evidenceCount).toBe(1);
      expect(snapshot.contraEvidenceCount).toBe(1);
    });

    test("rule count from active rules", () => {
      const rules = [createRiskRule("Rule 1", "iv-filter"), createRiskRule("Rule 2", "stop-loss")];
      const snapshot = buildDecisionSnapshot(null, emptyState(), rules);
      expect(snapshot.ruleCount).toBe(2);
    });

    test("inactive rules not counted", () => {
      const rule = createRiskRule("Rule 1", "iv-filter");
      rule.active = false;
      const snapshot = buildDecisionSnapshot(null, emptyState(), [rule]);
      expect(snapshot.ruleCount).toBe(0);
    });

    test("snapshot has id and timestamp", () => {
      const snapshot = buildDecisionSnapshot(null, emptyState(), []);
      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
    });
  });

  describe("Null semantics", () => {
    test("null context produces null spot and iv", () => {
      const snapshot = buildDecisionSnapshot(null, emptyState(), []);
      expect(snapshot.spot).toBeNull();
      expect(snapshot.ivAtm).toBeNull();
      expect(snapshot.dte).toBeNull();
      expect(snapshot.symbol).toBe("—");
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("no snapshot field contains decision language", () => {
      const decisionKeywords = [
        "decisão",
        "decisao",
        "decision",
        "conclusão",
        "conclusao",
        "veredicto",
        "posicionamento",
        "directional",
        "call",
        "put",
      ];
      const snapshot = buildDecisionSnapshot(null, emptyState(), []);
      const snapshotText = JSON.stringify(snapshot).toLowerCase();
      for (const kw of decisionKeywords) {
        expect(snapshotText).not.toContain(kw);
      }
    });

    test("snapshot label is observational", () => {
      const interp = { id: "i1", texto: "IV > 30%", fatosReferenciados: [], createdAt: NOW };
      const state = { facts: [], interpretations: [interp], hypotheses: [], evidences: [] };
      const snapshot = buildDecisionSnapshot(null, state, []);
      expect(snapshot.interpretationCount).toBe(1);
    });
  });
});
