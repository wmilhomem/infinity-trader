import { Asset, OptionChain, YieldCurve, CorporateEvent } from "./types";
import { MarketNormalizer } from "./normalizer";
import { IMarketGateway } from "./gateway";

/**
 * Cache Layer
 * Evita pancadas na API da B3 (Rate limits) ou gateways.
 * Apenas devolve o cache em memória (TTL ajustável) ou solicita refresh via Gateway -> Normalizer.
 */
export class MarketCache {
  private assets = new Map<string, { data: Asset; expiresAt: number }>();
  private chains = new Map<string, { data: OptionChain; expiresAt: number }>();
  private diCurve: { data: YieldCurve; expiresAt: number } | null = null;
  private corporateEvents = new Map<string, { data: CorporateEvent[]; expiresAt: number }>();

  constructor(
    private gateway: IMarketGateway,
    private ttlMs = 15000,
  ) {} // default 15s cache

  async getAsset(ticker: string): Promise<Asset> {
    const cached = this.assets.get(ticker);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const raw = await this.gateway.fetchAsset(ticker);
    const normalized = MarketNormalizer.normalizeAsset(raw);
    this.assets.set(ticker, { data: normalized, expiresAt: Date.now() + this.ttlMs });
    return normalized;
  }

  async getOptionChain(underlying: string): Promise<OptionChain> {
    const cached = this.chains.get(underlying);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const raw = await this.gateway.fetchOptionChain(underlying);
    const normalized = MarketNormalizer.normalizeOptionChain(raw);
    this.chains.set(underlying, { data: normalized, expiresAt: Date.now() + this.ttlMs });
    return normalized;
  }

  async getDICurve(): Promise<YieldCurve> {
    if (this.diCurve && Date.now() < this.diCurve.expiresAt) return this.diCurve.data;

    const raw = await this.gateway.fetchDICurve();
    const normalized = MarketNormalizer.normalizeDICurve(raw);
    // DI Curve changes less frequently (usually EOD), cache could be longer, but we keep the generic TTL for now.
    this.diCurve = { data: normalized, expiresAt: Date.now() + this.ttlMs };
    return normalized;
  }

  async getCorporateEvents(ticker: string): Promise<CorporateEvent[]> {
    const cached = this.corporateEvents.get(ticker);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const raw = await this.gateway.fetchCorporateEvents(ticker);
    const normalized = MarketNormalizer.normalizeCorporateEvents(raw);
    this.corporateEvents.set(ticker, { data: normalized, expiresAt: Date.now() + this.ttlMs });
    return normalized;
  }
}
