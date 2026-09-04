import { describe, test, expect } from "vitest";
import {
  scheduleReflection,
  markAsDue,
  markAsCompleted,
  markAsSkipped,
  cancelSchedule,
  isReviewable,
  isOverdue,
  advanceToDue,
  getSchedulesByStatus,
  getSchedulesBySession,
} from "../src/lib/reflection-scheduler";
import type { PracticeSession } from "../src/lib/practice-session-types";
import { createPracticeSession, completeStep, setChoice, terminateSession } from "../src/lib/practice-session";

const SESSION_ID = "ps-test-1";
const CONTEXT_ID = "fpc-test-1";

describe("Y.4.5 — Reflection Scheduling C1-C10", () => {
  describe("C1 — Reference Integrity: schedule references correct session", () => {
    test("1. scheduleReflection creates schedule with correct sessionId", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect(schedule.practiceSessionId).toBe(SESSION_ID);
      expect(schedule.contextId).toBe(CONTEXT_ID);
    });

    test("2. scheduleReflection creates schedule with correct status", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect(schedule.status).toBe("scheduled");
    });

    test("3. scheduleReflection generates unique ids", () => {
      const a = scheduleReflection(SESSION_ID, CONTEXT_ID);
      const b = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect(a.id).not.toBe(b.id);
    });
  });

  describe("C2 — Snapshot Immutability: scheduling does not alter T0", () => {
    test("4. scheduleReflection does not modify session object", () => {
      let session = createPracticeSession(CONTEXT_ID);
      session = completeStep(session, "observe", "contexto");
      session = completeStep(session, "interpret", "interpretação");
      session = completeStep(session, "hypothesize", "hipótese");
      session = completeStep(session, "evidence", "evidência");
      session = completeStep(session, "contra-evidence", "contra-evidência");
      session = completeStep(session, "risk", "risco");
      session = setChoice(session, "do-not-follow");
      session = terminateSession(session, "choice");

      const snapshotBefore = JSON.stringify(session);

      scheduleReflection(session.id, CONTEXT_ID);

      const snapshotAfter = JSON.stringify(session);

      expect(snapshotAfter).toBe(snapshotBefore);
    });
  });

  describe("C3 — TEI: T1 reflection must never rewrite T0", () => {
    test("5. scheduleReflection stores reference, not copy of snapshot", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect((schedule as any).snapshot).toBeUndefined();
      expect((schedule as any).context).toBeUndefined();
      expect((schedule as any).evidence).toBeUndefined();
      expect(schedule.practiceSessionId).toBe(SESSION_ID);
    });

    test("6. All state transitions preserve original references", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      const originalId = schedule.id;
      const originalSessionId = schedule.practiceSessionId;
      const originalContextId = schedule.contextId;

      schedule = markAsDue(schedule);
      expect(schedule.id).toBe(originalId);
      expect(schedule.practiceSessionId).toBe(originalSessionId);
      expect(schedule.contextId).toBe(originalContextId);

      schedule = markAsCompleted(schedule);
      expect(schedule.id).toBe(originalId);
      expect(schedule.practiceSessionId).toBe(originalSessionId);
      expect(schedule.contextId).toBe(originalContextId);
    });
  });

  describe("C4 — No Outcome Leakage: scheduler does not expose result", () => {
    test("7. scheduleReflection has no outcome field", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect(Object.keys(schedule).some((k) => k === "outcome")).toBe(false);
      expect(Object.keys(schedule).some((k) => k === "result")).toBe(false);
      expect(Object.keys(schedule).some((k) => k === "price")).toBe(false);
    });

    test("8. markAsCompleted does not accept or store outcome", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = markAsCompleted(schedule);

      expect(Object.keys(schedule).some((k) => k === "outcome")).toBe(false);
      expect(Object.keys(schedule).some((k) => k === "learning")).toBe(false);
    });
  });

  describe("C5 — Terminal Independence: all 4 choices can generate review", () => {
    test("9. All terminal choices can be scheduled for reflection", () => {
      const choices = ["observe", "simulate", "follow", "do-not-follow"] as const;

      for (const choice of choices) {
        const session = createPracticeSession(`${CONTEXT_ID}-${choice}`);
        const schedule = scheduleReflection(session.id, CONTEXT_ID);

        expect(schedule.status).toBe("scheduled");
        expect(schedule.practiceSessionId).toBe(session.id);
      }
    });
  });

  describe("C6 — Temporal State: scheduled → due → completed/skipped", () => {
    test("10. Initial state is scheduled", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect(schedule.status).toBe("scheduled");
    });

    test("11. scheduled → due", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);

      expect(schedule.status).toBe("due");
    });

    test("12. scheduled → completed", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = markAsCompleted(schedule);

      expect(schedule.status).toBe("completed");
    });

    test("13. scheduled → skipped", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsSkipped(schedule);

      expect(schedule.status).toBe("skipped");
    });

    test("14. completed cannot transition to another state", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = markAsCompleted(schedule);

      const before = JSON.stringify(schedule);
      schedule = cancelSchedule(schedule);

      expect(schedule.status).toBe("completed");
      expect(JSON.stringify(schedule)).toBe(before);
    });

    test("15. skipped cannot transition to completed", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsSkipped(schedule);

      const before = JSON.stringify(schedule);
      schedule = markAsCompleted(schedule);

      expect(schedule.status).toBe("skipped");
      expect(JSON.stringify(schedule)).toBe(before);
    });
  });

  describe("C7 — Cancellation: schedule can be cancelled while scheduled", () => {
    test("16. scheduled → cancelled", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = cancelSchedule(schedule);

      expect(schedule.status).toBe("cancelled");
    });

    test("17. due → cancelled", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = cancelSchedule(schedule);

      expect(schedule.status).toBe("cancelled");
    });

    test("18. completed cannot be cancelled", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = markAsCompleted(schedule);
      const statusBefore = schedule.status;

      schedule = cancelSchedule(schedule);

      expect(schedule.status).toBe(statusBefore);
    });
  });

  describe("C8 — Provenance: original context reference remains intact", () => {
    test("19. schedule preserves contextId reference", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      expect(schedule.contextId).toBe(CONTEXT_ID);
    });

    test("20. contextId does not change through state transitions", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = markAsCompleted(schedule);

      expect(schedule.contextId).toBe(CONTEXT_ID);
    });
  });

  describe("C9 — Replay Independence: reflection does not need to fetch market", () => {
    test("21. Schedule contains only temporal and reference data", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      const fields = Object.keys(schedule);
      const requiresMarketFetch = fields.some(
        (f) =>
          f === "marketData" ||
          f === "priceAtDecision" ||
          f === "ivAtDecision" ||
          f === "greeksAtDecision",
      );

      expect(requiresMarketFetch).toBe(false);
    });

    test("22. Schedule can be stored without market context", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      const serialized = JSON.stringify(schedule);
      const parsed = JSON.parse(serialized);

      expect(parsed.practiceSessionId).toBe(SESSION_ID);
      expect(parsed.contextId).toBe(CONTEXT_ID);
      expect(parsed.status).toBe("scheduled");
    });
  });

  describe("C10 — No Performance Metric: scheduler uses no score/accuracy/rank/XP", () => {
    test("23. scheduleReflection produces no performance-related fields", () => {
      const schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);

      const resultStr = JSON.stringify(schedule);
      const scoreTerms = [
        "score",
        "accuracy",
        "rate",
        "rank",
        "xp",
        "level",
        "performance",
        "success",
        "result",
      ];
      const hasScoreTerm = scoreTerms.some((term) =>
        resultStr.toLowerCase().includes(term),
      );

      expect(hasScoreTerm).toBe(false);
    });

    test("24. State transitions produce no performance-related fields", () => {
      let schedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      schedule = markAsDue(schedule);
      schedule = markAsCompleted(schedule);

      const resultStr = JSON.stringify(schedule);
      const scoreTerms = [
        "score",
        "accuracy",
        "rate",
        "rank",
        "xp",
        "level",
      ];
      const hasScoreTerm = scoreTerms.some((term) =>
        resultStr.toLowerCase().includes(term),
      );

      expect(hasScoreTerm).toBe(false);
    });
  });

  describe("advanceToDue and utilities", () => {
    test("25. advanceToDue transitions overdue schedules to due", () => {
      const oldSchedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      const oldScheduleModified = {
        ...oldSchedule,
        scheduledAt: new Date(Date.now() - 1000).toISOString(),
      };

      const result = advanceToDue([oldScheduleModified]);

      expect(result[0].status).toBe("due");
    });

    test("26. advanceToDue keeps future schedules as scheduled", () => {
      const futureSchedule = scheduleReflection(SESSION_ID, CONTEXT_ID);
      const futureModified = {
        ...futureSchedule,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      };

      const result = advanceToDue([futureModified]);

      expect(result[0].status).toBe("scheduled");
    });

    test("27. getSchedulesByStatus filters correctly", () => {
      const s1scheduled = scheduleReflection("s1", CONTEXT_ID);
      const s2 = scheduleReflection("s2", CONTEXT_ID);
      const otherCompleted = scheduleReflection("s3", CONTEXT_ID);
      let s3AsCompleted = scheduleReflection("s3", CONTEXT_ID);
      s3AsCompleted = markAsDue(s3AsCompleted);
      s3AsCompleted = markAsCompleted(s3AsCompleted);

      const result = getSchedulesByStatus([s1scheduled, s2, s3AsCompleted], "scheduled");

      expect(result).toHaveLength(2);
      const resultIds = result.map((r) => r.practiceSessionId);
      expect(resultIds).toContain("s1");
      expect(resultIds).toContain("s2");
      expect(resultIds).not.toContain("s3");
    });

    test("28. getSchedulesBySession filters correctly", () => {
      const s1 = scheduleReflection("s1", "ctx-1");
      const s2 = scheduleReflection("s2", "ctx-2");

      const result = getSchedulesBySession([s1, s2], "s1");

      expect(result).toHaveLength(1);
      expect(result[0].practiceSessionId).toBe("s1");
    });

    test("29. isReviewable returns true for scheduled and due", () => {
      const scheduled = scheduleReflection(SESSION_ID, CONTEXT_ID);
      let due = scheduleReflection(SESSION_ID, CONTEXT_ID);
      due = markAsDue(due);
      const completed = markAsCompleted(due);

      expect(isReviewable(scheduled)).toBe(true);
      expect(isReviewable(due)).toBe(true);
      expect(isReviewable(completed)).toBe(false);
    });

    test("30. isOverdue detects overdue schedules", () => {
      const overdue = {
        ...scheduleReflection(SESSION_ID, CONTEXT_ID),
        scheduledAt: new Date(Date.now() - 1000).toISOString(),
      };

      const notOverdue = {
        ...scheduleReflection(SESSION_ID, CONTEXT_ID),
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      };

      expect(isOverdue(overdue)).toBe(true);
      expect(isOverdue(notOverdue)).toBe(false);
      expect(isOverdue(markAsCompleted(overdue))).toBe(false);
    });
  });
});
