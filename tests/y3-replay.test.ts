/**
 * Y.3.8 — Replay Reader Contract Tests
 *
 * Tests replay reader contracts:
 * - Empty readings returns empty comparison
 * - Temporal gaps calculated correctly
 * - Readings sorted by timestamp
 * - Observation text is factual, not evaluative
 * - Anti-recommendation: no bias/pattern diagnosis
 */

import { describe, test, expect } from "vitest";
import { buildReplayComparison } from "../src/lib/replay-reader";
import type { SavedReading } from "../src/lib/replay-reader";

const PAST = "2026-08-01T10:00:00.000Z";
const MID = "2026-08-15T14:30:00.000Z";
const RECENT = "2026-09-01T09:00:00.000Z";

function makeReading(
  id: string,
  timestamp: string,
  overrides?: Partial<SavedReading>,
): SavedReading {
  return {
    id,
    symbol: "PETR4",
    timestamp,
    spot: 38.47,
    interpretationCount: 1,
    hypothesisCount: 1,
    evidenceCount: 1,
    contraEvidenceCount: 0,
    ...overrides,
  };
}

describe("Y.3.8 — Replay", () => {
  describe("Comparison building", () => {
    test("empty readings returns empty comparison", () => {
      const result = buildReplayComparison([]);
      expect(result.readings).toEqual([]);
      expect(result.temporalGaps).toEqual([]);
      expect(result.observation).toBeNull();
    });

    test("single reading returns observation about single reading", () => {
      const readings = [makeReading("r1", PAST)];
      const result = buildReplayComparison(readings);
      expect(result.readings).toHaveLength(1);
      expect(result.observation).toBe("Uma única leitura registrada.");
    });

    test("two readings returns two readings observation", () => {
      const readings = [makeReading("r1", PAST), makeReading("r2", RECENT)];
      const result = buildReplayComparison(readings);
      expect(result.readings).toHaveLength(2);
      expect(result.observation).toBe("Duas leituras para comparar.");
    });

    test("three+ readings returns count observation", () => {
      const readings = [makeReading("r1", PAST), makeReading("r2", MID), makeReading("r3", RECENT)];
      const result = buildReplayComparison(readings);
      expect(result.readings).toHaveLength(3);
      expect(result.observation).toBe("3 leituras salvas. Comparação disponível.");
    });

    test("readings sorted by timestamp ascending", () => {
      const readings = [makeReading("r3", RECENT), makeReading("r1", PAST), makeReading("r2", MID)];
      const result = buildReplayComparison(readings);
      expect(result.readings[0].id).toBe("r1");
      expect(result.readings[1].id).toBe("r2");
      expect(result.readings[2].id).toBe("r3");
    });

    test("temporal gap calculated for consecutive readings", () => {
      const readings = [makeReading("r1", PAST), makeReading("r2", RECENT)];
      const result = buildReplayComparison(readings);
      expect(result.temporalGaps).toHaveLength(1);
      expect(result.temporalGaps[0].days).toBe(31);
    });

    test("no temporal gap for same-day readings", () => {
      const readings = [
        makeReading("r1", "2026-09-01T10:00:00.000Z"),
        makeReading("r2", "2026-09-01T14:00:00.000Z"),
      ];
      const result = buildReplayComparison(readings);
      expect(result.temporalGaps).toHaveLength(0);
    });

    test("multiple temporal gaps calculated", () => {
      const readings = [makeReading("r1", PAST), makeReading("r2", MID), makeReading("r3", RECENT)];
      const result = buildReplayComparison(readings);
      expect(result.temporalGaps).toHaveLength(2);
    });
  });

  describe("Null semantics", () => {
    test("readings with null spot handled", () => {
      const readings = [makeReading("r1", PAST, { spot: null })];
      const result = buildReplayComparison(readings);
      expect(result.readings[0].spot).toBeNull();
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("observation text is factual, not evaluative", () => {
      const readings = [
        makeReading("r1", PAST),
        makeReading("r2", RECENT),
        makeReading("r3", "2026-09-02T10:00:00.000Z"),
      ];
      const result = buildReplayComparison(readings);
      const evaluativeKeywords = [
        "viés",
        "bias",
        "padrao",
        "padrão",
        "erro",
        "aprendizado",
        "melhor",
        "pior",
        "performance",
        "progresso",
        "regresso",
      ];
      for (const kw of evaluativeKeywords) {
        expect(result.observation?.toLowerCase() ?? "").not.toContain(kw);
      }
    });

    test("no bias diagnosis in temporal gaps", () => {
      const readings = [makeReading("r1", PAST), makeReading("r2", RECENT)];
      const result = buildReplayComparison(readings);
      const diagnosisKeywords = ["viés", "bias", "identificado", "detectado", "sintoma"];
      for (const gap of result.temporalGaps) {
        const gapText = JSON.stringify(gap).toLowerCase();
        for (const kw of diagnosisKeywords) {
          expect(gapText).not.toContain(kw);
        }
      }
    });
  });
});
