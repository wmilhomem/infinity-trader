import type { IMarketGateway } from "./gateway";
import type { RawAsset, RawCorporateEvent, RawDICurvePoint, RawOptionChain } from "./raw-types";

type MercadoPayload = {
  asset: RawAsset;
  chain: RawOptionChain;
  diCurve: RawDICurvePoint[] | null;
  events: RawCorporateEvent[] | null;
  quoteTime: string;
};

/**
 * HTTP GATEWAY — o cliente que consome a rota /api/market do nosso próprio
 * backend. O servidor conversa com as fontes reais (Yahoo/B3/BCB) e entrega
 * o payload cru; este gateway só roteia para os métodos do contrato.
 * Cache curto por ticker para não martelar a API a cada render.
 */
export class HttpGateway implements IMarketGateway {
  private cache = new Map<string, { at: number; payload: MercadoPayload }>();
  private readonly ttlMs = 45_000;
  private lastAtivo = "PETR4";

  private async mercado(ativo: string): Promise<MercadoPayload> {
    const hit = this.cache.get(ativo);
    if (hit && Date.now() - hit.at < this.ttlMs) return hit.payload;

    const res = await fetch(`/api/market?ativo=${encodeURIComponent(ativo)}`);
    if (!res.ok) throw new Error(`Mercado indisponível (${res.status})`);
    const payload = (await res.json()) as MercadoPayload;
    this.cache.set(ativo, { at: Date.now(), payload });
    this.lastAtivo = ativo;
    return payload;
  }

  async fetchAsset(ticker: string) {
    return (await this.mercado(ticker)).asset;
  }

  async fetchOptionChain(underlying: string) {
    return (await this.mercado(underlying)).chain;
  }

  async fetchDICurve() {
    return (await this.mercado(this.lastAtivo)).diCurve;
  }

  async fetchCorporateEvents(ticker?: string) {
    return (await this.mercado(ticker ?? this.lastAtivo)).events;
  }
}
