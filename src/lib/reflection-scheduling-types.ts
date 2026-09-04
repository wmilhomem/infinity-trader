/**
 * Y.4.5 — Reflection Scheduling Types
 *
 * Contracts for the temporal reflection scheduling mechanism.
 *
 * IMPORTANT DISTINCTION:
 * Y.4.5 is NOT the reflection itself.
 * It is the mechanism that determines WHEN a reflection can happen.
 *
 * ADR-010 C6 (Revisão Postergada) applies.
 * ADR-010 C4 (TEI) applies — T1 reflection must never rewrite T0.
 *
 * These types are PURE — no side effects, no storage.
 * Storage is delegated to the caller.
 */

export type ReflectionTrigger =
  | "time_delay"
  | "session_revisit"
  | "manual";

export type ReflectionStatus =
  | "scheduled"
  | "due"
  | "completed"
  | "skipped"
  | "cancelled";

export type ReflectionSchedule = {
  id: string;
  practiceSessionId: string;
  contextId: string;
  scheduledAt: string;
  trigger: ReflectionTrigger;
  status: ReflectionStatus;
  createdAt: string;
};

export type ReflectionTiming =
  | "soon"
  | "later"
  | "custom";

export const REFLECTION_TIMING_LABELS: Record<ReflectionTiming, string> = {
  soon: "Em breve",
  later: "Mais tarde",
  custom: "Escolher data",
};

export const DEFAULT_SCHEDULE_DELAY_MS = {
  soon: 24 * 60 * 60 * 1000,
  later: 3 * 24 * 60 * 60 * 1000,
};

export function getScheduleTimestamp(timing: ReflectionTiming): string {
  const now = Date.now();
  const delay = DEFAULT_SCHEDULE_DELAY_MS[timing] ?? DEFAULT_SCHEDULE_DELAY_MS.later;
  return new Date(now + delay).toISOString();
}
