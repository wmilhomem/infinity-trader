/**
 * Y.2 — LIVE MARKET DATA PROVIDER
 *
 * Provider de mercado real que usa o YahooSourceAdapter completo do Y.2.
 * Diferente do LiveProvider legado (que retorna ProviderQuote), este retorna
 * MarketDataPackage com provenance completa por campo.
 *
 * USO:
 * - Quando precisamos de provenance granular (Replay, Decision Snapshot)
 * - Quando queremos exibir "ATM IV: 28,7% — Observado — Yahoo Finance — 14:32"
 *
 * BOUNDARY B3: quando B3SourceAdapter existir, substituir YahooSourceAdapter
 * por ele sem alterar a interface MarketDataPackage.
 */

import type { MarketDataPackage, MarketDataProvider } from "./types";
import { YahooSourceAdapter } from "./yahoo-source-adapter";
import { HttpGateway } from "@/market/http-gateway";

let _instance: MarketDataPackageProvider | null = null;

export class MarketDataPackageProvider implements MarketDataProvider {
  private adapter: MarketDataProvider;

  constructor(gateway?: { fetchAsset: (t: string) => Promise<unknown>; fetchOptionChain: (u: string) => Promise<unknown>; fetchDICurve: () => Promise<unknown>; fetchCorporateEvents: (t?: string) => Promise<unknown> }) {
    this.adapter = new YahooSourceAdapter(
      gateway ?? new HttpGateway(),
    );
  }

  static getInstance(): MarketDataPackageProvider {
    if (!_instance) {
      _instance = new MarketDataPackageProvider();
    }
    return _instance;
  }

  async fetchPackage(ticker: string): Promise<MarketDataPackage> {
    return this.adapter.fetchPackage(ticker);
  }
}

export const liveMarketData = MarketDataPackageProvider.getInstance();
