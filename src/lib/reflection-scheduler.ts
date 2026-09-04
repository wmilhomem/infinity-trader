/**
 * Y.4.5 — Reflection Scheduler
 *
 * Pure functions for managing the reflection scheduling lifecycle.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Does NOT reveal outcomes
 * - Does NOT evaluate the decision
 * - Does NOT score, rank, or measure performance
 * - Only manages WHEN reflection can occur
 *
 * TEI CONTRACT (ADR-010 C4):
 * scheduleReflection() creates a reference.
 * completeReflection() MUST NOT modify the T0 snapshot.
 *
 * These functions are PURE — no side effects, no storage.
 * Storage is delegated to the caller.
 */

import type {
  ReflectionSchedule,
  ReflectionTrigger,
  ReflectionStatus,
  ReflectionTiming,
} from "@/lib/reflection-scheduling-types";
import {
  getScheduleTimestamp,
} from "@/lib/reflection-scheduling-types";

let _idCounter = 0;

function genId(prefix: string): string {
  return `${prefix}-${++_idCounter}-${Date.now()}`;
}

export function scheduleReflection(
  sessionId: string,
  contextId: string,
  timing: ReflectionTiming = "later",
): ReflectionSchedule {
  return {
    id: genId("rfl"),
    practiceSessionId: sessionId,
    contextId,
    scheduledAt: getScheduleTimestamp(timing),
    trigger: timing === "manual" ? "manual" : "time_delay",
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };
}

export function markAsDue(schedule: ReflectionSchedule): ReflectionSchedule {
  if (schedule.status !== "scheduled") {
    return schedule;
  }
  return { ...schedule, status: "due" };
}

export function markAsCompleted(schedule: ReflectionSchedule): ReflectionSchedule {
  if (schedule.status === "cancelled" || schedule.status === "skipped") {
    return schedule;
  }
  return { ...schedule, status: "completed" };
}

export function markAsSkipped(schedule: ReflectionSchedule): ReflectionSchedule {
  if (schedule.status === "cancelled" || schedule.status === "completed") {
    return schedule;
  }
  return { ...schedule, status: "skipped" };
}

export function cancelSchedule(schedule: ReflectionSchedule): ReflectionSchedule {
  if (schedule.status === "completed" || schedule.status === "skipped") {
    return schedule;
  }
  return { ...schedule, status: "cancelled" };
}

export function isReviewable(schedule: ReflectionSchedule): boolean {
  return (
    schedule.status === "due" ||
    schedule.status === "scheduled"
  );
}

export function getScheduleAge(schedule: ReflectionSchedule): number {
  return Date.now() - new Date(schedule.createdAt).getTime();
}

export function isOverdue(schedule: ReflectionSchedule): boolean {
  if (schedule.status !== "scheduled" && schedule.status !== "due") {
    return false;
  }
  return Date.now() >= new Date(schedule.scheduledAt).getTime();
}

export function advanceToDue(schedules: ReflectionSchedule[]): ReflectionSchedule[] {
  return schedules.map((s) => {
    if (
      (s.status === "scheduled") &&
      Date.now() >= new Date(s.scheduledAt).getTime()
    ) {
      return { ...s, status: "due" as ReflectionStatus };
    }
    return s;
  });
}

export function getSchedulesByStatus(
  schedules: ReflectionSchedule[],
  status: ReflectionStatus,
): ReflectionSchedule[] {
  return schedules.filter((s) => s.status === status);
}

export function getSchedulesBySession(
  schedules: ReflectionSchedule[],
  sessionId: string,
): ReflectionSchedule[] {
  return schedules.filter((s) => s.practiceSessionId === sessionId);
}
