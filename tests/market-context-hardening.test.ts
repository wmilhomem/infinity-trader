import { describe, test, expect } from "vitest";
import { buildMarketContext } from "../src/lib/market-context-builder";
import {
  deriveMarketObservations,
  containsPrescriptiveLanguage,
} from "../src/lib/market-observations";
import { buildDecisionSnapshot } from "../src/engines/decision-snapshot";
import { lerSnapshotCognitivo } from "../src/engines/decision-memory-reader";
import { lerReplay } from "../src/engines/replay";
import {
  formatOmniscientContextForPrompt,
  buildOmniscientContext,
} from "../src/engines/omniscient-context";

describe("RODADA X.1 — Audit & Hardening", () => {
  test("X.1.1 — Fluxo Completo: MarketContext atravessa todas as camadas sem perda de dados", () => {
    const marketCtx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.5, open: 38.0, high: 39.0, low: 37.8 },
      indicators: { vwap: 38.2 },
      representation: { type: "candle" },
      volatility: { impliedVolatility: 32.5, ivRank: 45 },
      provenance: { source: "live", provider: "B3 Gateway" },
    });

    // 1. Snapshot
    const snapshot = buildDecisionSnapshot({
      marketContext: marketCtx,
      processo: {
        simulou: true,
        tese: "Tese de alta fundamentada em fluxo",
        checklist: {},
        score: { score: 90, leitura: "Processo excelente", itens: [] },
        alertas: [],
        regraAplicada: null,
        seguiuRegra: true,
      },
      comportamento: {
        disciplinaHistorica: 100,
        padroesPresentes: [],
        emocao: "tranquilo",
      },
      resultado: {
        status: "aberta",
        resultado: null,
      },
    });

    expect(snapshot.marketContext?.instrument.symbol).toBe("PETR4");

    // 2. Leitura Cognitiva (Diário)
    const cognitivoView = lerSnapshotCognitivo(snapshot as unknown as Record<string, unknown>);
    expect(cognitivoView?.marketContext?.quote?.last).toBe(38.5);

    // 3. Replay Engine
    const replayView = lerReplay(
      {
        id: "diary-123",
        ativo: "PETR4",
        estrutura: "Trava de Alta",
        motivo: "Tese de alta",
        created_at: "2026-09-01T12:00:00Z",
        status: "aberta",
        resultado: null,
      },
      snapshot as unknown as Record<string, unknown>,
    );

    expect(replayView?.marketContext?.indicators?.vwap).toBe(38.2);
  });

  test("X.1.2 — Imutabilidade: Alterações em instâncias posteriores de mercado não modificam snapshots antigos", () => {
    const originalMarket = buildMarketContext({
      symbol: "VALE3",
      quote: { last: 60.0 },
    });

    const snapshot = buildDecisionSnapshot({
      marketContext: originalMarket,
      processo: {
        simulou: true,
        tese: "Tese Imutável",
        checklist: {},
        score: { score: 100, leitura: "OK", itens: [] },
        alertas: [],
        regraAplicada: null,
        seguiuRegra: true,
      },
      comportamento: { disciplinaHistorica: 100, padroesPresentes: [], emocao: null },
      resultado: { status: "aberta", resultado: null },
    });

    // Instância posterior de mercado (preço mudou para 65.00)
    const laterMarket = buildMarketContext({
      symbol: "VALE3",
      quote: { last: 65.0 },
    });

    // Congelamento imutável preservado no snapshot
    expect(snapshot.marketContext?.quote?.last).toBe(60.0);
    expect(laterMarket.quote?.last).toBe(65.0);
  });

  test("X.1.3 — Ausência de Dados: O sistema funciona perfeitamente com ausência total (null != 0)", () => {
    const emptyMarket = buildMarketContext({
      symbol: "DESCONHECIDO",
      quote: { last: null, open: null, high: null, low: null, bid: null, ask: null },
      indicators: { vwap: null, movingAverages: [] },
      volatility: { impliedVolatility: null, ivRank: null },
      provenance: { source: "manual", provider: "Sem Provedor" },
    });

    expect(emptyMarket.quote?.last).toBeNull();
    expect(emptyMarket.quote?.last).not.toBe(0);

    const obs = deriveMarketObservations(emptyMarket);
    expect(obs.length).toBe(0); // Nenhum fato derivado quando não há dados

    const snapshot = buildDecisionSnapshot({
      marketContext: emptyMarket,
      processo: {
        simulou: true,
        tese: "Sem dados",
        checklist: {},
        score: { score: 50, leitura: "Sem dados", itens: [] },
        alertas: [],
        regraAplicada: null,
        seguiuRegra: null,
      },
      comportamento: { disciplinaHistorica: 50, padroesPresentes: [], emocao: null },
      resultado: { status: "aberta", resultado: null },
    });

    expect(snapshot.marketContext?.quality.completeness).toBe("empty");
  });

  test("X.1.4 — Copilot Red-Team: System Prompt proíbe recomendações e mantém conduta observacional", () => {
    const marketCtx = buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.5 },
      indicators: { vwap: 36.0 },
    });

    const obs = deriveMarketObservations(marketCtx);
    const vwapObs = obs.find((o) => o.id === "price-above-vwap");

    // Fato derivado é descritivo
    expect(vwapObs?.fact).toContain("Preço observado (R$ 38.50) acima da VWAP (R$ 36.00)");
    expect(containsPrescriptiveLanguage(vwapObs?.fact ?? "")).toBe(false);

    // Contexto do Copilot contém as travas epistêmicas
    const promptText = formatOmniscientContextForPrompt({
      version: 1,
      origem: "simulacao",
      captured_at: new Date().toISOString(),
      estrategia: {
        ativo: "PETR4",
        estrutura: "Trava de Alta",
        precoReferencia: 38.5,
        objetivoLabel: "Alta",
        breakevens: [38],
        lucroMax: 100,
        perdaMax: -50,
        capitalEmRisco: 50,
      },
      gregas: null,
      probabilidade: null,
      processo: {
        score: 85,
        leitura: "Bom",
        alertas: [],
        disciplinaHistorica: 80,
      },
      mercado: {
        fonte: "live",
        observadoEm: new Date().toISOString(),
        spot: 38.5,
        ivAtm: 30,
        ivRank: 50,
        liquidez: "alta",
      },
      portfolio: null,
    });

    expect(promptText).toContain("POLÍTICA DE CONTEXTO DE MERCADO (RODADA X)");
    expect(promptText).toContain("Você NUNCA deve produzir sinais de compra/venda");
    expect(promptText).toContain(
      "Ausência de dados (null) deve ser tratada como ausência de observação",
    );
  });
});
