/**
 * Y.4.1 — PRACTICE SESSION COMPONENT
 *
 * Walks the user through the 9-step decision protocol over a frozen market context.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Does not suggest direction, contract, strike, or structure
 * - Does not evaluate the quality of the user's choices
 * - "do-not-follow" is a complete and valid choice
 * - No score, ranking, or performance evaluation
 * - No outcome leakage — context is frozen without future data
 *
 * ADR-010 contracts implemented:
 * - Protocol: 9 steps (observe → interpret → hypothesize → evidence → contra-evidence → risk → choice → register)
 * - Choice: observe / simulate / follow / do-not-follow — all equally valid
 * - Session closes with "Revisar depois?" scheduling
 * - Session summary is process description, not quality judgment
 */

import { useState, useCallback } from "react";
import type {
  FrozenPracticeContext,
  PracticeSession,
  PracticeChoice,
  ProtocolStep,
} from "@/lib/practice-session-types";
import { PROTOCOL_STEPS, PRACTICE_CHOICES } from "@/lib/practice-session-types";
import {
  createPracticeSession,
  completeStep,
  setChoice,
  terminateSession,
  scheduleReflection,
  buildPracticeSummary,
  getTerminationDescription,
} from "@/lib/practice-session";
import { OptionsChainReader } from "@/components/options/OptionsChainReader";
import { buildDecisionSnapshot } from "@/lib/decision-snapshot";
import { buildInitialState } from "@/lib/options-chain-reader";
import { ChevronLeft, ChevronRight, CheckCircle2, X, BookOpen } from "lucide-react";

interface Props {
  frozenContext: FrozenPracticeContext;
  onSessionComplete: (session: PracticeSession) => void;
  onCancel: () => void;
}

const STEP_LABELS: Record<ProtocolStep, string> = {
  observe: "O que você observa?",
  interpret: "O que isso significa?",
  hypothesize: "Qual é sua hipótese?",
  evidence: "Que evidência apoia?",
  "contra-evidence": "Que evidência contradiz?",
  risk: "Qual é seu risco?",
  choice: "O que você escolhe?",
  register: "Registrar",
};

const STEP_HINTS: Record<ProtocolStep, string> = {
  observe: "Descreva o que você vê nos dados. Separe fato de interpretação.",
  interpret: "O que essas observações podem significar no contexto atual?",
  hypothesize: "Formule uma hipótese a partir da sua interpretação.",
  evidence: "Liste fatos que apoiam sua hipótese.",
  "contra-evidence": "Liste fatos que contradizem sua hipótese.",
  risk: "Como você avalia o risco nesta situação?",
  choice: "Escolha uma ação.",
  register: "Revise e registre.",
};

function ProgressBar({ steps, current }: { steps: ProtocolStep[]; current: number }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div
          key={step}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function ChoiceButton({
  choice,
  selected,
  onSelect,
}: {
  choice: { value: PracticeChoice; label: string; description: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      }`}
    >
      <div className="font-semibold text-foreground text-sm">{choice.label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{choice.description}</div>
    </button>
  );
}

export function PracticeSession({ frozenContext, onSessionComplete, onCancel }: Props) {
  const [session, setSession] = useState<PracticeSession>(() =>
    createPracticeSession(frozenContext.id),
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepText, setStepText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<PracticeChoice | null>(null);
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);

  const currentStep = PROTOCOL_STEPS[currentStepIndex];
  const isChoiceStep = currentStep === "choice";
  const isRegisterStep = currentStep === "register";

  const handleNext = useCallback(() => {
    if (isChoiceStep && selectedChoice) {
      const withChoice = setChoice(session, selectedChoice);
      const terminated = terminateSession(withChoice, currentStep);
      setSession(terminated);
      setShowReflectionPrompt(true);
      return;
    }

    if (isRegisterStep) {
      const terminated = terminateSession(session, currentStep);
      setSession(terminated);
      setShowReflectionPrompt(true);
      return;
    }

    if (stepText.trim()) {
      const updated = completeStep(session, currentStep, stepText.trim());
      setSession(updated);
    }

    if (currentStepIndex < PROTOCOL_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      setStepText("");
    }
  }, [
    session,
    currentStepIndex,
    stepText,
    isChoiceStep,
    isRegisterStep,
    selectedChoice,
    currentStep,
  ]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
      setStepText(
        session.protocolSteps.find((s) => s.step === PROTOCOL_STEPS[currentStepIndex - 1])
          ?.content ?? "",
      );
    }
  }, [currentStepIndex, session.protocolSteps]);

  const handleReflection = useCallback(
    (schedule: boolean) => {
      let finalSession = session;
      if (schedule) {
        finalSession = scheduleReflection(finalSession);
      }
      onSessionComplete(finalSession);
    },
    [session, onSessionComplete],
  );

  const completedSteps = session.protocolSteps.filter((s) => s.completed).length;
  const progress = Math.round((completedSteps / PROTOCOL_STEPS.length) * 100);

  if (showReflectionPrompt) {
    const summary = buildPracticeSummary(session);
    const termination = getTerminationDescription(session);

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-success" />
            <h2 className="text-base font-semibold text-foreground">Sessão concluída</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{summary}</p>

          {termination && <p className="text-sm text-foreground font-medium">{termination}</p>}
        </div>

        <div className="rounded-xl border border-info/30 bg-info/5 p-5">
          <p className="text-sm text-muted-foreground">
            Deseja registrar esta sessão para revisar depois?
          </p>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => handleReflection(false)}
              className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              Não, fechar agora
            </button>
            <button
              type="button"
              onClick={() => handleReflection(true)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Sim, revisar depois
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {frozenContext.origin === "laboratory"
              ? "Contexto do Laboratory"
              : "Contexto histórico"}{" "}
            · {frozenContext.context.symbol}
          </span>
        </div>
        <div className="mt-3">
          <OptionsChainReader context={frozenContext.context} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">{STEP_LABELS[currentStep]}</span>
          <span className="text-xs text-muted-foreground">
            {completedSteps}/{PROTOCOL_STEPS.length} etapas
          </span>
        </div>

        <ProgressBar steps={PROTOCOL_STEPS} current={currentStepIndex} />

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs text-muted-foreground">{STEP_HINTS[currentStep]}</p>

          {isChoiceStep ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {PRACTICE_CHOICES.map((choice) => (
                <ChoiceButton
                  key={choice.value}
                  choice={choice}
                  selected={selectedChoice === choice.value}
                  onSelect={() => setSelectedChoice(choice.value)}
                />
              ))}
            </div>
          ) : (
            <textarea
              value={stepText}
              onChange={(e) => setStepText(e.target.value)}
              placeholder="Escreva sua resposta..."
              rows={3}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm resize-none"
            />
          )}

          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                <ChevronLeft size={14} />
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={
                isChoiceStep
                  ? !selectedChoice
                  : currentStepIndex < PROTOCOL_STEPS.length - 1
                    ? false
                    : true
              }
              className="flex-1 flex items-center justify-center gap-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isRegisterStep ? (
                "Concluir"
              ) : (
                <>
                  Continuar
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 rounded-md border border-border bg-card px-4 py-2 text-xs text-muted-foreground hover:bg-accent"
        >
          <X size={12} />
          Cancelar sessão
        </button>
      </div>
    </div>
  );
}
