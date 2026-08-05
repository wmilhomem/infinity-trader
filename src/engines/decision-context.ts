import type {
  MarketDimension,
  PortfolioDimension,
  StrategyDimension,
  TimeDimension,
} from "./context-engine";
import { buildStrategyDimension, buildTimeDimension } from "./context-engine";
import type { VolatilityLanguage, SkewState } from "../volatility/types";
import type { DecisionScore, ScoreInput } from "./decision-engine";
import type { Alerta } from "./rule-engine";
import type { Padrao } from "./behavior-engine";
import type { Perna } from "@/lib/payoff";
import type { DiaryEntry } from "./types";
import { interpretar } from "./simulation-interpreter";
import { computePositionIntelligence } from "./position-intelligence";

/**
 * Auditabilidade de Dados (Confidence Engine Outputs)
 * Ex: 97% (Mercado saudável) vs 42% (Volume pífio, Spread largo)
 * Nulo enquanto o Eixo 3 (Gateway B3) não fornecer dados reais de mercado.
 */
export type ConfidenceContext = {
  score: number;
  isReliable: boolean;
  diagnostics: string[]; // Ex: ["Spread de 12% detectado", "Book de ofertas vazio"]
};

/**
 * Snapshot Técnico (Realidade Matemática e de Mercado)
 * Aquilo que a bolsa é. Indiscutível.
 * `market` e `portfolio` são nulos até o Eixo 3 — nunca chute.
 */
export type TechnicalSnapshot = {
  market: MarketDimension | null;
  portfolio: PortfolioDimension | null;
  strategy: StrategyDimension;
  time: TimeDimension;
  pricing: {
    spot: number;
    expectedMoveBrl: number;
    probabilityOfProfit: number;
    daysToExpiration: number;
  };
  greeks: {
    netDelta: number;
    netGamma: number;
    netTheta: number;
    netVega: number;
  };
  volatility: {
    language: VolatilityLanguage;
    skew: SkewState;
  };
};

/**
 * Snapshot Cognitivo (O Estado do Trader)
 * Aquilo que o humano é. Sujeito a emoções, viéses e disciplinas temporárias.
 */
export type CognitiveSnapshot = {
  behavior: Padrao[]; // Vieses recentes (Ex: Tilt após 3 perdas)
  rules: Alerta[]; // Regras quebradas neste instante
  decisionScore: DecisionScore; // Qualidade estatística do preenchimento da operação
  alerts: string[]; // Overlay Alerts (Ex: 🔴 Theta Esmagador)
  playbook: string[]; // Recomendações Táticas extraídas da base
  narrative: string; // Síntese textual pura
  confidence: ConfidenceContext | null;
};

/**
 * DECISION CONTEXT (A Moeda do Sistema)
 * Nenhuma entidade (AI, Simulador, Diário) raciocina mais de forma isolada.
 * Este objeto mastigado flui através das veias do OS e é renderizado em blocos visuais.
 */
export type DecisionContext = {
  snapshotId: string; // Congelamento deste quadro (UUID do instante)
  captured_at: string;
  technical: TechnicalSnapshot;
  cognitive: CognitiveSnapshot;
};

export type DecisionContextInput = {
  pernas: Perna[];
  centro: number;
  ativo: string;
  dias: number;
  iv: number; // em %
  entries: DiaryEntry[];
  alertas: Alerta[];
  userScoreInput: Omit<ScoreInput, "interpretacao">;
};

/**
 * Monta o DecisionContext (a moeda do sistema) no instante atual.
 * Tudo flui do Position Intelligence + interpretador — nenhum motor roda solto.
 * `market`, `portfolio` e `confidence` ficam null até o Eixo 3.
 */
export function buildDecisionContext(input: DecisionContextInput): DecisionContext {
  const intel = computePositionIntelligence(input);
  const inter = interpretar(input.pernas, input.centro, input.ativo);

  const alerts: string[] = [];
  if (intel.tempo.status.includes("Crítico"))
    alerts.push("Theta esmagador: o decaimento diário está acelerando perto do vencimento.");
  else if (intel.tempo.status.includes("Acelerando"))
    alerts.push("Theta acelerando: perto do vencimento, a perda diária sobe de forma não-linear.");
  for (const a of input.alertas)
    if (a.severidade === "critico") alerts.push(`Regra quebrada: ${a.regra}`);

  return {
    snapshotId: crypto.randomUUID(),
    captured_at: new Date().toISOString(),
    technical: {
      market: null, // Eixo 3 (Gateway B3)
      portfolio: null, // Eixo 3 (Gateway B3)
      strategy: buildStrategyDimension(inter),
      time: buildTimeDimension(input.dias),
      pricing: {
        spot: input.centro,
        expectedMoveBrl: intel.probabilidade.expectedMoveBrl,
        probabilityOfProfit: intel.probabilidade.pop,
        daysToExpiration: input.dias,
      },
      greeks: {
        netDelta: intel.netDeltaContratos,
        netGamma: intel.netGammaContratos,
        netTheta: intel.netThetaPorDia,
        netVega: intel.netVegaPorPonto,
      },
      volatility: intel.volatility,
    },
    cognitive: {
      behavior: intel.padroes,
      rules: input.alertas,
      decisionScore: intel.score,
      alerts,
      playbook: inter.acompanhar,
      narrative: intel.synthesis,
      confidence: null, // Confidence Engine (sprint posterior, pré-requisito Eixo 3)
    },
  };
}
