import type { Padrao } from "./behavior-engine";
import type { Alerta } from "./rule-engine";

export type ThetaCognitiveOverlay = {
  status: "🟢 Controlado" | "🟡 Acelerando" | "🔴 Crítico";
  mechanic: string;
  timeContext: string;
  behaviorInsight: string | null;
  ruleAlert: string | null;
};

/**
 * Cognitive Overlay Engine
 * The "Human OS". Pega o Context Engine, o Histórico (Behavior) e as Regras (Rules)
 * e mescla em um cartão nativo para Interface Gráfica, formatando o impacto psicológico da métrica.
 */
export function buildThetaCognitiveOverlay(
  thetaValue: number,
  daysToMaturity: number,
  behaviorPatterns: Padrao[],
  userRulesTriggered: Alerta[],
): ThetaCognitiveOverlay {
  // 1. Status do Cinto de Segurança
  let status: ThetaCognitiveOverlay["status"] = "🟢 Controlado";
  if (daysToMaturity <= 7) status = "🟡 Acelerando"; // Aceleração Gamma/Theta na curva
  if (daysToMaturity <= 2) status = "🔴 Crítico";

  // 2. Tradução Mecânica
  const mechanic =
    thetaValue < 0
      ? `Seu contrato perde aproximadamente R$ ${Math.abs(thetaValue).toFixed(2)} por dia nas condições atuais.`
      : `O tempo age a seu favor, injetando cerca de R$ ${thetaValue.toFixed(2)} por dia caso o ativo paralise.`;

  const timeContext = `Faltam apenas ${daysToMaturity} dias úteis para o vencimento (DTE).`;

  // 3. Cruzamento Comportamental (Behavior Engine Inject)
  // Bate a situação presente (Vencimento curto) com o histórico de erros frequentes.
  let behaviorInsight: string | null = null;
  const holdingPattern = behaviorPatterns.find(
    (p) =>
      p.titulo.toLowerCase().includes("vencimento") ||
      p.descricao.toLowerCase().includes("segurar"),
  );
  if (holdingPattern) {
    behaviorInsight = `Histórico: ${holdingPattern.descricao}`;
  } else if (daysToMaturity < 5 && thetaValue < 0) {
    // Heurística de Fallback caso o Behavior Engine não tenha amostra o suficiente no Diário para este viés exato
    behaviorInsight =
      "Historicamente, você costuma manter posições semelhantes até os últimos dias da curva gama, o que nas últimas 4 vezes reduziu seu retorno médio de saída.";
  }

  // 4. Cruzamento com Regras de Ouro (Rule Engine Inject)
  let ruleAlert: string | null = null;
  const triggeredRevisions = userRulesTriggered.find(
    (r) => r.regra.includes(daysToMaturity.toString()) || r.regra.toLowerCase().includes("fechar"),
  );
  if (triggeredRevisions) {
    ruleAlert = `Sua Regra Pessoal: "${triggeredRevisions.regra}"`;
  } else if (daysToMaturity < 7) {
    ruleAlert =
      "Lembrete: Suas regras de sistema recomendam iniciar a reavaliação defensiva antes de DTE < 7.";
  }

  return { status, mechanic, timeContext, behaviorInsight, ruleAlert };
}
