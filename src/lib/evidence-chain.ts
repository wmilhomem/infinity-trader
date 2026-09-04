/**
 * Y.3.5 — EVIDENCE CHAIN READER
 *
 * Builds a read-only chain view from registered interpretations, hypotheses, and evidences.
 * Shows the logical flow: Observation → Hypothesis → Evidence/Contra-Evidence.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Shows connections as facts, NOT as "proof" or "confirmation"
 * - No evaluation of strength
 * - No conclusion language
 */

import type { ChainReadingState } from "@/lib/options-chain-types";

export type EvidenceChainNode = {
  id: string;
  type: "observation" | "hypothesis" | "evidence" | "contra-evidence";
  texto: string;
  createdAt: string;
};

export type EvidenceChain = {
  nodes: EvidenceChainNode[];
  hypothesisSupports: Record<string, string[]>;
  hypothesisContradicts: Record<string, string[]>;
  observationHypotheses: Record<string, string[]>;
};

export function buildEvidenceChain(state: ChainReadingState): EvidenceChain {
  const nodes: EvidenceChainNode[] = [];
  const hypothesisSupports: Record<string, string[]> = {};
  const hypothesisContradicts: Record<string, string[]> = {};
  const observationHypotheses: Record<string, string[]> = {};

  for (const interp of state.interpretations) {
    nodes.push({
      id: interp.id,
      type: "observation",
      texto: interp.texto,
      createdAt: interp.createdAt,
    });
    observationHypotheses[interp.id] = [];
  }

  for (const hyp of state.hypotheses) {
    nodes.push({
      id: hyp.id,
      type: "hypothesis",
      texto: hyp.texto,
      createdAt: hyp.createdAt,
    });
    if (!hypothesisSupports[hyp.id]) hypothesisSupports[hyp.id] = [];
    if (!hypothesisContradicts[hyp.id]) hypothesisContradicts[hyp.id] = [];
    if (observationHypotheses[hyp.interpretaçãoId]) {
      observationHypotheses[hyp.interpretaçãoId].push(hyp.id);
    }
  }

  for (const ev of state.evidences) {
    nodes.push({
      id: ev.id,
      type: ev.tipo === "evidencia" ? "evidence" : "contra-evidence",
      texto: ev.texto,
      createdAt: ev.createdAt,
    });
    if (ev.tipo === "evidencia") {
      hypothesisSupports[ev.hipóteseId]?.push(ev.id);
    } else {
      hypothesisContradicts[ev.hipóteseId]?.push(ev.id);
    }
  }

  return { nodes, hypothesisSupports, hypothesisContradicts, observationHypotheses };
}
