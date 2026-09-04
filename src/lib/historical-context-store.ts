/**
 * Y.4.2 — Historical Frozen Context Store
 *
 * Stores historical market contexts and their outcomes SEPARATELY.
 * This is the physical implementation of Temporal Epistemic Integrity (TEI).
 *
 * KEY PRINCIPLE:
 * FrozenContext.context is IMMUTABLE once stored.
 * The outcome is stored SEPARATELY and is only linked at replay time.
 * There is NO field on FrozenContext that points to its outcome.
 *
 * ADR-010 C4 (TEI) contract: context T0 must remain byte-for-byte identical
 * even after outcome T1 exists in the system.
 */

import type { MarketContext } from "@/lib/market-context";

export type MarketOutcome = {
  symbol: string;
  finalPrice: number | null;
  realizedVolatility: number | null;
  eventsOccurred: string[];
  recordedAt: string;
};

export type HistoricalFrozenContext = {
  id: string;
  frozenAt: string;
  frozenBy: "system" | "user";
  marketContext: MarketContext;
  outcome: MarketOutcome | null;
  outcomeRevealedAt: string | null;
};

const _store: Map<string, HistoricalFrozenContext> = new Map();
let _idCounter = 0;

function genId(prefix: string): string {
  return `${prefix}-${++_idCounter}-${Date.now()}`;
}

export function freezeHistoricalContext(
  marketContext: MarketContext,
  options?: { frozenBy?: "system" | "user" },
): HistoricalFrozenContext {
  const record: HistoricalFrozenContext = {
    id: genId("hfc"),
    frozenAt: new Date().toISOString(),
    frozenBy: options?.frozenBy ?? "system",
    marketContext,
    outcome: null,
    outcomeRevealedAt: null,
  };
  _store.set(record.id, record);
  return record;
}

export function storeOutcome(
  contextId: string,
  outcome: MarketOutcome,
): HistoricalFrozenContext | null {
  const record = _store.get(contextId);
  if (!record) return null;

  const updated: HistoricalFrozenContext = {
    ...record,
    outcome,
  };
  _store.set(contextId, updated);
  return updated;
}

export function revealOutcome(contextId: string): HistoricalFrozenContext | null {
  const record = _store.get(contextId);
  if (!record || !record.outcome) return null;

  const updated: HistoricalFrozenContext = {
    ...record,
    outcomeRevealedAt: new Date().toISOString(),
  };
  _store.set(contextId, updated);
  return updated;
}

export function getHistoricalContext(contextId: string): HistoricalFrozenContext | null {
  return _store.get(contextId) ?? null;
}

export function getFrozenContextForPractice(
  contextId: string,
): { context: MarketContext; outcomeRevealed: boolean } | null {
  const record = _store.get(contextId);
  if (!record) return null;
  return {
    context: record.marketContext,
    outcomeRevealed: record.outcomeRevealedAt !== null,
  };
}

export function getOutcomeForReplay(contextId: string): MarketOutcome | null {
  const record = _store.get(contextId);
  if (!record) return null;
  return record.outcome;
}

export function listHistoricalContexts(): HistoricalFrozenContext[] {
  return Array.from(_store.values()).sort(
    (a, b) => new Date(b.frozenAt).getTime() - new Date(a.frozenAt).getTime(),
  );
}

export function clearHistoricalStore(): void {
  _store.clear();
}

export function getStoreSize(): number {
  return _store.size;
}
