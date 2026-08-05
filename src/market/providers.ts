import { blackScholes } from "@/pricing";
import type { IMarketGateway } from "./gateway";
import { MockGateway } from "./gateway";
import { MarketNormalizer } from "./normalizer";

/**
 * PROVEDORES DE MERCADO — Interfaces limpas, implementações trocáveis.
 * A UI nunca sabe de onde veio o dado: Mock (sandbox), Live (B3) ou
 * Replay (histórico). O Confidence Engine audita o que sair daqui.
 */
export type ProviderQuote = {
  provider: "mock" | "live" | "replay" | "modelo";
  ativo: string;
  spot: number;
  spotAgeMs: number;
  ivAtm: number | null;
  ivRank: number | null; // Percentil 0-100 do IV atual no histórico do ativo
  liquidityScore: "alta" | "media" | "baixa";
  optionBook: {
    strike: number;
    tipo: "call" | "put";
    bid: number;
    ask: number;
    depthBid?: number; // undefined = provedor não expõe profundidade
    depthAsk?: number;
  }[];
  eventsImminent: boolean;
  quoteTime: string;
};

export interface MarketDataProvider {
  readonly name: string;
  fetchQuote(ativo: string): Promise<ProviderQuote | null>;
}

const R_ANUAL = 0.1;
const DTE = 45; // Vencimento didático do sandbox
const IV_MOCK = 0.35;

/**
 * MOCK PROVIDER — o mercado simulado do sandbox didático.
 * Gera um book realista (Black-Scholes) com spread alargando e profundidade
 * caindo conforme o contrato sai do dinheiro. Substituído pelo Live no Eixo 3.
 */
export class MockProvider implements MarketDataProvider {
  readonly name = "mock";

  async fetchQuote(ativo: string): Promise<ProviderQuote> {
    const spot = 38.5;
    const tYears = DTE / 252;
    const strikes = [37, 38, 39, 40, 41];

    const optionBook = strikes.flatMap((strike) => {
      const tipos = ["call", "put"] as const;
      return tipos.map((tipo) => {
        const mid = blackScholes(tipo, spot, strike, tYears, R_ANUAL, IV_MOCK);
        const ratio = Math.abs(strike - spot) / spot;
        const spread = 0.015 + ratio * 0.35; // ATM ~1.5%, OTM alarga
        const half = (mid * spread) / 2;
        const depth = Math.max(20, Math.round(400 * (1 - ratio * 6)));
        return {
          strike,
          tipo,
          bid: Math.max(0.01, mid - half),
          ask: mid + half,
          depthBid: depth,
          depthAsk: depth,
        };
      });
    });

    return {
      provider: "mock",
      ativo,
      spot,
      spotAgeMs: 0,
      ivAtm: IV_MOCK * 100,
      ivRank: 62, // Percentil simulado (o sandbox não tem histórico real)
      liquidityScore: "alta",
      optionBook,
      eventsImminent: false,
      quoteTime: new Date().toISOString(),
    };
  }
}

/**
 * LIVE PROVIDER — ponte para o gateway externo (Eixo 3: B3).
 * Normaliza o que o gateway entrega e marca a fonte com honestidade:
 * book real (yahoo) → "live"; chain modelada sobre spot real → "modelo"
 * (o Confidence Engine audita qualquer uma delas).
 */
export class LiveProvider implements MarketDataProvider {
  readonly name = "live";
  private gateway: IMarketGateway;

  constructor(gateway?: IMarketGateway) {
    this.gateway = gateway ?? new MockGateway();
  }

  async fetchQuote(ativo: string): Promise<ProviderQuote | null> {
    try {
      const [assetRaw, chainRaw] = await Promise.all([
        this.gateway.fetchAsset(ativo),
        this.gateway.fetchOptionChain(ativo),
      ]);
      const asset = MarketNormalizer.normalizeAsset(assetRaw);
      const chain = MarketNormalizer.normalizeOptionChain(chainRaw);
      const contracts = chain.contracts.filter((c) => c.greeks?.impliedVolatility);

      const mid = (a: number, b: number) => (a + b) / 2;
      const ivs = contracts.map((c) => c.greeks?.impliedVolatility ?? 0).filter((v) => v > 0);
      const ivAtm = ivs.length ? (ivs.reduce((s, v) => s + v, 0) / ivs.length) * 100 : null;

      return {
        provider: chainRaw?.source === "modelo" ? "modelo" : "live",
        ativo,
        spot: asset.price,
        spotAgeMs: Date.now() - asset.lastUpdate.getTime(),
        ivAtm,
        ivRank: asset.ivRank ?? null,
        liquidityScore: contracts.length >= 8 ? "alta" : "media",
        optionBook: contracts.map((c) => ({
          strike: c.strike,
          tipo: c.type,
          bid: c.bid,
          ask: c.ask,
        })),
        eventsImminent: false,
        quoteTime: chain.lastUpdate.toISOString(),
      };
    } catch {
      return null;
    }
  }
}

/**
 * REPLAY PROVIDER — reconstrói um quote a partir de um snapshot arquivado
 * (Viagem no Tempo Comportamental sobre decision_memory). Eixo 4+.
 */
export class ReplayProvider implements MarketDataProvider {
  readonly name = "replay";
  private snapshot: ProviderQuote | null;

  constructor(snapshot?: ProviderQuote | null) {
    this.snapshot = snapshot ?? null;
  }

  async fetchQuote(_ativo: string): Promise<ProviderQuote | null> {
    return this.snapshot ? { ...this.snapshot, provider: "replay", spotAgeMs: 0 } : null;
  }
}
