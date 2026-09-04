/**
 * Y.4.1 — Practice Session Lifecycle
 *
 * Functions for Practice Session management.
 * All functions are pure — no side effects, no storage.
 * Storage is delegated to the caller.
 */

import type { MarketContext } from "@/lib/market-context";
import type {
  FrozenPracticeContext,
  PracticeSession,
  PracticeReflection,
  ProtocolStep,
  PracticeChoice,
  SessionStep,
} from "@/lib/practice-session-types";
import type { PracticeComplexity } from "@/lib/practice-complexity-types";
import { PROTOCOL_STEPS } from "@/lib/practice-session-types";

let _idCounter = 0;
function genId(prefix: string): string {
  return `${prefix}-${++_idCounter}-${Date.now()}`;
}

export function createFrozenContext(
  ctx: MarketContext,
  origin: "historical" | "laboratory",
): FrozenPracticeContext {
  return {
    id: genId("fpc"),
    origin,
    frozenAt: new Date().toISOString(),
    context: ctx,
    outcomeRevealed: false,
  };
}

export function createPracticeSession(
  frozenContextId: string,
  complexity?: PracticeComplexity,
): PracticeSession {
  return {
    id: genId("ps"),
    contextId: frozenContextId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    protocolSteps: PROTOCOL_STEPS.map((step): SessionStep => ({
      step,
      completed: false,
      content: null,
    })),
    terminationStep: null,
    choice: null,
    practiceSnapshot: null,
    reflectionScheduled: false,
    reflectionCompleted: false,
    _practiceComplexity: complexity,
  };
}

export function completeStep(
  session: PracticeSession,
  step: ProtocolStep,
  content: string,
): PracticeSession {
  const steps = session.protocolSteps.map((s) =>
    s.step === step ? { ...s, completed: true, content } : s,
  );
  return { ...session, protocolSteps: steps };
}

export function setChoice(session: PracticeSession, choice: PracticeChoice): PracticeSession {
  return { ...session, choice };
}

export function terminateSession(session: PracticeSession, atStep: ProtocolStep): PracticeSession {
  const steps = session.protocolSteps.map((s) =>
    s.step === atStep ? { ...s, completed: true } : s,
  );
  return {
    ...session,
    protocolSteps: steps,
    terminationStep: atStep,
    endedAt: new Date().toISOString(),
  };
}

export function scheduleReflection(session: PracticeSession): PracticeSession {
  return { ...session, reflectionScheduled: true };
}

export function createReflection(sessionId: string): PracticeReflection {
  return {
    id: genId("pr"),
    sessionId,
    completedAt: null,
    questions: {
      whatDidYouKnow: null,
      whatHappened: null,
      whatChanged: null,
      whatWouldYouDoAgain: null,
      whatDidYouLearn: null,
      ruleChangeNeeded: null,
    },
  };
}

export function buildPracticeSummary(session: PracticeSession): string {
  const completed = session.protocolSteps
    .filter((s) => s.completed)
    .map((s) => {
      switch (s.step) {
        case "observe":
          return "Observou";
        case "interpret":
          return "interpretou";
        case "hypothesize":
          return "formulou hipótese";
        case "evidence":
          return "registrou evidência";
        case "contra-evidence":
          return s.content ? "registrou contra-evidência" : "não registrou contra-evidência";
        case "risk":
          return "avaliou risco";
        case "choice":
          return session.choice ? `escolheu ${getChoiceLabel(session.choice)}` : "fez uma escolha";
        case "register":
          return "registrou";
        default:
          return s.step;
      }
    });

  if (completed.length === 0) return "Sessão iniciada sem etapas completadas.";

  return completed.join(" → ") + ".";
}

function getChoiceLabel(choice: PracticeChoice): string {
  const labels: Record<PracticeChoice, string> = {
    observe: "observar",
    simulate: "simular",
    follow: "seguir",
    "do-not-follow": "não seguir",
  };
  return labels[choice];
}

export function getSessionCompleteness(session: PracticeSession): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = session.protocolSteps.filter((s) => s.completed).length;
  const total = session.protocolSteps.length;
  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}

export function getTerminationDescription(session: PracticeSession): string | null {
  if (session.choice === null) return null;
  const descriptions: Record<PracticeChoice, string> = {
    observe: "Escolheu observar.",
    simulate: "Escolheu simular.",
    follow: "Registrou intenção de seguir.",
    "do-not-follow": "Decidiu não seguir.",
  };
  return descriptions[session.choice];
}
