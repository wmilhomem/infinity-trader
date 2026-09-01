import { describe, test, expect } from "vitest";
import { buildMarketContext } from "../src/lib/market-context-builder";
import { deriveMarketObservations, containsPrescriptiveLanguage } from "../src/lib/market-observations";
import { calculateMarketFreshness } from "../src/lib/market-freshness";
import { getSourceReliability } from "../src/lib/market-source-policy";
import { buildDecisionSnapshot } from "../src/engines/decision-snapshot";
import { lerSnapshotCognitivo } from "../src/engines/decision-memory-reader";
import { lerReplay } from "../src/engines/replay";

describe("RODADA X — Market Context & Intelligence Layer", () => {
  test("1. buildMarketContext é determinístico e preserva null != 0", () => {
    const ctx = buildMarketContext({
      symbol: "PETR4",
      quote: {
        last: 38.5,
        open: 38.0,
        high: 39.0,
        low: 37.8,
        bid: null, // explicitamente null
        ask: null,
      },
      volatility: {
        impliedVolatility: null, // ausência de observação
        ivRank: null,
      },
      provenance: {
        source: "live",
      },
    });

    expect(ctx.version).toBe(1);
    expect(ctx.instrument.symbol).toBe("PETR4");
    expect(ctx.quote?.last).toBe(38.5);
    expect(ctx.quote?.bid).toBeNull();
    expect(ctx.quote?.bid).not.toBe(0); // Regra de ouro: null != 0
    expect(ctx.volatility?.impliedVolatility).toBeNull();
    expect(ctx.quality.sourceReliability).toBe("official");
  });

  test("2. deriveMarketObservations gera fatos numéricos verificáveis e sem prescrição", () => {
    const ctx = buildMarketContext({
      symbol: "VALE3",
      quote: { last: 62.0 },
      indicators: {
        vwap: 60.0,
        movingAverages: [
          { period: 9, type: "SMA", value: 61.5 },
          { period: 21, type: "SMA", value: 59.0 },
        ],
      },
      representation: {
        type: "renko",
        renko: { blockSize: 0.5, sequence: 4, direction: "up" },
      },
    });

    const obs = deriveMarketObservations(ctx);
    expect(obs.length).toBeGreaterThan(0);

    // Verificar se preço > vwap derivou o fato correto
    const vwapFact = obs.find((o) => o.id === "price-above-vwap");
    expect(vwapFact).toBeDefined();
    expect(vwapFact?.fact).toContain("Preço observado (R$ 62.00) acima da VWAP");

    // Teste Anti-Recomendação: nenhuma observação deve conter termos prescritivos
    for (const o of obs) {
      expect(containsPrescriptiveLanguage(o.fact)).toBe(false);
    }
  });

  test("3. calculateMarketFreshness calcula temporalidade corretamente", () => {
    const now = new Date("2026-08-21T12:00:00Z");

    // < 2 minutos atrás = fresh
    const twoMinAgo = new Date("2026-08-21T11:59:00Z").toISOString();
    expect(calculateMarketFreshness(twoMinAgo, now, "live")).toBe("fresh");

    // 10 minutos atrás = delayed
    const tenMinAgo = new Date("2026-08-21T11:50:00Z").toISOString();
    expect(calculateMarketFreshness(tenMinAgo, now, "live")).toBe("delayed");

    // 30 minutos atrás = stale
    const thirtyMinAgo = new Date("2026-08-21T11:30:00Z").toISOString();
    expect(calculateMarketFreshness(thirtyMinAgo, now, "live")).toBe("stale");

    // null = unknown
    expect(calculateMarketFreshness(null, now, "live")).toBe("unknown");
  });

  test("4. getSourceReliability mapeia confiabilidade da fonte", () => {
    expect(getSourceReliability("live")).toBe("official");
    expect(getSourceReliability("provider")).toBe("provider");
    expect(getSourceReliability("manual")).toBe("manual");
    expect(getSourceReliability("mock")).toBe("secondary");
  });

  test("5. DecisionSnapshot integra MarketContext e mantém compatibilidade histórica", () => {
    const mCtx = buildMarketContext({
      symbol: "BOVA11",
      quote: { last: 110.0 },
    });

    const snap = buildDecisionSnapshot({
      marketContext: mCtx,
      processo: {
        simulou: true,
        tese: "Teste de auditoria",
        checklist: { perda: true },
        score: {
          score: 80,
          leitura: "Boa disciplina",
          itens: [],
        },
        alertas: [],
        regraAplicada: null,
        seguiuRegra: true,
      },
      comportamento: {
        disciplinaHistorica: 90,
        padroesPresentes: [],
        emocao: "tranquilo",
      },
      resultado: {
        status: "aberta",
        resultado: null,
      },
    });

    expect(snap.marketContext).toBeDefined();
    expect(snap.marketContext?.instrument.symbol).toBe("BOVA11");

    // Leitura via Decision Memory Reader
    const view = lerSnapshotCognitivo(snap as unknown as Record<string, unknown>);
    expect(view?.marketContext?.instrument.symbol).toBe("BOVA11");

    // Leitura via Replay Engine
    const replay = lerReplay(
      {
        id: "entry-1",
        ativo: "BOVA11",
        estrutura: "Trava de Alta",
        motivo: "Tese",
        created_at: new Date().toISOString(),
        status: "aberta",
        resultado: null,
      },
      snap as unknown as Record<string, unknown>,
    );

    expect(replay?.marketContext).toBeDefined();
    expect(replay?.marketContext?.instrument.symbol).toBe("BOVA11");
  });

  test("6. Imutabilidade do Replay: snapshot sem MarketContext lê null sem inventar passado", () => {
    // Simula decisão pré-Rodada X (sem marketContext)
    const legacySnap = {
      version: 1,
      captured_at: "2026-01-01T10:00:00Z",
      processo: {
        score: 75,
        tese: "Decisão antiga",
      },
    };

    const view = lerSnapshotCognitivo(legacySnap as unknown as Record<string, unknown>);
    expect(view?.marketContext).toBeNull();

    const replay = lerReplay(
      {
        id: "entry-legacy",
        ativo: "PETR4",
        estrutura: "Call",
        motivo: "Antigo",
        created_at: "2026-01-01T10:00:00Z",
        status: "encerrada",
        resultado: 150,
      },
      legacySnap as unknown as Record<string, unknown>,
    );

    expect(replay?.marketContext).toBeNull();
  });
});
