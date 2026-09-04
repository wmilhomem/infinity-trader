/**
 * Y.4.1 — Practice Session Types
 *
 * Contracts for Practice Session as defined in ADR-010.
 */

import type { MarketContext } from "@/lib/market-context";
import type { DecisionSnapshot } from "@/lib/decision-snapshot";
import type { PracticeComplexity } from "@/lib/practice-complexity-types";

export type ProtocolStep =
  | "context"
  | "observe"
  | "interpret"
  | "hypothesize"
  | "evidence"
  | "contra-evidence"
  | "risk"
  | "choice"
  | "register";

export const PROTOCOL_STEPS: ProtocolStep[] = [
  "observe",
  "interpret",
  "hypothesize",
  "evidence",
  "contra-evidence",
  "risk",
  "choice",
  "register",
];

export type PracticeChoice = "observe" | "simulate" | "follow" | "do-not-follow";

export const PRACTICE_CHOICES: { value: PracticeChoice; label: string; description: string }[] = [
  { value: "observe", label: "Observar", description: "Manter a situação em观望 sem agir." },
  {
    value: "simulate",
    label: "Simular",
    description: "Levar ao simulador para explorar estruturas.",
  },
  { value: "follow", label: "Seguir", description: "Registrar intenção de operar." },
  { value: "do-not-follow", label: "Não seguir", description: "Decidir não agir nesta situação." },
];

export type FrozenPracticeContext = {
  id: string;
  origin: "historical" | "laboratory";
  frozenAt: string;
  context: MarketContext;
  outcomeRevealed: boolean;
};

export type SessionStep = {
  step: ProtocolStep;
  completed: boolean;
  content: string | null;
};

export type PracticeSession = {
  id: string;
  contextId: string;
  startedAt: string;
  endedAt: string | null;
  protocolSteps: SessionStep[];
  terminationStep: ProtocolStep | null;
  choice: PracticeChoice | null;
  practiceSnapshot: DecisionSnapshot | null;
  reflectionScheduled: boolean;
  reflectionCompleted: boolean;
  _practiceComplexity?: PracticeComplexity;
};

export type PracticeReflection = {
  id: string;
  sessionId: string;
  completedAt: string | null;
  questions: {
    whatDidYouKnow: string | null;
    whatHappened: string | null;
    whatChanged: string | null;
    whatWouldYouDoAgain: string | null;
    whatDidYouLearn: string | null;
    ruleChangeNeeded: string | null;
  };
};
