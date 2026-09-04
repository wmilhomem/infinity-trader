/**
 * Y.4.4.2 — Internal Progression
 *
 * Determines the next PracticeComplexity level from practice history.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - NO scoring, ranking, or performance metrics
 * - NO "accuracy" or "success rate"
 * - Progression is based ONLY on cognitive complexity
 * - All 4 terminal choices (observe/simulate/follow/do-not-follow) are treated equally
 *
 * The only question this module answers:
 * "Given what the user has practiced, what complexity should come next?"
 *
 * It does NOT answer:
 * "Did the user make the right decision?"
 *
 * ADR-010 C7 (No Performance Metrics) applies.
 */

import type { PracticeSession } from "@/lib/practice-session-types";
import type { PracticeComplexity } from "@/lib/practice-complexity-types";
import {
  PRACTICE_COMPLEXITY_STAGES,
  getNextComplexity,
  COMPLEXITY_STAGES,
} from "@/lib/practice-complexity-types";

export type ProgressionInput = {
  sessions: PracticeSession[];
  targetComplexity?: PracticeComplexity;
};

export type ProgressionOutput = {
  recommendedComplexity: PracticeComplexity;
  reasoning: string;
  sessionsAtCurrentComplexity: number;
  hasPracticedAll: boolean;
};

export function determineNextComplexity(input: ProgressionInput): ProgressionOutput {
  if (input.targetComplexity) {
    return {
      recommendedComplexity: input.targetComplexity,
      reasoning: `Explicitly requested: ${input.targetComplexity}`,
      sessionsAtCurrentComplexity: 0,
      hasPracticedAll: false,
    };
  }

  if (!input.sessions || input.sessions.length === 0) {
    return {
      recommendedComplexity: "simple",
      reasoning: "No practice history. Starting at simplest complexity: simple.",
      sessionsAtCurrentComplexity: 0,
      hasPracticedAll: false,
    };
  }

  const practicedComplexities = categorizeByComplexity(input.sessions);

  let nextComplexity: PracticeComplexity = "simple";
  let foundNext = false;

  for (const stage of PRACTICE_COMPLEXITY_STAGES) {
    const count = practicedComplexities[stage] ?? 0;
    if (count === 0 && !foundNext) {
      nextComplexity = stage;
      foundNext = true;
    }
  }

  if (!foundNext) {
    return {
      recommendedComplexity: "explanation",
      reasoning: "All complexity levels have been practiced. Continuing at maximum complexity.",
      sessionsAtCurrentComplexity: practicedComplexities["explanation"] ?? 0,
      hasPracticedAll: true,
    };
  }

  return {
    recommendedComplexity: nextComplexity,
    reasoning: `Next complexity: ${nextComplexity} — ${COMPLEXITY_STAGES[nextComplexity].description}`,
    sessionsAtCurrentComplexity: 0,
    hasPracticedAll: false,
  };
}

function categorizeByComplexity(sessions: PracticeSession[]): Record<PracticeComplexity, number> {
  const map: Record<PracticeComplexity, number> = {
    simple: 0,
    composed: 0,
    conflict: 0,
    uncertainty: 0,
    structure: 0,
    explanation: 0,
  };

  for (const session of sessions) {
    const complexity = extractComplexity(session);
    if (complexity && map[complexity] !== undefined) {
      map[complexity]++;
    }
  }

  return map;
}

export function extractComplexity(session: PracticeSession): PracticeComplexity | null {
  const complexity = session._practiceComplexity ?? null;
  return complexity;
}

export function hasCompletedMinimumPractice(
  sessions: PracticeSession[],
  complexity: PracticeComplexity,
  minimum: number = 1,
): boolean {
  const count = sessions.filter((s) => extractComplexity(s) === complexity).length;
  return count >= minimum;
}

export function getComplexityCoverage(sessions: PracticeSession[]): {
  practiced: PracticeComplexity[];
  unpracticed: PracticeComplexity[];
} {
  const practiced = new Set<PracticeComplexity>();
  for (const session of sessions) {
    const c = extractComplexity(session);
    if (c) practiced.add(c);
  }

  const unpracticed = PRACTICE_COMPLEXITY_STAGES.filter((s) => !practiced.has(s));

  return {
    practiced: Array.from(practiced),
    unpracticed,
  };
}
