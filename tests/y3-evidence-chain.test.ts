/**
 * Y.3.5 — Evidence Chain Contract Tests
 *
 * Tests evidence chain reader contracts:
 * - Builds chain from ChainReadingState
 * - Observation → Hypothesis links preserved
 * - Evidence → Hypothesis links preserved (support / contradict)
 * - Null semantics (empty state → empty chain)
 * - Anti-recommendation: no chain as proof/validation
 */

import { describe, test, expect } from "vitest";
import { buildEvidenceChain } from "../src/lib/evidence-chain";

const NOW = "2026-09-01T19:00:00.000Z";

function makeInterpretation(
  texto: string,
): import("../src/lib/options-chain-types").Interpretation {
  return { id: `interp-${Math.random()}`, texto, fatosReferenciados: [], createdAt: NOW };
}

function makeHypothesis(
  texto: string,
  interpretaçãoId: string,
): import("../src/lib/options-chain-types").Hypothesis {
  return { id: `hyp-${Math.random()}`, texto, interpretaçãoId, createdAt: NOW };
}

function makeEvidence(
  tipo: "evidencia" | "contraEvidencia",
  texto: string,
  hipóteseId: string,
): import("../src/lib/options-chain-types").Evidence {
  return { id: `ev-${Math.random()}`, tipo, texto, hipóteseId, createdAt: NOW };
}

function emptyState(): import("../src/lib/options-chain-types").ChainReadingState {
  return { facts: [], interpretations: [], hypotheses: [], evidences: [] };
}

describe("Y.3.5 — Evidence Chain", () => {
  describe("Chain building", () => {
    test("empty state produces empty chain", () => {
      const state = emptyState();
      const chain = buildEvidenceChain(state);
      expect(chain.nodes).toEqual([]);
      expect(chain.hypothesisSupports).toEqual({});
      expect(chain.hypothesisContradicts).toEqual({});
    });

    test("observation added to chain nodes", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const state = { ...emptyState(), interpretations: [interp] };
      const chain = buildEvidenceChain(state);
      expect(chain.nodes.length).toBe(1);
      expect(chain.nodes[0].type).toBe("observation");
      expect(chain.nodes[0].texto).toBe("IV da put maior que call");
    });

    test("hypothesis linked to observation via interpretaçãoId", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const hyp = makeHypothesis("Mercado precificando demanda por proteção", interp.id);
      const state = { ...emptyState(), interpretations: [interp], hypotheses: [hyp] };
      const chain = buildEvidenceChain(state);
      expect(chain.nodes.length).toBe(2);
      expect(chain.observationHypotheses[interp.id]).toContain(hyp.id);
    });

    test("evidence linked to hypothesis as supporting", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const hyp = makeHypothesis("Mercado precificando demanda por proteção", interp.id);
      const ev = makeEvidence("evidencia", "Volume de puts aumentando", hyp.id);
      const state = {
        ...emptyState(),
        interpretations: [interp],
        hypotheses: [hyp],
        evidences: [ev],
      };
      const chain = buildEvidenceChain(state);
      expect(chain.nodes.length).toBe(3);
      expect(chain.hypothesisSupports[hyp.id]).toContain(ev.id);
      expect(chain.hypothesisContradicts[hyp.id]).not.toContain(ev.id);
    });

    test("contra-evidence linked to hypothesis as contradicting", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const hyp = makeHypothesis("Mercado precificando demanda por proteção", interp.id);
      const ev = makeEvidence("contraEvidencia", "Volume de calls também aumentando", hyp.id);
      const state = {
        ...emptyState(),
        interpretations: [interp],
        hypotheses: [hyp],
        evidences: [ev],
      };
      const chain = buildEvidenceChain(state);
      expect(chain.nodes.length).toBe(3);
      expect(chain.hypothesisContradicts[hyp.id]).toContain(ev.id);
      expect(chain.hypothesisSupports[hyp.id]).not.toContain(ev.id);
    });

    test("multiple observations each with their own hypotheses", () => {
      const interp1 = makeInterpretation("IV da put maior que call");
      const interp2 = makeInterpretation("Skew negativo");
      const hyp1 = makeHypothesis("Hipótese 1", interp1.id);
      const hyp2 = makeHypothesis("Hipótese 2", interp2.id);
      const state = {
        ...emptyState(),
        interpretations: [interp1, interp2],
        hypotheses: [hyp1, hyp2],
      };
      const chain = buildEvidenceChain(state);
      expect(chain.nodes.length).toBe(4);
      expect(chain.observationHypotheses[interp1.id]).toContain(hyp1.id);
      expect(chain.observationHypotheses[interp2.id]).toContain(hyp2.id);
    });

    test("multiple evidence for same hypothesis", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const hyp = makeHypothesis("Hipótese", interp.id);
      const ev1 = makeEvidence("evidencia", "Evidência 1", hyp.id);
      const ev2 = makeEvidence("evidencia", "Evidência 2", hyp.id);
      const state = {
        ...emptyState(),
        interpretations: [interp],
        hypotheses: [hyp],
        evidences: [ev1, ev2],
      };
      const chain = buildEvidenceChain(state);
      expect(chain.hypothesisSupports[hyp.id]).toHaveLength(2);
    });
  });

  describe("Null semantics", () => {
    test("hypothesis without linked observation produces orphan hypothesis node", () => {
      const hyp = makeHypothesis("Hipótese sem observação", "non-existent-interp-id");
      const state = { ...emptyState(), hypotheses: [hyp] };
      const chain = buildEvidenceChain(state);
      const hypNode = chain.nodes.find((n) => n.id === hyp.id);
      expect(hypNode).toBeDefined();
    });

    test("evidence without linked hypothesis produces orphan evidence node", () => {
      const ev = makeEvidence("evidencia", "Evidência sem hipótese", "non-existent-hyp-id");
      const state = { ...emptyState(), evidences: [ev] };
      const chain = buildEvidenceChain(state);
      const evNode = chain.nodes.find((n) => n.id === ev.id);
      expect(evNode).toBeDefined();
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("no node text contains recommendation language", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const hyp = makeHypothesis("Mercado pode estar precificando maior demanda", interp.id);
      const ev = makeEvidence("evidencia", "Volume aumentando na mesma faixa", hyp.id);
      const state = {
        ...emptyState(),
        interpretations: [interp],
        hypotheses: [hyp],
        evidences: [ev],
      };
      const chain = buildEvidenceChain(state);
      const recommendationKeywords = [
        "prova",
        "confirma",
        "valid",
        "definitiv",
        "forte",
        "fraco",
        "confirmado",
        "correto",
        "incorreto",
        "bom",
        "ruim",
        "melhor",
        "pior",
      ];
      for (const node of chain.nodes) {
        for (const kw of recommendationKeywords) {
          expect(node.texto.toLowerCase()).not.toContain(kw);
        }
      }
    });

    test("no hypothesis node type label is evaluative", () => {
      const interp = makeInterpretation("IV da put maior que call");
      const hyp = makeHypothesis("Hipótese", interp.id);
      const state = { ...emptyState(), interpretations: [interp], hypotheses: [hyp] };
      const chain = buildEvidenceChain(state);
      const hypNode = chain.nodes.find((n) => n.type === "hypothesis")!;
      expect(hypNode).toBeDefined();
      const evaluativeLabels = ["confirmada", "validada", "rejeitada", "forte", "fraca"];
      for (const label of evaluativeLabels) {
        expect(hypNode.texto.toLowerCase()).not.toContain(label);
      }
    });
  });
});
