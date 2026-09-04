/**
 * Y.3.8 — REPLAY READER
 *
 * Compares saved readings to identify patterns in thinking.
 * Shows temporal gaps and observations — does NOT diagnose biases.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - No "bias detected" or "cognitive pattern identified"
 * - No evaluation of whether the user "learned" or "improved"
 * - Pure presentation of temporal facts
 */

import type { DecisionSnapshot } from "@/lib/decision-snapshot";

export type SavedReading = {
  id: string;
  symbol: string;
  timestamp: string;
  spot: number | null;
  interpretationCount: number;
  hypothesisCount: number;
  evidenceCount: number;
  contraEvidenceCount: number;
};

export type TemporalGap = {
  from: string;
  to: string;
  days: number;
};

export type ReplayComparison = {
  readings: SavedReading[];
  temporalGaps: TemporalGap[];
  observation: string | null;
};

function daysBetween(t1: string, t2: string): number {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function buildReplayComparison(readings: SavedReading[]): ReplayComparison {
  if (readings.length === 0) {
    return { readings: [], temporalGaps: [], observation: null };
  }

  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const temporalGaps: TemporalGap[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].timestamp, sorted[i].timestamp);
    if (gap > 0) {
      temporalGaps.push({
        from: sorted[i - 1].timestamp,
        to: sorted[i].timestamp,
        days: gap,
      });
    }
  }

  let observation: string | null = null;
  if (readings.length === 1) {
    observation = "Uma única leitura registrada.";
  } else if (readings.length === 2) {
    observation = "Duas leituras para comparar.";
  } else {
    observation = `${readings.length} leituras salvas. Comparação disponível.`;
  }

  return { readings: sorted, temporalGaps, observation };
}
