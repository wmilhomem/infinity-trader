import { describe, test, expect } from "vitest";
import {
  buildMarketContext,
  observedProvenance,
  calculatedProvenance,
  estimatedProvenance,
} from "../src/lib/market-context-builder";
import {
  deriveMarketObservations,
  containsPrescriptiveLanguage,
} from "../src/lib/market-observations";
import { buildDecisionSnapshot } from "../src/engines/decision-snapshot";
import { lerSnapshotCognitivo } from "../src/engines/decision-memory-reader";
import { lerReplay } from "../src/engines/replay";

const NOW = "2026-09-01T19:00:00.000Z";

describe("RODADA Y.1 — Market Data Integrity & B3 Data Contract", () => {
  test("Y.1.1 — Todo campo derivado deve carregar FieldProvenance explícita", () => {
    const ctx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.5 },
      timestamp: NOW,
      provenance: { source: "live", provider: "B3 UTP Feed", observedAt: NOW },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,

        // ATM com metodologia explícita
        atm: {
          strike: 38.5,
          spotUsed: 38.5,
          determinedAt: NOW,
          method: "nearest-strike",
        },

        // IV ATM: campo calculado — Black-Scholes a partir do contrato ATM
        impliedVolatilityAtm: {
          value: 32.5,
          provenance: calculatedProvenance(
            "black-scholes-bsm",
            {
              bid: 1.2,
              ask: 1.3,
              spot: 38.5,
              strike: 38.5,
              daysToExpiration: 17,
              riskFreeRate: 0.1075,
            },
            NOW,
          ),
          atmStrikeUsed: 38.5,
        },

        // Skew: calculado com strikes e distância declarados
        skew: {
          putIvOtm: 36.0,
          callIvOtm: 29.5,
          slope: 6.5,
          provenance: calculatedProvenance(
            "put-call-iv-spread",
            {
              putStrike: 36.0,
              callStrike: 41.0,
              otmDistance: 0.065,
            },
            NOW,
          ),
          putStrikeUsed: 36.0,
          callStrikeUsed: 41.0,
          otmDistanceUsed: 0.065,
        },

        // Expected Move: fórmula, IV, spot, DTE e base temporal declarados
        expectedMove: {
          sigma1Brl: 2.1,
          lowerBound1Sigma: 36.4,
          upperBound1Sigma: 40.6,
          provenance: calculatedProvenance(
            "spot-iv-sqrt-t",
            {
              spot: 38.5,
              iv: 0.325,
              dte: 17,
              dteBase: "calendar",
              divisor: 252,
            },
            NOW,
          ),
          ivUsed: 0.325,
          spotUsed: 38.5,
          dteUsed: 17,
          dteBase: "calendar",
          formula: "spot-iv-sqrt-t",
        },

        // Contratos com Greeks calculados e IV observada
        contracts: [
          {
            symbol: "PETRI385",
            strike: 38.5,
            type: "call",
            style: "american",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            last: 1.25,
            bid: 1.2,
            ask: 1.3,
            volume: 15000,
            openInterest: 45000,
            // IV: observada diretamente do provider (não calculada)
            impliedVolatility: {
              value: 32.5,
              provenance: observedProvenance("B3 UTP Feed", NOW),
            },
            // Greeks: calculados pelo modelo Black-Scholes
            delta: {
              value: 0.52,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                {
                  spot: 38.5,
                  strike: 38.5,
                  iv: 0.325,
                  dte: 17,
                  rate: 0.1075,
                },
                NOW,
              ),
            },
            gamma: {
              value: 0.12,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                {
                  spot: 38.5,
                  strike: 38.5,
                  iv: 0.325,
                  dte: 17,
                  rate: 0.1075,
                },
                NOW,
              ),
            },
            theta: {
              value: -0.04,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                {
                  spot: 38.5,
                  strike: 38.5,
                  iv: 0.325,
                  dte: 17,
                  rate: 0.1075,
                },
                NOW,
              ),
            },
            vega: {
              value: 0.08,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                {
                  spot: 38.5,
                  strike: 38.5,
                  iv: 0.325,
                  dte: 17,
                  rate: 0.1075,
                },
                NOW,
              ),
            },
          },
        ],
      },
    });

    // ATM tem metodologia explícita
    expect(ctx.optionsChain?.atm?.method).toBe("nearest-strike");
    expect(ctx.optionsChain?.atm?.spotUsed).toBe(38.5);

    // IV ATM tem proveniência calculada com inputs rastreáveis
    expect(ctx.optionsChain?.impliedVolatilityAtm?.provenance?.origin).toBe("calculated");
    expect(ctx.optionsChain?.impliedVolatilityAtm?.provenance?.method).toBe("black-scholes-bsm");
    expect(ctx.optionsChain?.impliedVolatilityAtm?.provenance?.inputs?.strike).toBe(38.5);

    // Skew tem strikes e distância OTM declarados
    expect(ctx.optionsChain?.skew?.putStrikeUsed).toBe(36.0);
    expect(ctx.optionsChain?.skew?.callStrikeUsed).toBe(41.0);
    expect(ctx.optionsChain?.skew?.provenance?.origin).toBe("calculated");

    // Expected Move tem fórmula, IV, spot, DTE e base temporal
    expect(ctx.optionsChain?.expectedMove?.formula).toBe("spot-iv-sqrt-t");
    expect(ctx.optionsChain?.expectedMove?.ivUsed).toBe(0.325);
    expect(ctx.optionsChain?.expectedMove?.dteBase).toBe("calendar");

    // Greeks têm proveniência por campo
    const call = ctx.optionsChain?.contracts?.[0];
    expect(call?.delta?.provenance?.origin).toBe("calculated");
    expect(call?.delta?.value).toBe(0.52);
    expect(call?.impliedVolatility?.provenance?.origin).toBe("observed");
  });

  test("Y.1.2 — observed vs calculated vs estimated são tipos distintos e explícitos", () => {
    const obsP = observedProvenance("B3 Feed", NOW);
    expect(obsP.origin).toBe("observed");
    expect(obsP.source).toBe("B3 Feed");
    expect(obsP.method).toBeUndefined();

    const calcP = calculatedProvenance("black-scholes-bsm", { spot: 38.5 }, NOW);
    expect(calcP.origin).toBe("calculated");
    expect(calcP.method).toBe("black-scholes-bsm");

    const estP = estimatedProvenance("linear-interpolation", { lower: 32, upper: 34 }, NOW);
    expect(estP.origin).toBe("estimated");
    expect(estP.method).toBe("linear-interpolation");
  });

  test("Y.1.3 — Campos ausentes (bid/ask null) preservam null, não são fabricados", () => {
    const ctx = buildMarketContext({
      symbol: "VALE3",
      quote: { last: 60.0 },
      optionsChain: {
        expirationDate: "2026-10-16",
        daysToExpiration: 45,
        atm: { strike: 60.0, spotUsed: 60.0, determinedAt: NOW, method: "nearest-strike" },
        // IV ATM não observada — campo ausente, não estimado silenciosamente
        impliedVolatilityAtm: null,
        contracts: [
          {
            symbol: "VALEJ600",
            strike: 60.0,
            type: "call",
            expiration: "2026-10-16",
            daysToExpiration: 45,
            last: null, // sem negócio recente
            bid: null, // livro vazio
            ask: null, // livro vazio
            // Greeks não calculados pois não há IV observada
            delta: null,
            gamma: null,
            theta: null,
            vega: null,
          },
        ],
      },
    });

    expect(ctx.optionsChain?.contracts?.[0].bid).toBeNull();
    expect(ctx.optionsChain?.contracts?.[0].bid).not.toBe(0);
    expect(ctx.optionsChain?.impliedVolatilityAtm).toBeNull();
    expect(ctx.optionsChain?.contracts?.[0].delta).toBeNull();
  });

  test("Y.1.4 — Snapshot congela a proveniência: o Replay exibe exactly o que foi registrado", () => {
    const ctx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.5 },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,
        atm: { strike: 38.5, spotUsed: 38.5, determinedAt: NOW, method: "nearest-strike" },
        impliedVolatilityAtm: {
          value: 32.5,
          provenance: calculatedProvenance("black-scholes-bsm", { spot: 38.5, strike: 38.5 }, NOW),
          atmStrikeUsed: 38.5,
        },
        expectedMove: {
          sigma1Brl: 2.1,
          lowerBound1Sigma: 36.4,
          upperBound1Sigma: 40.6,
          provenance: calculatedProvenance(
            "spot-iv-sqrt-t",
            { spot: 38.5, iv: 0.325, dte: 17 },
            NOW,
          ),
          formula: "spot-iv-sqrt-t",
          ivUsed: 0.325,
          spotUsed: 38.5,
          dteUsed: 17,
          dteBase: "calendar",
        },
      },
    });

    const snapshot = buildDecisionSnapshot({
      marketContext: ctx,
      processo: {
        simulou: true,
        tese: "Tese Y.1 Integridade",
        checklist: {},
        score: { score: 90, leitura: "OK", itens: [] },
        alertas: [],
        regraAplicada: null,
        seguiuRegra: true,
      },
      comportamento: { disciplinaHistorica: 95, padroesPresentes: [], emocao: "tranquilo" },
      resultado: { status: "aberta", resultado: null },
    });

    // Replay deve exibir exatamente: IV = 32.5%, fórmula = spot-iv-sqrt-t, iv usada = 0.325
    const replayView = lerReplay(
      {
        id: "replay-y1-1",
        ativo: "PETR4",
        estrutura: "Trava de Alta",
        motivo: "Tese Y.1",
        created_at: NOW,
        status: "aberta",
        resultado: null,
      },
      snapshot as unknown as Record<string, unknown>,
    );

    expect(replayView?.marketContext?.optionsChain?.impliedVolatilityAtm?.value).toBe(32.5);
    expect(replayView?.marketContext?.optionsChain?.impliedVolatilityAtm?.provenance?.method).toBe(
      "black-scholes-bsm",
    );
    expect(replayView?.marketContext?.optionsChain?.expectedMove?.formula).toBe("spot-iv-sqrt-t");
    expect(replayView?.marketContext?.optionsChain?.expectedMove?.ivUsed).toBe(0.325);
  });

  test("Y.1.5 — deriveMarketObservations cita a metodologia do Expected Move no fato gerado", () => {
    const ctx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.5 },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,
        atm: { strike: 38.5, spotUsed: 38.5, determinedAt: NOW, method: "nearest-strike" },
        impliedVolatilityAtm: {
          value: 32.5,
          provenance: calculatedProvenance("black-scholes-bsm", { spot: 38.5 }, NOW),
        },
        expectedMove: {
          sigma1Brl: 2.1,
          lowerBound1Sigma: 36.4,
          upperBound1Sigma: 40.6,
          provenance: calculatedProvenance(
            "spot-iv-sqrt-t",
            { spot: 38.5, iv: 0.325, dte: 17 },
            NOW,
          ),
          formula: "spot-iv-sqrt-t",
          ivUsed: 0.325,
          spotUsed: 38.5,
          dteUsed: 17,
          dteBase: "calendar",
        },
        skew: {
          putIvOtm: 36.0,
          callIvOtm: 29.5,
          slope: 6.5,
          provenance: calculatedProvenance(
            "put-call-iv-spread",
            { putStrike: 36.0, callStrike: 41.0 },
            NOW,
          ),
          putStrikeUsed: 36.0,
          callStrikeUsed: 41.0,
        },
      },
    });

    const obs = deriveMarketObservations(ctx);

    const ivFact = obs.find((o) => o.id === "options-iv-atm");
    expect(ivFact?.fact).toContain("32.5%");

    const moveFact = obs.find((o) => o.id === "options-expected-move");
    expect(moveFact?.fact).toContain("36.40");
    expect(moveFact?.fact).toContain("40.60");

    const skewFact = obs.find((o) => o.id === "options-skew");
    expect(skewFact?.fact).toContain("inclinado para Puts");

    // Anti-Recomendação
    for (const o of obs) {
      expect(containsPrescriptiveLanguage(o.fact)).toBe(false);
    }
  });
});
