/**
 * Y.3.7 — DECISION SNAPSHOT READER
 *
 * Captures the complete decision point:
 * - Market context at the time of reading
 * - Chain reading state (interpretations, hypotheses, evidences)
 * - Personal risk rules declared
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Snapshot is a RECORD, not a "decision" or "conclusion"
 * - No "posicionamento decidido" or "decisão tomada"
 * - User still has full agency after seeing the snapshot
 */

import type { MarketContext } from "@/lib/market-context";
import type { ChainReadingState } from "@/lib/options-chain-types";
import type { PersonalRiskRule } from "@/lib/risk-rules";

export type DecisionSnapshot = {
  id: string;
  symbol: string;
  spot: number | null;
  timestamp: string;
  ivAtm: number | null;
  dte: number | null;
  interpretationCount: number;
  hypothesisCount: number;
  evidenceCount: number;
  contraEvidenceCount: number;
  ruleCount: number;
};

let _id = 0;
function genId(): string {
  return `snapshot-${++_id}-${Date.now()}`;
}

export function buildDecisionSnapshot(
  ctx: MarketContext | null,
  state: ChainReadingState,
  rules: PersonalRiskRule[],
): DecisionSnapshot {
  return {
    id: genId(),
    symbol: ctx?.instrument?.symbol ?? "—",
    spot: ctx?.quote?.last ?? null,
    timestamp: new Date().toISOString(),
    ivAtm: ctx?.optionsChain?.impliedVolatilityAtm?.value ?? null,
    dte: ctx?.optionsChain?.daysToExpiration ?? null,
    interpretationCount: state.interpretations.length,
    hypothesisCount: state.hypotheses.length,
    evidenceCount: state.evidences.filter((e) => e.tipo === "evidencia").length,
    contraEvidenceCount: state.evidences.filter((e) => e.tipo === "contraEvidencia").length,
    ruleCount: rules.filter((r) => r.active).length,
  };
}
