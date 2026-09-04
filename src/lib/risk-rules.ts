/**
 * Y.3.6 — RISK RULES READER
 *
 * Personal risk rules as declared facts.
 * Shows rules without evaluating whether current context violates them.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Rules are stated facts, NOT "protection" or "safety"
 * - No evaluation of "risk level" or "safety"
 * - User decides how to apply their rules
 */

import type { MarketContext } from "@/lib/market-context";

export type PersonalRiskRule = {
  id: string;
  texto: string;
  tipo: "stop-loss" | "position-size" | "iv-filter" | "dte-filter" | "other";
  active: boolean;
  createdAt: string;
};

let _id = 0;
function genId(): string {
  return `rule-${++_id}-${Date.now()}`;
}

export function createRiskRule(texto: string, tipo: PersonalRiskRule["tipo"]): PersonalRiskRule {
  return {
    id: genId(),
    texto,
    tipo,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export type RiskCheck = {
  ruleId: string;
  ruleTexto: string;
  tipo: PersonalRiskRule["tipo"];
  applicable: boolean;
  status: "ok" | "violated" | "na";
  observation: string | null;
};

export function checkRulesAgainstContext(
  rules: PersonalRiskRule[],
  ctx: MarketContext | null,
): RiskCheck[] {
  if (!ctx) return [];

  const spot = ctx.quote?.last ?? null;
  const atmIV = ctx.optionsChain?.impliedVolatilityAtm?.value ?? null;
  const dte = ctx.optionsChain?.daysToExpiration ?? null;

  return rules
    .filter((r) => r.active)
    .map((rule) => {
      let applicable = false;
      let status: RiskCheck["status"] = "na";
      let observation: string | null = null;

      if (rule.tipo === "iv-filter" && atmIV !== null) {
        applicable = true;
        const match = rule.texto.match(/IV\s*[<>]=?\s*(\d+)/i);
        if (match) {
          const threshold = parseFloat(match[1]) / 100;
          if (rule.texto.includes(">") || rule.texto.includes("maior")) {
            status = atmIV > threshold ? "violated" : "ok";
          } else if (rule.texto.includes("<") || rule.texto.includes("menor")) {
            status = atmIV < threshold ? "violated" : "ok";
          }
          observation = `IV atual: ${(atmIV * 100).toFixed(1)}%`;
        }
      } else if (rule.tipo === "dte-filter" && dte !== null) {
        applicable = true;
        const match = rule.texto.match(/DTE\s*[<>]=?\s*(\d+)/i);
        if (match) {
          const threshold = parseFloat(match[1]);
          if (rule.texto.includes(">") || rule.texto.includes("maior")) {
            status = dte > threshold ? "violated" : "ok";
          } else if (rule.texto.includes("<") || rule.texto.includes("menor")) {
            status = dte < threshold ? "violated" : "ok";
          }
          observation = `DTE atual: ${dte} dias`;
        }
      } else if (rule.tipo === "stop-loss" && spot !== null) {
        applicable = true;
        observation = `Spot: R$ ${spot.toFixed(2)}`;
        status = "ok";
      } else if (rule.tipo === "position-size") {
        applicable = true;
        observation = "Verificação manual necessária";
        status = "ok";
      } else {
        applicable = false;
        observation = null;
        status = "na";
      }

      return {
        ruleId: rule.id,
        ruleTexto: rule.texto,
        tipo: rule.tipo,
        applicable,
        status,
        observation,
      };
    });
}
