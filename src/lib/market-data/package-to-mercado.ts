/**
 * Y.2 — BRIDGE: MarketDataPackage → MercadoObservadoComProvenance
 *
 * Converte um MarketDataPackage Y.2 (com provenance granular) para
 * o formato MercadoObservadoComProvenance que é salvo no DecisionSnapshot.
 *
 * Esta função é usada quando:
 * 1. Registramos uma nova decisão no Diário
 * 2. O Replay precisa exibir provenance por campo
 */

import type { MarketDataPackage } from "./types";
import type { MercadoObservadoComProvenance } from "./mercado-observado-provenance";
import {
  makeObservedFact,
  makeCalculatedFact,
  makeAbsentFact,
} from "./mercado-observado-provenance";

export function packageToMercadoObservado(
  pkg: MarketDataPackage,
): MercadoObservadoComProvenance {
  const asset = pkg.asset;
  const chain = pkg.optionChain;
  const capturedAt = pkg.capturedAt;

  const spot = asset?.value?.price ?? null;
  const spotEnvelope = asset?.quality === "absent"
    ? makeAbsentFact<number | null>("source-unavailable", "yahoo-finance", capturedAt)
    : asset?.quality === "invalid"
      ? makeAbsentFact<number | null>("schema-error", "yahoo-finance", capturedAt)
      : makeObservedFact<number | null>(spot, "yahoo-finance", capturedAt, asset?.quality ?? "valid", asset?.reasons ?? []);

  const ivAtmValue = chain?.value?.contracts[0]?.impliedVolatility ?? null;
  const ivAtmEnvelope: MarketFactEnvelope<number | null> = (() => {
    if (chain?.quality === "absent") {
      return makeAbsentFact<number | null>("not-provided-by-source", "yahoo-finance", capturedAt);
    }
    if (ivAtmValue !== null) {
      const prov = chain?.provenance;
      return {
        value: ivAtmValue,
        provenance: prov ?? { origin: "observed", source: "yahoo-finance", calculatedAt: capturedAt },
        quality: chain?.quality ?? "valid",
        reasons: chain?.reasons ?? [],
      };
    }
    return makeAbsentFact<number | null>("not-provided-by-source", "yahoo-finance", capturedAt);
  })();

  const ivRankValue = asset?.value?.ivRank ?? null;
  const ivRankEnvelope: MarketFactEnvelope<number | null> = (() => {
    if (asset?.value?.ivRank === null && asset?.absenceReason === "not-provided-by-source") {
      return makeAbsentFact<number | null>("not-provided-by-source", "yahoo-finance", capturedAt);
    }
    if (asset?.value?.ivRank === null && asset?.absenceReason === "insufficient-history") {
      return makeAbsentFact<number | null>("insufficient-history", "yahoo-finance", capturedAt);
    }
    return makeObservedFact<number | null>(ivRankValue, "yahoo-finance", capturedAt, asset?.quality ?? "valid", asset?.reasons ?? []);
  })();

  const expectedMoveValue = (() => {
    if (spot !== null && ivAtmValue !== null && chain?.value?.expiration) {
      const dte = Math.max(1, daysUntil(chain.value.expiration));
      const tYears = dte / 252;
      const sigma1Brl = spot * (ivAtmValue / 100) * Math.sqrt(tYears);
      return {
        value: sigma1Brl,
        lowerBound: spot - sigma1Brl,
        upperBound: spot + sigma1Brl,
      };
    }
    return null;
  })();

  const expectedMoveEnvelope: MarketFactEnvelope<
    { value: number | null; lowerBound: number | null; upperBound: number | null } | null
  > = expectedMoveValue
    ? makeCalculatedFact(
        expectedMoveValue,
        "expected-move-1sigma",
        { spot, iv: ivAtmValue, dte: chain?.value?.expiration ?? null },
        capturedAt,
        ivAtmEnvelope.quality === "valid" ? "valid" : "suspicious",
      )
    : makeAbsentFact("not-provided-by-source", "yahoo-finance", capturedAt);

  const skewValue = calculateSkew(chain);
  const skewEnvelope: MarketFactEnvelope<
    { putIv: number | null; callIv: number | null; slope: number | null } | null
  > = skewValue
    ? makeCalculatedFact(skewValue, "volatility-skew", { spot }, capturedAt, chain?.quality ?? "valid")
    : makeAbsentFact("not-provided-by-source", "yahoo-finance", capturedAt);

  return {
    observadoEm: makeObservedFact<string | null>(pkg.observedAt ?? capturedAt, pkg.source, capturedAt, "valid"),
    fonte: makeObservedFact<
      "mock" | "live" | "modelo" | "replay" | "bcb" | "yahoo-finance"
    >(
      pkg.source === "yahoo-finance" ? "yahoo-finance" : pkg.source === "bcb" ? "bcb" : "modelo",
      pkg.source,
      capturedAt,
      pkg.availability === "available" ? "valid" : pkg.availability === "partial" ? "suspicious" : "absent",
    ),
    spot: spotEnvelope,
    ivAtm: ivAtmEnvelope,
    ivRank: ivRankEnvelope,
    expectedMove: expectedMoveEnvelope,
    skew: skewEnvelope,
    liquidityScore: makeObservedFact<"alta" | "media" | "baixa" | null>(
      chain?.value && chain.value.contracts.length >= 8 ? "alta" : chain?.value ? "media" : null,
      "yahoo-finance",
      capturedAt,
      chain?.quality ?? "valid",
    ),
    eventsImminent: makeObservedFact<boolean | null>(
      pkg.corporateEvents?.value && pkg.corporateEvents.value.length > 0 ? true : false,
      "yahoo-finance",
      capturedAt,
      pkg.corporateEvents?.quality ?? "valid",
    ),
  };
}

function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.max(1, Math.round((target - now) / 86400_000));
}

function calculateSkew(
  chain: MarketDataPackage["optionChain"],
): { putIv: number | null; callIv: number | null; slope: number | null } | null {
  if (!chain?.value?.contracts || chain.value.contracts.length === 0) return null;

  const spot = chain.value.contracts[0]?.impliedVolatility;
  if (spot === null) return null;

  const puts = chain.value.contracts
    .filter((c) => c.right === "P")
    .sort((a, b) => a.strike - b.strike);

  const calls = chain.value.contracts
    .filter((c) => c.right === "C")
    .sort((a, b) => a.strike - b.strike);

  const putIv = puts[0]?.impliedVolatility ?? null;
  const callIv = calls[0]?.impliedVolatility ?? null;

  if (putIv === null || callIv === null) return null;

  return {
    putIv,
    callIv,
    slope: putIv - callIv,
  };
}
