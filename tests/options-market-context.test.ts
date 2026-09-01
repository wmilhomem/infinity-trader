import { describe, test, expect } from "vitest";
import { buildMarketContext } from "../src/lib/market-context-builder";
import { deriveMarketObservations, containsPrescriptiveLanguage } from "../src/lib/market-observations";
import { buildDecisionSnapshot } from "../src/engines/decision-snapshot";
import { lerSnapshotCognitivo } from "../src/engines/decision-memory-reader";
import { lerReplay } from "../src/engines/replay";

describe("RODADA Y — Real Market Data & Options Intelligence", () => {
  test("1. OptionsMarketContext é incorporado deterministicamente no MarketContext", () => {
    const ctx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.50 },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,
        atmStrike: 38.50,
        impliedVolatilityAtm: 32.5,
        skew: {
          putIvOtm: 36.0,
          callIvOtm: 29.5,
          slope: 6.5,
        },
        expectedMove: {
          sigma1Brl: 2.10,
          lowerBound1Sigma: 36.40,
          upperBound1Sigma: 40.60,
        },
        contracts: [
          {
            symbol: "PETRI385",
            strike: 38.50,
            type: "call",
            style: "american",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            last: 1.25,
            bid: 1.20,
            ask: 1.30,
            volume: 15000,
            openInterest: 45000,
            impliedVolatility: 32.5,
            delta: 0.52,
            gamma: 0.12,
            theta: -0.04,
            vega: 0.08,
          },
          {
            symbol: "PETRU385",
            strike: 38.50,
            type: "put",
            style: "european",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            last: 1.15,
            bid: 1.10,
            ask: 1.20,
            volume: 8000,
            openInterest: 22000,
            impliedVolatility: 33.0,
            delta: -0.48,
            gamma: 0.12,
            theta: -0.04,
            vega: 0.08,
          },
        ],
      },
      provenance: { source: "live", provider: "B3 Options Gateway" },
    });

    expect(ctx.optionsChain).toBeDefined();
    expect(ctx.optionsChain?.atmStrike).toBe(38.50);
    expect(ctx.optionsChain?.contracts?.length).toBe(2);
    expect(ctx.optionsChain?.contracts?.[0].delta).toBe(0.52);
  });

  test("2. deriveMarketObservations gera fatos numéricos sobre a cadeia de opções sem prescrição", () => {
    const ctx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.50 },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,
        atmStrike: 38.50,
        impliedVolatilityAtm: 32.5,
        skew: {
          putIvOtm: 36.0,
          callIvOtm: 29.5,
          slope: 6.5,
        },
        expectedMove: {
          sigma1Brl: 2.10,
          lowerBound1Sigma: 36.40,
          upperBound1Sigma: 40.60,
        },
      },
    });

    const obs = deriveMarketObservations(ctx);
    expect(obs.length).toBeGreaterThan(0);

    const ivAtmObs = obs.find((o) => o.id === "options-iv-atm");
    expect(ivAtmObs).toBeDefined();
    expect(ivAtmObs?.fact).toContain("32.5%");

    const skewObs = obs.find((o) => o.id === "options-skew");
    expect(skewObs).toBeDefined();
    expect(skewObs?.fact).toContain("inclinado para Puts");

    const moveObs = obs.find((o) => o.id === "options-expected-move");
    expect(moveObs).toBeDefined();
    expect(moveObs?.fact).toContain("36.40");

    // Trava Anti-Recomendação
    for (const o of obs) {
      expect(containsPrescriptiveLanguage(o.fact)).toBe(false);
    }
  });

  test("3. Preservação de null != 0 e integridade do Snapshot no Replay com dados de Opções", () => {
    const ctxWithNullGreeks = buildMarketContext({
      symbol: "VALE3",
      quote: { last: 60.00 },
      optionsChain: {
        expirationDate: "2026-10-16",
        daysToExpiration: 45,
        atmStrike: 60.00,
        impliedVolatilityAtm: null, // Ausência de observação de IV
        contracts: [
          {
            symbol: "VALEJ600",
            strike: 60.00,
            type: "call",
            expiration: "2026-10-16",
            daysToExpiration: 45,
            last: null, // Sem negócio recente
            bid: null,  // Livro vazio
            ask: null,
            delta: null,
          },
        ],
      },
    });

    expect(ctxWithNullGreeks.optionsChain?.contracts?.[0].bid).toBeNull();
    expect(ctxWithNullGreeks.optionsChain?.contracts?.[0].bid).not.toBe(0);

    const snapshot = buildDecisionSnapshot({
      marketContext: ctxWithNullGreeks,
      processo: {
        simulou: true,
        tese: "Teste de Opções com Nulls",
        checklist: {},
        score: { score: 80, leitura: "OK", itens: [] },
        alertas: [],
        regraAplicada: null,
        seguiuRegra: true,
      },
      comportamento: { disciplinaHistorica: 90, padroesPresentes: [], emocao: "tranquilo" },
      resultado: { status: "aberta", resultado: null },
    });

    const cognitivoView = lerSnapshotCognitivo(snapshot as unknown as Record<string, unknown>);
    expect(cognitivoView?.marketContext?.optionsChain?.contracts?.[0].bid).toBeNull();

    const replayView = lerReplay(
      {
        id: "replay-opt-1",
        ativo: "VALE3",
        estrutura: "Trava de Baixa",
        motivo: "Tese",
        created_at: "2026-09-01T12:00:00Z",
        status: "aberta",
        resultado: null,
      },
      snapshot as unknown as Record<string, unknown>
    );

    expect(replayView?.marketContext?.optionsChain?.contracts?.[0].symbol).toBe("VALEJ600");
  });
});
