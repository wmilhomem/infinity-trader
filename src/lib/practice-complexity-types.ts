/**
 * Y.4.4 — Practice Complexity Types
 *
 * Defines the 6-level cognitive complexity model for Practice Sessions.
 *
 * IMPORTANT:
 * - Complexity is a PROPERTY OF THE CONTEXT, not of the user's decision
 * - Users do NOT see complexity levels
 * - Progression is based on cognitive complexity, NOT accuracy
 *
 * ADR-010 C4 (TEI) and C7 (No Performance Metrics) apply throughout.
 */

export type PracticeComplexity =
  "simple" | "composed" | "conflict" | "uncertainty" | "structure" | "explanation";

export const PRACTICE_COMPLEXITY_STAGES: PracticeComplexity[] = [
  "simple",
  "composed",
  "conflict",
  "uncertainty",
  "structure",
  "explanation",
];

export type ComplexityStage = {
  level: PracticeComplexity;
  order: number;
  description: string;
  contextCharacteristics: string[];
  userTask: string;
  whatIsPracticed: string;
};

export const COMPLEXITY_STAGES: Record<PracticeComplexity, ComplexityStage> = {
  simple: {
    level: "simple",
    order: 1,
    description: "Uma observação dominante, poucos elementos de contexto",
    contextCharacteristics: [
      "1-2 variáveis de mercado",
      "Informação completa e não-ambígua",
      "Sem contradições aparentes",
      "Observação direta suficiente",
    ],
    userTask: "Observe e descreva o que você vê.",
    whatIsPracticed: "Reconhecer — identificar informação observável",
  },
  composed: {
    level: "composed",
    order: 2,
    description: "2-3 elementos de contexto simultâneos que o usuário precisa integrar",
    contextCharacteristics: [
      "3-4 variáveis de mercado",
      "Informação completa",
      "Variáveis que se reforçam mutuamente",
      "Requer integração de observações",
    ],
    userTask: "Integre os elementos disponíveis e descreva o que isso pode significar.",
    whatIsPracticed: "Interpretar — integrar múltiplas variáveis",
  },
  conflict: {
    level: "conflict",
    order: 3,
    description: "Evidências apontando em direções diferentes",
    contextCharacteristics: [
      "Variáveis em tensão",
      "Sinais mistos no contexto",
      "Nenhuma direção claramente dominante",
      "Requer que o usuário identifique a tensão",
    ],
    userTask: "Identifique a tensão entre as evidências. O que contradiz o que?",
    whatIsPracticed: "Contrastar — perceber contradições antes de decidir",
  },
  uncertainty: {
    level: "uncertainty",
    order: 4,
    description: "Dados incompletos, ausentes ou suspeitos (quality=suspicious)",
    contextCharacteristics: [
      "Informação relevante ausente",
      "Campos com quality=suspicious",
      "IV ou Greeks com provenance fraca",
      "Não é possível formar visão completa",
    ],
    userTask: "Trabalhe com o que está disponível. Identifique o que você não sabe.",
    whatIsPracticed: "Decidir com incerteza — saber quando a informação não basta",
  },
  structure: {
    level: "structure",
    order: 5,
    description: "Cadeias e estruturas de opções mais complexas",
    contextCharacteristics: [
      "Múltiplas pernas/estruturas",
      "Comparação entre estruturas",
      "Greeks em interação",
      "Payoff mais elaborado",
    ],
    userTask: "Compare as estruturas disponíveis. O que cada uma expressa?",
    whatIsPracticed: "Estruturar — mapear relações entre componentes",
  },
  explanation: {
    level: "explanation",
    order: 6,
    description: "Usuário precisa explicitar e sustentar o próprio raciocínio",
    contextCharacteristics: [
      "Contexto de qualquer nível anterior",
      "Sistema solicita justificação formal",
      "Requer articulação explícita de evidências",
      "Pergunta: qual evidência faria você abandonar a hipótese?",
    ],
    userTask: "Explique por que sua hipótese depende dessas evidências.",
    whatIsPracticed: "Metacognição — articular e examinar o próprio processo",
  },
};

export function getNextComplexity(current: PracticeComplexity): PracticeComplexity {
  const stages = PRACTICE_COMPLEXITY_STAGES;
  const idx = stages.indexOf(current);
  if (idx === -1) return "simple";
  if (idx >= stages.length - 1) return "explanation";
  return stages[idx + 1];
}

export function getPreviousComplexity(current: PracticeComplexity): PracticeComplexity {
  const stages = PRACTICE_COMPLEXITY_STAGES;
  const idx = stages.indexOf(current);
  if (idx <= 0) return "simple";
  return stages[idx - 1];
}

export function isValidComplexity(value: string): value is PracticeComplexity {
  return PRACTICE_COMPLEXITY_STAGES.includes(value as PracticeComplexity);
}
