/**
 * Y.2 — MERCADO OBSERVADO COM PROVENANCE
 *
 * Estende o MercadoObservado (Y.1) com provenance granular por campo.
 * Cada campo de mercado carrega sua própria proveniência:
 *   - origin: observed | calculated | estimated
 *   - method: como foi obtido (yahoo-finance-v8, black-scholes-bsm, etc.)
 *   - source: de qual fonte (yahoo-finance, bcb, model)
 *   - observedAt / calculatedAt: timestamp
 *   - quality: valid | suspicious | invalid | absent
 *
 * Isso permite ao Replay responder:
 *   "Naquele momento, o sistema tinha este preço, esta IV, este skew,
 *    este Expected Move e estas informações disponíveis."
 *
 * REGRAS:
 *   - ausência = null (nunca 0)
 *   - 0 legítimo preservado
 *   - suspicious preservado com reason
 */

import type { FieldEnvelope, FieldProvenance, DataQuality, DataAbsenceReason } from "./types";

export type MarketFactProvenance = FieldProvenance;

export interface MarketFactEnvelope<T> {
  value: T | null;
  provenance: MarketFactProvenance;
  quality: DataQuality;
  absenceReason?: DataAbsenceReason;
  reasons?: string[];
}

export interface MercadoObservadoComProvenance {
  /** Instante exato da observação (ISO) */
  observadoEm: MarketFactEnvelope<string | null>;

  /** Proveniência global do dado */
  fonte: MarketFactEnvelope<"mock" | "live" | "modelo" | "replay" | "bcb" | "yahoo-finance">;

  /** Preço spot observado */
  spot: MarketFactEnvelope<number | null>;

  /** IV ATM observada ou calculada */
  ivAtm: MarketFactEnvelope<number | null>;

  /** IV Rank (percentil) */
  ivRank: MarketFactEnvelope<number | null>;

  /** Expected Move (1 sigma) calculado */
  expectedMove: MarketFactEnvelope<{
    value: number | null;
    lowerBound: number | null;
    upperBound: number | null;
  } | null>;

  /** Skew de volatilidade */
  skew: MarketFactEnvelope<{
    putIv: number | null;
    callIv: number | null;
    slope: number | null;
  } | null>;

  /** Score de liquidez */
  liquidityScore: MarketFactEnvelope<"alta" | "media" | "baixa" | null>;

  /** Eventos corporativos iminentes */
  eventsImminent: MarketFactEnvelope<boolean | null>;
}

export function makeObservedFact<T>(
  value: T | null,
  source: string,
  observedAt: string,
  quality: DataQuality = "valid",
  reasons: string[] = [],
): MarketFactEnvelope<T> {
  return {
    value,
    provenance: {
      origin: "observed",
      source,
      calculatedAt: observedAt,
    },
    quality,
    reasons,
  };
}

export function makeCalculatedFact<T>(
  value: T | null,
  method: string,
  inputs: Record<string, number | string | null>,
  calculatedAt: string,
  quality: DataQuality = "valid",
  reasons: string[] = [],
): MarketFactEnvelope<T> {
  return {
    value,
    provenance: {
      origin: "calculated",
      method,
      inputs,
      calculatedAt,
    },
    quality,
    reasons,
  };
}

export function makeAbsentFact<T>(
  reason: DataAbsenceReason,
  source: string,
  calculatedAt: string,
): MarketFactEnvelope<T> {
  return {
    value: null,
    provenance: {
      origin: "observed",
      source,
      calculatedAt,
    },
    quality: "absent",
    absenceReason: reason,
    reasons: [reason ?? "not-provided-by-source"],
  };
}
