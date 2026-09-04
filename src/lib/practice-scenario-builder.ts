/**
 * Y.4.4.3 — Scenario Construction
 *
 * Creates a FrozenPracticeContext at a given complexity level.
 *
 * Flow:
 *   Scenario (complexity + base context)
 *       ↓
 *   buildContextByComplexity()
 *       ↓
 *   FrozenPracticeContext
 *       ↓
 *   PracticeSession
 *
 * NEVER:
 *   Scenario → Decision
 *
 * ADR-010 C4 (TEI) applies — the frozen context never leaks outcome.
 * ADR-010 C1 (Anti-Recommendation) applies — no directional content.
 */

import type { MarketContext } from "@/lib/market-context";
import type { PracticeComplexity } from "@/lib/practice-complexity-types";
import type { FrozenPracticeContext } from "@/lib/practice-session-types";
import { buildContextByComplexity } from "@/lib/practice-complexity-builder";

export type ScenarioOptions = {
  complexity: PracticeComplexity;
  baseContext: MarketContext;
  origin: "historical" | "laboratory";
};

export function buildScenario(options: ScenarioOptions): FrozenPracticeContext {
  const { complexity, baseContext, origin } = options;

  const composedContext = buildContextByComplexity(baseContext, complexity);

  const frozen: FrozenPracticeContext = {
    id: `scenario-${complexity}-${Date.now()}`,
    origin,
    frozenAt: new Date().toISOString(),
    context: composedContext,
    outcomeRevealed: false,
  };

  return frozen;
}

export function buildScenarioWithMetadata(
  options: ScenarioOptions,
  metadata?: Record<string, unknown>,
): FrozenPracticeContext & { scenarioMetadata?: Record<string, unknown> } {
  const frozen = buildScenario(options);
  return {
    ...frozen,
    scenarioMetadata: {
      targetComplexity: options.complexity,
      ...metadata,
    },
  };
}
