/**
 * Y.2.4 — YAHOO SOURCE ADAPTER
 *
 * BOUNDARY B3 — preparado para futura substituição por adapter nativo B3.
 * Hoje a fonte real é Yahoo Finance. Quando a B3 real existir, criar
 * B3SourceAdapter implements MarketDataProvider sem alterar camadas acima.
 *
 * DIFERENCIAÇÃO DE FALHAS:
 *  - Yahoo 200 OK com dados            → availability "available" ou "partial"
 *  - Yahoo 5xx / timeout               → availability "unavailable" + source-unavailable
 *  - Yahoo 200 OK mas parse falhou     → availability "partial" + schema-error
 *  - Yahoo 200 OK mas book indisponível → cai no modelo → source "model"
 *
 * IMPORTANTE: Yahoo não entrega ivRank — sempre absent com
 * absenceReason "not-provided-by-source". Isso é correto e não é falha.
 */

import { aggregateAvailability, type MarketDataPackage, type MarketDataProvider } from "./types";
import { parseAsset, parseOptionChain, parseDICurve, parseCorporateEvents } from "./schemas";
import {
  normalizeAssetPackage,
  normalizeOptionChainPackage,
  normalizeDICurvePackage,
  normalizeCorporateEventsPackage,
  makeObservedProvenance,
} from "./normalizer";
import { schemaErrorAssessment } from "./validators";
import type { IMarketGateway } from "@/market/gateway";

/**
 * Adapter que consome um IMarketGateway (HTTP/Yahoo) e produz
 * um MarketDataPackage normalizado com proveniência e diagnóstico.
 */
export class YahooSourceAdapter implements MarketDataProvider {
  constructor(private gateway: IMarketGateway) {}

  async fetchPackage(ticker: string): Promise<MarketDataPackage> {
    const capturedAt = new Date().toISOString();
    const observedAt: string | null = null;

    // Tenta buscar todos os recursos. Em falha de rede, o pacote
    // resultante é "unavailable" com source-unavailable em cada envelope.
    let assetEnvelope: MarketDataPackage["asset"] = null;
    let chainEnvelope: MarketDataPackage["optionChain"] = null;
    let diEnvelope: MarketDataPackage["diCurve"] = null;
    let eventsEnvelope: MarketDataPackage["corporateEvents"] = null;

    // ASSET
    try {
      const raw = await this.gateway.fetchAsset(ticker);
      const parsed = parseAsset(raw);
      if (parsed.ok) {
        const prov = makeObservedProvenance(
          "yahoo-finance",
          new Date(parsed.data.lastUpdate).toISOString(),
        );
        assetEnvelope = normalizeAssetPackage(
          parsed.data,
          { quality: "valid", reasons: [] },
          prov,
        );
      } else {
        const assessment = schemaErrorAssessment(
          parsed.errors.map((e) => `${e.path}: ${e.message}`),
        );
        assetEnvelope = normalizeAssetPackage(
          null,
          assessment,
          makeObservedProvenance("yahoo-finance", capturedAt),
        );
      }
    } catch {
      assetEnvelope = normalizeAssetPackage(
        null,
        {
          quality: "absent",
          absenceReason: "source-unavailable",
          reasons: ["network-error"],
        },
        makeObservedProvenance("yahoo-finance", capturedAt),
      );
    }

    // OPTION CHAIN
    const spotForChain: number | null = assetEnvelope?.value?.price ?? null;
    try {
      const raw = await this.gateway.fetchOptionChain(ticker);
      const parsed = parseOptionChain(raw);
      if (parsed.ok) {
        chainEnvelope = normalizeOptionChainPackage(
          parsed.data,
          { quality: "valid", reasons: [] },
          spotForChain,
        );
      } else {
        chainEnvelope = normalizeOptionChainPackage(
          null,
          schemaErrorAssessment(parsed.errors.map((e) => `${e.path}: ${e.message}`)),
          spotForChain,
        );
      }
    } catch {
      chainEnvelope = normalizeOptionChainPackage(
        null,
        {
          quality: "absent",
          absenceReason: "source-unavailable",
          reasons: ["network-error"],
        },
        spotForChain,
      );
    }

    // DI CURVE
    try {
      const raw = await this.gateway.fetchDICurve();
      const parsed = parseDICurve(raw);
      if (parsed.ok) {
        diEnvelope = normalizeDICurvePackage(
          parsed.data,
          { quality: "valid", reasons: [] },
        );
      } else {
        diEnvelope = normalizeDICurvePackage(
          null,
          schemaErrorAssessment(parsed.errors.map((e) => `${e.path}: ${e.message}`)),
        );
      }
    } catch {
      diEnvelope = normalizeDICurvePackage(
        null,
        {
          quality: "absent",
          absenceReason: "source-unavailable",
          reasons: ["network-error"],
        },
      );
    }

    // CORPORATE EVENTS
    try {
      const raw = await this.gateway.fetchCorporateEvents(ticker);
      const parsed = parseCorporateEvents(raw);
      eventsEnvelope = normalizeCorporateEventsPackage(
        parsed.ok ? parsed.data : null,
        parsed.ok
          ? { quality: "valid", reasons: [] }
          : schemaErrorAssessment(parsed.errors.map((e) => `${e.path}: ${e.message}`)),
      );
    } catch {
      eventsEnvelope = normalizeCorporateEventsPackage(
        null,
        {
          quality: "absent",
          absenceReason: "source-unavailable",
          reasons: ["network-error"],
        },
      );
    }

    const availability = aggregateAvailability([
      assetEnvelope,
      chainEnvelope,
      diEnvelope,
      eventsEnvelope,
    ]);

    return {
      schemaVersion: 1,
      source: "yahoo-finance",
      provider: "yahoo-finance-v8",
      capturedAt,
      observedAt,
      availability,
      asset: assetEnvelope,
      optionChain: chainEnvelope,
      diCurve: diEnvelope,
      corporateEvents: eventsEnvelope,
    };
  }
}
