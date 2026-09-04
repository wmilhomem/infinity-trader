/**
 * Y.3.6 — Risk Rules Contract Tests
 *
 * Tests risk rules reader contracts:
 * - PersonalRiskRule creation with all types
 * - checkRulesAgainstContext with IV and DTE filters
 * - Null semantics (null context returns empty checks)
 * - Anti-recommendation: no rule as "protection" or "safety"
 */

import { describe, test, expect } from "vitest";
import { createRiskRule, checkRulesAgainstContext } from "../src/lib/risk-rules";
import { buildMarketContext } from "../src/lib/market-context-builder";

const NOW = "2026-09-01T19:00:00.000Z";

describe("Y.3.6 — Risk Rules", () => {
  describe("Rule creation", () => {
    test("creates stop-loss rule", () => {
      const rule = createRiskRule("Não perco mais de 2% por operação", "stop-loss");
      expect(rule.tipo).toBe("stop-loss");
      expect(rule.texto).toBe("Não perco mais de 2% por operação");
      expect(rule.active).toBe(true);
      expect(rule.id).toBeDefined();
    });

    test("creates iv-filter rule", () => {
      const rule = createRiskRule("IV > 40% é filtro de exclusão", "iv-filter");
      expect(rule.tipo).toBe("iv-filter");
    });

    test("creates dte-filter rule", () => {
      const rule = createRiskRule("DTE < 7 é filtro de exclusão", "dte-filter");
      expect(rule.tipo).toBe("dte-filter");
    });

    test("creates position-size rule", () => {
      const rule = createRiskRule("Máximo 5% do capital por estrutura", "position-size");
      expect(rule.tipo).toBe("position-size");
    });

    test("creates other rule", () => {
      const rule = createRiskRule("Não opero em holidays", "other");
      expect(rule.tipo).toBe("other");
    });
  });

  describe("IV filter checks", () => {
    test("IV > threshold: violated when IV above", () => {
      const rule = createRiskRule("IV > 30% é filtro de exclusão", "iv-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 0.45,
            provenance: { origin: "observed", source: "provider", calculatedAt: NOW },
          },
        },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].status).toBe("violated");
      expect(checks[0].observation).toContain("45.0%");
    });

    test("IV > threshold: ok when IV below", () => {
      const rule = createRiskRule("IV > 30% é filtro de exclusão", "iv-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 0.2,
            provenance: { origin: "observed", source: "provider", calculatedAt: NOW },
          },
        },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].status).toBe("ok");
    });

    test("IV < threshold: violated when IV below", () => {
      const rule = createRiskRule("IV < 20% é mercado morto", "iv-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 0.15,
            provenance: { origin: "observed", source: "provider", calculatedAt: NOW },
          },
        },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].status).toBe("violated");
    });
  });

  describe("DTE filter checks", () => {
    test("DTE > threshold: violated when DTE above", () => {
      const rule = createRiskRule("DTE > 30 é muito longo", "dte-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { daysToExpiration: 45 },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].status).toBe("violated");
      expect(checks[0].observation).toContain("45");
    });

    test("DTE < threshold: ok when DTE above", () => {
      const rule = createRiskRule("DTE < 7 é muito curto", "dte-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { daysToExpiration: 17 },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].status).toBe("ok");
    });
  });

  describe("Null semantics", () => {
    test("null context returns empty checks", () => {
      const rule = createRiskRule("IV > 40%", "iv-filter");
      expect(checkRulesAgainstContext([rule], null)).toEqual([]);
    });

    test("inactive rule not checked", () => {
      const rule = createRiskRule("IV > 40%", "iv-filter");
      rule.active = false;
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 0.5,
            provenance: { origin: "observed", source: "provider", calculatedAt: NOW },
          },
        },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks).toHaveLength(0);
    });

    test("no ATM IV makes iv-filter not applicable", () => {
      const rule = createRiskRule("IV > 40%", "iv-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: { contracts: [] },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      expect(checks[0].applicable).toBe(false);
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("rule text does not contain protection language", () => {
      const protectionKeywords = [
        "proteção",
        "protection",
        "seguro",
        "safe",
        "risco controlado",
        "protegida",
        "garantido",
        "conservador",
        "segurança",
      ];
      const rule = createRiskRule("IV > 40% filtro", "iv-filter");
      for (const kw of protectionKeywords) {
        expect(rule.texto.toLowerCase()).not.toContain(kw);
      }
    });

    test("check observation is factual, not evaluative", () => {
      const rule = createRiskRule("IV > 40% filtro", "iv-filter");
      const ctx = buildMarketContext({
        symbol: "PETR4",
        quote: { last: 38.47 },
        timestamp: NOW,
        provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
        optionsChain: {
          impliedVolatilityAtm: {
            value: 0.5,
            provenance: { origin: "observed", source: "provider", calculatedAt: NOW },
          },
        },
      });
      const checks = checkRulesAgainstContext([rule], ctx);
      const evaluativeKeywords = ["perigoso", "arriscado", "seguro", "bom", "ruim"];
      for (const kw of evaluativeKeywords) {
        expect(checks[0].observation?.toLowerCase() ?? "").not.toContain(kw);
      }
    });
  });
});
