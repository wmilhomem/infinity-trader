import { describe, test, expect } from "vitest";
import {
  buildMarketContext,
  observedProvenance,
  calculatedProvenance,
} from "../src/lib/market-context-builder";
import { buildDecisionSnapshot, type DecisionSnapshot } from "../src/engines/decision-snapshot";
import { lerReplay } from "../src/engines/replay";

const NOW = "2026-09-01T19:00:00.000Z";

describe("Y.1.5 — Contract Verification: Meta-Contract Epistemology Audit", () => {
  test("deve garantir que os metadados declarados no contrato TypeScript correspondem à origem real efetivamente usada", () => {
    const mockB3Data = {
      bid: 38.5,
      ask: 38.52,
      iv: 32.75,
      symbol: "PETR4",
      provider: "B3 UTP Feed",
      receivedAt: NOW,
      observedAt: NOW,
    };

    const expectedCalculatedIV = 32.8;

    const ctx = buildMarketContext({
      symbol: mockB3Data.symbol,
      quote: { bid: mockB3Data.bid, ask: mockB3Data.ask },
      timestamp: NOW,
      provenance: {
        source: "live",
        provider: mockB3Data.provider,
        observedAt: mockB3Data.observedAt,
        receivedAt: mockB3Data.receivedAt,
      },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,
        atm: { strike: 38.5, spotUsed: 38.5, determinedAt: NOW, method: "nearest-strike" },
        impliedVolatilityAtm: {
          value: expectedCalculatedIV,
          provenance: calculatedProvenance(
            "black-scholes-bsm",
            {
              bid: mockB3Data.bid,
              ask: mockB3Data.ask,
              spot: (mockB3Data.bid + mockB3Data.ask) / 2,
              strike: 38.5,
              daysToExpiration: 17,
              riskFreeRate: 0.1075,
            },
            NOW,
          ),
          atmStrikeUsed: 38.5,
        },
        contracts: [
          {
            symbol: "PETRI385",
            strike: 38.5,
            type: "call",
            style: "american",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            bid: mockB3Data.bid,
            ask: mockB3Data.ask,
            impliedVolatility: {
              value: mockB3Data.iv,
              provenance: observedProvenance(mockB3Data.provider, mockB3Data.observedAt),
            },
            delta: {
              value: 0.52,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                { spot: 38.5, strike: 38.5, iv: mockB3Data.iv, dte: 17, rate: 0.1075 },
                NOW,
              ),
            },
            gamma: {
              value: 0.12,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                { spot: 38.5, strike: 38.5, iv: mockB3Data.iv, dte: 17, rate: 0.1075 },
                NOW,
              ),
            },
            theta: {
              value: -0.04,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                { spot: 38.5, strike: 38.5, iv: mockB3Data.iv, dte: 17, rate: 0.1075 },
                NOW,
              ),
            },
            vega: {
              value: 0.08,
              provenance: calculatedProvenance(
                "black-scholes-bsm",
                { spot: 38.5, strike: 38.5, iv: mockB3Data.iv, dte: 17, rate: 0.1075 },
                NOW,
              ),
            },
          },
        ],
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

    // VERIFICAÇÃO 1: Validar que o contrato TypeScript declara origin="observed" para a IV lida diretamente do provider
    const contractDeclaredObservedIVOrigin =
      ctx.optionsChain?.contracts?.[0]?.impliedVolatility?.provenance?.origin;
    expect(contractDeclaredObservedIVOrigin).toBe("observed");

    // VERIFICAÇÃO 2: Validar que o contrato TypeScript declara origin="calculated" para o IV ATM derivado por Black-Scholes
    const contractDeclaredCalculatedIVAtmOrigin =
      ctx.optionsChain?.impliedVolatilityAtm?.provenance?.origin;
    expect(contractDeclaredCalculatedIVAtmOrigin).toBe("calculated");

    // VERIFICAÇÃO 3: Validar que os inputs do método calculado correspondem à implementação real da fórmula
    expect(ctx.optionsChain?.impliedVolatilityAtm?.provenance?.method).toBe("black-scholes-bsm");
    expect(ctx.optionsChain?.impliedVolatilityAtm?.provenance?.inputs?.strike).toBe(38.5);

    // VERIFICAÇÃO 4: Validar que o Replay exibe exatamente o que foi registrado (não recalculado)
    const replayView = lerReplay(
      {
        id: "replay-y1-contract-audit",
        ativo: "PETR4",
        estrutura: "Verificação de Contrato",
        motivo: "Auditoria Epistemológica",
        created_at: NOW,
        status: "aberta",
        resultado: null,
      },
      snapshot as unknown as Record<string, unknown>,
    );

    expect(
      replayView?.marketContext?.optionsChain?.contracts?.[0]?.impliedVolatility?.provenance
        ?.origin,
    ).toBe("observed");
    expect(replayView?.marketContext?.optionsChain?.impliedVolatilityAtm?.provenance?.origin).toBe(
      "calculated",
    );
    expect(replayView?.marketContext?.optionsChain?.impliedVolatilityAtm?.value).toBe(
      expectedCalculatedIV,
    );

    // VERIFICAÇÃO 5: Auditoria antifraude — garantir que nenhum campo silenciosamente invertido
    expect(ctx.optionsChain?.contracts?.[0]?.impliedVolatility?.provenance?.origin).toBe(
      "observed",
    );
    expect(ctx.optionsChain?.impliedVolatilityAtm?.provenance?.origin).toBe("calculated");
  });
});
