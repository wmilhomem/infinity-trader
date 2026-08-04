import type { Perna } from "@/lib/payoff";
import { interpretar, type Interpretacao } from "./simulation-interpreter";
import type { VolatilityLanguage, SkewState } from "../volatility/types";
import { getExpectedMove, calculateProbabilityOfProfit } from "../pricing/probability";
import { calcularDecisionScore, type DecisionScore, type ScoreInput } from "./decision-engine";

export type RiskRegime = "tranquilo" | "explosivo" | "incerto";

export type IntelligenceContext = {
  // O que a estrutura significa isoladamente?
  strategy: Interpretacao;
  
  // Como está o chão (volatilidade macro) onde essa estrutura está operando?
  volatility: VolatilityLanguage;
  skew: SkewState;
  
  // Mecânica do Preço Justo e Expectativa de Mercado
  expectedMoveBrl: number;
  pop: number; // Probabilidade de Lucro (Probability of Profit) 0-100%
  
  // Estruturalização de Tempo (O calcanhar de aquiles das opções)
  portfolioTheta: number; 
  
  // Ambiente Geral
  riskRegime: RiskRegime;

  // Processo Comportamental (O usuário bateu check nas regras definidas?)
  decisionScore: DecisionScore; 
  
  // O Laudo (Texto de leitura profunda formatado pro UI e pro Copilot)
  synthesis: string; 
};

/**
 * Strategy Intelligence (Orchestrator)
 * O coração da Fase 4. Puxa instâncias isoladas (Interpretador, Gregas, Volatilidade, 
 * Scoring, Probabilidades LogNormais) e unifica tudo na mesma trilha cognitiva sintética.
 */
export function orchestrateStrategy(
  pernas: Perna[], 
  spot: number, 
  daysToMaturity: number, 
  ivAtm: number,          // Volatilidade em %, Ex: 35
  portfolioTheta: number, // Sumário diário R$ de decaimento temporal do cluster de opções
  volLanguage: VolatilityLanguage, 
  skew: SkewState, 
  userScoreInput: Omit<ScoreInput, "interpretacao">,
  assetName: string = "ATIVO"
): IntelligenceContext {
  
  // 1. O que é isso? (Base)
  const inter = interpretar(pernas, spot, assetName);

  // 2. Probabilidade e Previsão Friccional (Pricing Engine Connection)
  const tYears = daysToMaturity / 252;
  const expMove = getExpectedMove(spot, ivAtm, daysToMaturity);
  const pop = calculateProbabilityOfProfit(spot, ivAtm, tYears, inter.breakevens, inter.objetivo);

  // 3. Risk Regime Inference
  let regime: RiskRegime = "tranquilo";
  if (volLanguage.acaoStatus === "vender_vol" || Math.abs(portfolioTheta) > (spot * 0.05)) {
    // Quando a Vol está insana, ou o Theta diário de desgaste da carteira é estupidamente voraz.
    regime = "explosivo";
  }

  // 4. Cruzamento com Regras Históricas Comportamentais (Behavior Cross-Match)
  // Injeta o interpreter autogerado dentro do validador comportamental.
  const scoreRawInput: ScoreInput = {
    ...userScoreInput,
    interpretacao: inter
  };
  const dScore = calcularDecisionScore(scoreRawInput);

  // 5. Motor de Síntese Final (The "Ah-Ha" Moment)
  const parts: string[] = [];
  
  parts.push(`Estrutura mapeada: **${inter.nome}**.`); 
  
  if (inter.objetivo === "lateralizacao") {
    if (volLanguage.acaoStatus === "comprar_vol") {
      parts.push(`🚨 Paradoxo: Você está vendendo risco (aposta em paralisia), mas a volatilidade histórica subjacente está baixíssima no momento. Risco imenso de expansão de Vega esmagar a estrutura.`);
    } else {
      parts.push(`✓ Coerência tática: Apostando em lateralização num pico de volatilidade, colhendo prêmios caros na originação.`);
    }
  }

  if (expMove > 0) {
    parts.push(`O mercado projeta com ~68% de certeza um movimento na ação (para cima ou baixo) de **R$ ${expMove.toFixed(2)}** até o vencimento.`);
  }

  if (pop > 0 && pop < 100 && inter.breakevens.length > 0) {
    parts.push(`De acordo com a fronteira dos breakevens lidos, a **Probabilidade de Lucro (PoP)** matemática na data H é de aproximadamente **${pop.toFixed(0)}%**.`);
  }
  
  if (portfolioTheta > 0) {
    parts.push(`⏳ O tempo corre a seu favor. O carregamento estéril diário (Theta) está gerando caixas de R$ ${portfolioTheta.toFixed(2)}.`);
  } else if (portfolioTheta < 0) {
    parts.push(`⏳ Cuidado com a anestesia temporal: O decaimento da sua estrutura comprada queima R$ ${Math.abs(portfolioTheta).toFixed(2)} de valor por dia parado.`);
  }

  parts.push(dScore.leitura);

  return {
    strategy: inter,
    volatility: volLanguage,
    skew,
    expectedMoveBrl: expMove,
    pop,
    portfolioTheta,
    riskRegime: regime,
    decisionScore: dScore,
    synthesis: parts.join(" ")
  };
}
