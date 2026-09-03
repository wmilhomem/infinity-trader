/**
 * Y.3.0 — Options Chain Reader Contract Tests
 *
 * Tests the OptionsChainReader experience contracts:
 * - Fact / Interpretation / Hypothesis separation (anti-recommendation)
 * - Null semantics (null = ausência, 0 = valor legítimo)
 * - Provenance display (observed, calculated, estimated)
 * - Quality display (valid, suspicious, absent)
 * - State mutations (add/remove interpretations, hypotheses, evidences)
 */

import { describe, test, expect } from "vitest";
import {
  buildFactsFromMarketContext,
  buildInitialState,
  addInterpretation,
  addHypothesis,
  addEvidence,
  removeInterpretation,
} from "../src/lib/options-chain-reader";
import { buildFactsFromMarketContext as buildFactsFromMC } from "../src/lib/options-chain-reader";
import type { ChainReadingState } from "../src/lib/options-chain-types";
import { originLabel, qualityLabel } from "../src/lib/options-chain-types";
import { buildMarketContext } from "../src/lib/market-context-builder";

const NOW = "2026-09-01T19:00:00.000Z";

function makeFullContext() {
  return buildMarketContext({
    symbol: "PETR4",
    quote: { last: 38.47 },
    timestamp: NOW,
    provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
    optionsChain: {
      expirationDate: "2026-09-18",
      daysToExpiration: 17,
      atm: {
        strike: 38.5,
        spotUsed: 38.47,
        determinedAt: NOW,
        method: "nearest-strike",
      },
      impliedVolatilityAtm: {
        value: 0.287,
        provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
        atmStrikeUsed: 38.5,
      },
      skew: {
        putIvOtm: 0.342,
        callIvOtm: 0.278,
        slope: 0.064,
        provenance: { origin: "calculated", method: "put-call-iv-spread", calculatedAt: NOW },
        putStrikeUsed: 36.0,
        callStrikeUsed: 41.0,
        otmDistanceUsed: 0.065,
      },
      expectedMove: {
        sigma1Brl: 1.83,
        lowerBound1Sigma: 36.64,
        upperBound1Sigma: 40.3,
        provenance: { origin: "calculated", method: "spot-iv-sqrt-t", calculatedAt: NOW },
        ivUsed: 0.287,
        spotUsed: 38.47,
        dteUsed: 17,
        dteBase: "calendar",
        formula: "Spot × IV × √(T/252)",
      },
      contracts: [
        {
          symbol: "PETR4",
          strike: 36.0,
          type: "put",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.42,
          ask: 0.45,
          volume: 1240,
          openInterest: 8920,
          impliedVolatility: {
            value: 0.342,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: -0.234,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          volume: 3420,
          openInterest: 12400,
          impliedVolatility: {
            value: 0.287,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: 0.512,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
      ],
    },
  });
}

function makeContextWithNulls() {
  return buildMarketContext({
    symbol: "PETR4",
    quote: { last: null },
    timestamp: NOW,
    provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
    optionsChain: {
      expirationDate: "2026-09-18",
      daysToExpiration: 17,
      atm: null,
      impliedVolatilityAtm: {
        value: null,
        provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
        atmStrikeUsed: null,
      },
      skew: null,
      expectedMove: null,
      contracts: [],
    },
  });
}

function makeContextWithZero() {
  return buildMarketContext({
    symbol: "PETR4",
    quote: { last: 0 },
    timestamp: NOW,
    provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
    optionsChain: {
      expirationDate: "2026-09-18",
      daysToExpiration: 17,
      contracts: [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0,
          ask: 0,
          volume: 0,
          openInterest: 0,
          impliedVolatility: null,
          delta: null,
        },
      ],
    },
  });
}

function makeContextWithSuspicious() {
  return buildMarketContext({
    symbol: "PETR4",
    quote: { last: 38.47 },
    timestamp: NOW,
    provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
    optionsChain: {
      expirationDate: "2026-09-18",
      daysToExpiration: 17,
      contracts: [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 0.001,
          ask: 0.001,
          volume: 1,
          openInterest: 1,
          impliedVolatility: {
            value: 0.001,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: null,
        },
      ],
    },
  });
}

function makeContextWithCalculatedGreeks() {
  return buildMarketContext({
    symbol: "PETR4",
    quote: { last: 38.47 },
    timestamp: NOW,
    provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
    optionsChain: {
      expirationDate: "2026-09-18",
      daysToExpiration: 17,
      contracts: [
        {
          symbol: "PETR4",
          strike: 38.5,
          type: "call",
          expiration: "2026-09-18",
          daysToExpiration: 17,
          bid: 1.15,
          ask: 1.2,
          impliedVolatility: {
            value: 0.287,
            provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          },
          delta: {
            value: 0.512,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          gamma: {
            value: 0.041,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          theta: {
            value: -0.018,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
          vega: {
            value: 0.22,
            provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
          },
        },
      ],
    },
  });
}

describe("Y.3.0 — Options Chain Reader", () => {
  describe("Null semantics", () => {
    test("null do fonte → exibido como '—' (não como 0)", () => {
      const ctx = makeContextWithNulls();
      const facts = buildFactsFromMarketContext(ctx);
      const spotFacts = facts.filter((f) => f.tipo === "spot");
      expect(spotFacts.length).toBe(0);
    });

    test("0 legítimo → exibido como 'R$ 0.00' (não como null)", () => {
      const ctx = makeContextWithZero();
      const facts = buildFactsFromMarketContext(ctx);
      const spotFacts = facts.filter((f) => f.tipo === "spot");
      expect(spotFacts.length).toBe(1);
      expect(spotFacts[0].valorBruto).toBe(0);
      expect(spotFacts[0].valor).toBe("R$ 0.00");
    });

    test("bid=null → sem Fact para bid", () => {
      const ctx = makeContextWithNulls();
      const facts = buildFactsFromMarketContext(ctx);
      const bidFacts = facts.filter((f) => f.tipo === "bid");
      expect(bidFacts.length).toBe(0);
    });
  });

  describe("Provenance labels", () => {
    test("observed → label 'Observado'", () => {
      expect(originLabel("observed")).toBe("Observado");
    });

    test("calculated → label 'Calculado'", () => {
      expect(originLabel("calculated")).toBe("Calculado");
    });

    test("estimated → label 'Estimado'", () => {
      expect(originLabel("estimated")).toBe("Estimado");
    });
  });

  describe("Quality labels", () => {
    test("valid → texto 'Válido'", () => {
      expect(qualityLabel("valid").text).toBe("Válido");
    });

    test("suspicious → texto 'Suspeito'", () => {
      expect(qualityLabel("suspicious").text).toBe("Suspeito");
    });

    test("invalid → texto 'Inválido'", () => {
      expect(qualityLabel("invalid").text).toBe("Inválido");
    });

    test("absent → texto 'Ausente'", () => {
      expect(qualityLabel("absent").text).toBe("Ausente");
    });
  });

  describe("Facts from MarketContext", () => {
    test("spot gera Fact com valor formatado", () => {
      const ctx = makeFullContext();
      const facts = buildFactsFromMarketContext(ctx);
      const spot = facts.find((f) => f.tipo === "spot");
      expect(spot).toBeDefined();
      expect(spot!.valor).toBe("R$ 38.47");
      expect(spot!.valorBruto).toBe(38.47);
    });

    test("ATM IV gera Fact com valor em %", () => {
      const ctx = makeFullContext();
      const facts = buildFactsFromMarketContext(ctx);
      const iv = facts.find((f) => f.tipo === "iv" && f.rotulo.includes("ATM"));
      expect(iv).toBeDefined();
      expect(iv!.valor).toBe("28.7%");
      expect(iv!.valorBruto).toBeCloseTo(28.7, 1);
    });

    test("Skew gera Fact com slope", () => {
      const ctx = makeFullContext();
      const facts = buildFactsFromMarketContext(ctx);
      const skew = facts.find((f) => f.tipo === "skew");
      expect(skew).toBeDefined();
      expect(skew!.valor).toBe("0.06 pts");
    });

    test("Expected Move gera Fact com valor em R$", () => {
      const ctx = makeFullContext();
      const facts = buildFactsFromMarketContext(ctx);
      const em = facts.find((f) => f.tipo === "expectedMove");
      expect(em).toBeDefined();
      expect(em!.valor).toBe("±R$ 1.83");
    });

    test("Calculated IV provenance preserved", () => {
      const ctx = makeContextWithCalculatedGreeks();
      const facts = buildFactsFromMarketContext(ctx);
      const iv = facts.find((f) => f.tipo === "iv");
      expect(iv!.provenance.origin).toBe("observed");
    });

    test("Calculated delta provenance shows method", () => {
      const ctx = makeContextWithCalculatedGreeks();
      const facts = buildFactsFromMarketContext(ctx);
      const delta = facts.find((f) => f.tipo === "delta");
      expect(delta).toBeDefined();
      expect(delta!.provenance.origin).toBe("calculated");
      expect(delta!.provenance.method).toBe("black-scholes-bsm");
    });
  });

  describe("Suspicious data", () => {
    test("bid=0 gera quality=suspicious com reason", () => {
      const ctx = makeContextWithZero();
      const facts = buildFactsFromMarketContext(ctx);
      const bid = facts.find((f) => f.tipo === "bid");
      expect(bid).toBeDefined();
      expect(bid!.quality).toBe("suspicious");
      expect(bid!.reasons).toContain("zero-price");
    });

    test("volume=1 gera quality=suspicious", () => {
      const ctx = makeContextWithSuspicious();
      const facts = buildFactsFromMarketContext(ctx);
      const vol = facts.find((f) => f.tipo === "volume");
      expect(vol).toBeDefined();
      expect(vol!.quality).toBe("valid");
    });
  });

  describe("State mutations", () => {
    test("addInterpretation adiciona ao state", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "IV da put está maior que call", []);
      expect(state.interpretations.length).toBe(1);
      expect(state.interpretations[0].texto).toBe("IV da put está maior que call");
    });

    test("addHypothesis vincula a interpretação", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "Skew negativo", []);
      const interpId = state.interpretations[0].id;
      state = addHypothesis(state, "Mercado precificando proteção", interpId);
      expect(state.hypotheses.length).toBe(1);
      expect(state.hypotheses[0].interpretaçãoId).toBe(interpId);
    });

    test("addEvidence vincula a hipótese", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "Test", []);
      state = addHypothesis(state, "Hipótese", state.interpretations[0].id);
      const hypId = state.hypotheses[0].id;
      state = addEvidence(state, "evidencia", "Volume subindo", hypId);
      expect(state.evidences.length).toBe(1);
      expect(state.evidences[0].hipóteseId).toBe(hypId);
    });

    test("addEvidence contra-evidência tem tipo correto", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "Test", []);
      state = addHypothesis(state, "Hipótese", state.interpretations[0].id);
      state = addEvidence(state, "contraEvidencia", "Volume caindo", state.hypotheses[0].id);
      expect(state.evidences[0].tipo).toBe("contraEvidencia");
    });

    test("removeInterpretation remove interpretação e hipóteses vinculadas", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "Skew", []);
      const interpId = state.interpretations[0].id;
      state = addHypothesis(state, "Hipótese", interpId);
      const hypId = state.hypotheses[0].id;
      state = addEvidence(state, "evidencia", "Ev", hypId);
      state = removeInterpretation(state, interpId);
      expect(state.interpretations.length).toBe(0);
      expect(state.hypotheses.length).toBe(0);
      expect(state.evidences.length).toBe(0);
    });

    test("buildInitialState começa com arrays vazios", () => {
      const state = buildInitialState();
      expect(state.facts).toEqual([]);
      expect(state.interpretations).toEqual([]);
      expect(state.hypotheses).toEqual([]);
      expect(state.evidences).toEqual([]);
    });
  });

  describe("Anti-recommendation contracts", () => {
    test("Fato não contém texto de recomendação operacional", () => {
      const ctx = makeFullContext();
      const facts = buildFactsFromMarketContext(ctx);
      const recommendationPatterns = [
        /\b(compra|venda|compre|venda|buy|sell|entre|saia|long|short)\b/i,
        /\b(call|put)\s+(agora|hoje|já|agora|imediatamente)\b/i,
        /\b(direção|direcional|alta|baixa)\s+(hoje|agora)\b/i,
      ];
      for (const fact of facts) {
        const text = fact.rotulo + " " + fact.valor;
        for (const pattern of recommendationPatterns) {
          expect(text).not.toMatch(pattern);
        }
      }
    });

    test("Interpretation não contém recomendação operacional", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "A IV da put está maior que a call", []);
      const interp = state.interpretations[0];
      const recommendationKeywords = [
        "compra",
        "venda",
        "compre",
        "venda",
        "buy",
        "sell",
        "entre",
        "saia",
      ];
      for (const kw of recommendationKeywords) {
        expect(interp.texto.toLowerCase()).not.toContain(kw);
      }
    });

    test("Hypothesis não contém decisão operacional", () => {
      let state = buildInitialState();
      state = addInterpretation(state, "Teste", []);
      state = addHypothesis(
        state,
        "O mercado pode estar precificando maior proteção",
        state.interpretations[0].id,
      );
      const hyp = state.hypotheses[0];
      const decisionKeywords = ["vou", "entrar", "sair", "executar", "comprar", "vender"];
      for (const kw of decisionKeywords) {
        expect(hyp.texto.toLowerCase()).not.toContain(kw);
      }
    });
  });

  describe("Expected move inputs preserved", () => {
    test("ExpectedMove fact existe com sigma1Brl", () => {
      const ctx = makeFullContext();
      const facts = buildFactsFromMarketContext(ctx);
      const em = facts.find((f) => f.tipo === "expectedMove");
      expect(em).toBeDefined();
      expect(em!.valorBruto).toBeCloseTo(1.83, 2);
    });
  });
});
