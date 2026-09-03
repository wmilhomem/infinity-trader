/**
 * Y.2.3 — NORMALIZER
 *
 * Converte dados brutos validados (Raw*) para FieldEnvelope<Snapshot>.
 * Preserva null. Preserva 0 legítimo. Preserva diagnostic.
 *
 * REGRAS:
 *  - Yahoo entregou `last` → origin "observed", source "yahoo-finance"
 *  - ivRank ausente → value null, quality "absent", reason "not-provided-by-source"
 *  - bid = 0 entregue → value 0, quality "suspicious" (não null, não estimado)
 *  - ivAtm derivado internamente → origin "calculated", method "black-scholes-bsm"
 *  - 0 legítimo preservado (sem 0 → null corretivo)
 *  - suspicious preservado, não apagado
 */

import type { FieldEnvelope, FieldProvenance, MarketDataPackage } from "./types";
import type { AssetSnapshot, OptionChainSnapshot, DICurveSnapshot, CorporateEventSnapshot } from "./types";
import type { RawAsset, RawOptionChain, RawDICurvePoint, RawCorporateEvent } from "@/market/raw-types";
import {
  assessBidAsk,
  assessExpiration,
  assessIvRank,
  assessMoneyness,
  assessOpenInterest,
  assessVolume,
  combineAssessments,
  schemaErrorAssessment,
  type QualityAssessment,
} from "./validators";

// ─── HELPERS DE PROVENIÊNCIA ──────────────────────────────────────

/**
 * Proveniência padrão para dados observados externamente.
 * `source` é a string de origem (ex: "yahoo-finance").
 * `observedAt` é o ISO timestamp.
 */
export function makeObservedProvenance(
  source: string,
  observedAt: string,
): FieldProvenance {
  return { origin: "observed", source, calculatedAt: observedAt };
}

/**
 * Proveniência para dados derivados internamente.
 * `method` é o nome do algoritmo (ex: "black-scholes-bsm").
 * `inputs` são os parâmetros congelados no momento do cálculo.
 */
export function makeCalculatedProvenance(
  method: string,
  inputs: Record<string, number | string | null>,
  calculatedAt: string,
): FieldProvenance {
  return { origin: "calculated", method, inputs, calculatedAt };
}

// ─── ENVELOPE FACTORY ─────────────────────────────────────────────

function envelopeFrom<T>(
  value: T | null,
  assessment: QualityAssessment,
  provenance: FieldProvenance,
): FieldEnvelope<T> {
  const env: FieldEnvelope<T> = {
    value,
    provenance,
    quality: assessment.quality,
  };
  if (assessment.absenceReason !== undefined) {
    env.absenceReason = assessment.absenceReason;
  }
  if (assessment.reasons.length > 0) {
    env.reasons = [...assessment.reasons];
  }
  return env;
}

// ─── NORMALIZE: ASSET ─────────────────────────────────────────────

/**
 * Normaliza um RawAsset validado para um FieldEnvelope<AssetSnapshot>.
 *
 * Regras:
 *  - price: 0 preservado com quality "suspicious" se não deveria existir
 *  - ivRank null → quality "absent", reason "not-provided-by-source"
 *  - Yahoo entregou last → origin "observed", source "yahoo-finance"
 *  - realizedVol null → quality "absent", reason "not-provided-by-source"
 */
export function normalizeAssetPackage(
  raw: RawAsset | null,
  assessment: QualityAssessment,
  provenance: FieldProvenance,
): FieldEnvelope<AssetSnapshot> | null {
  if (!raw) {
    return envelopeFrom<AssetSnapshot>(null, assessment, provenance);
  }

  // Validação específica de cada campo do asset
  const ivRankAssessment = assessIvRank(null); // Yahoo não entrega closes
  // Para proveniência observada: o que veio do Yahoo é direto
  const value: AssetSnapshot = {
    ticker: raw.ticker,
    symbol: raw.symbol,
    name: raw.name,
    price: raw.price,
    previousClose: null,
    volume: null,
    realizedVol: raw.realizedVol,
    ivRank: raw.ivRank,
    observedAt: provenance.calculatedAt ?? new Date().toISOString(),
  };

  // Se price=0 e assessment global é "valid", marcamos como suspicious
  // (preço 0 é improvável em produção, mas pode acontecer em casos extremos)
  let finalAssessment = assessment;
  if (raw.price === 0 && assessment.quality === "valid") {
    finalAssessment = {
      quality: "suspicious",
      reasons: ["zero-price"],
    };
  }

  // Se ivRank é null, força assessment de ausência específica
  if (raw.ivRank === null) {
    finalAssessment = combineAssessments([finalAssessment, ivRankAssessment]);
  }

  return envelopeFrom<AssetSnapshot>(value, finalAssessment, provenance);
}

// ─── NORMALIZE: OPTION CHAIN ──────────────────────────────────────

/**
 * Normaliza uma RawOptionChain validada para FieldEnvelope<OptionChainSnapshot>.
 *
 * Regras:
 *  - source "yahoo" → provenance origin "observed", source "yahoo-finance"
 *  - source "modelo" → provenance origin "calculated", method "black-scholes-bsm"
 *  - bid=0 entregue → value 0, quality suspicious (não null, não estimado)
 *  - contratos com bid>ask são filtrados (não silenciados)
 */
export function normalizeOptionChainPackage(
  raw: RawOptionChain | null,
  assessment: QualityAssessment,
  spot: number | null,
): FieldEnvelope<OptionChainSnapshot> | null {
  if (!raw) {
    // Se a assessment já classifica (ex: source-unavailable vindo de erro de rede),
    // preserva. Senão default not-provided-by-source.
    const absentAssessment: QualityAssessment =
      assessment.quality === "absent"
        ? assessment
        : {
            quality: "absent",
            absenceReason: "not-provided-by-source",
            reasons: [],
          };
    const provenance: FieldProvenance = {
      origin: "observed",
      source: "yahoo-finance",
      calculatedAt: new Date().toISOString(),
    };
    return envelopeFrom<OptionChainSnapshot>(null, absentAssessment, provenance);
  }

  const observedAt = new Date(raw.timestamp).toISOString();
  const isModelo = raw.source === "modelo";

  const provenance: FieldProvenance = isModelo
    ? {
        origin: "calculated",
        method: "black-scholes-bsm",
        inputs: { spot, model: "yahoo-fallback" },
        source: "model",
        calculatedAt: observedAt,
      }
    : {
        origin: "observed",
        source: "yahoo-finance",
        calculatedAt: observedAt,
      };

  // Validar e filtrar contratos
  const validContracts: OptionChainSnapshot["contracts"] = [];
  const crossReasons: string[] = [];
  const suspiciousReasons: string[] = [];

  for (const c of raw.contracts) {
    // Expiration check
    const expA = assessExpiration(c.expiration);
    if (expA.quality === "invalid") {
      // Contrato expirado: pulamos
      continue;
    }
    // bid/ask
    const baA = assessBidAsk(c.bid, c.ask);
    if (baA.quality === "invalid") {
      crossReasons.push("crossed-book");
      continue;
    }
    if (baA.quality === "suspicious") {
      suspiciousReasons.push(...baA.reasons);
    }
    // moneyness
    const mA = assessMoneyness(c.strikePrice, spot);
    if (mA.quality === "suspicious") {
      suspiciousReasons.push("extreme-moneyness");
    }
    // volume
    const vA = assessVolume(c.volume ?? null);
    if (vA.quality === "invalid") {
      continue;
    }
    // oi
    const oA = assessOpenInterest(c.openInterest ?? null);
    if (oA.quality === "invalid") {
      continue;
    }

    validContracts.push({
      symbol: c.symbol,
      strike: c.strikePrice,
      right: c.right,
      expiration: c.expiration,
      bid: c.bid,
      ask: c.ask,
      last: c.last,
      volume: c.volume ?? null,
      openInterest: c.openInterest ?? null,
      impliedVolatility: c.impliedVolatility ?? null,
    });
  }

  // O quality da chain é o pior entre os contracts individuais
  const finalAssessment: QualityAssessment =
    validContracts.length === 0
      ? {
          quality: "absent",
          absenceReason: "not-provided-by-source",
          reasons: ["no-valid-contracts"],
        }
      : {
          quality: assessment.quality === "valid" && suspiciousReasons.length > 0
            ? "suspicious"
            : assessment.quality,
          reasons: [...assessment.reasons, ...suspiciousReasons, ...crossReasons],
        };

  // Pegar expiração do primeiro contrato (assumindo chain de um único vencimento)
  const expiration = validContracts[0]?.expiration ?? "unknown";

  const value: OptionChainSnapshot = {
    underlying: raw.underlying,
    expiration,
    contracts: validContracts,
    observedAt,
  };

  return envelopeFrom<OptionChainSnapshot>(value, finalAssessment, provenance);
}

// ─── NORMALIZE: DI CURVE ──────────────────────────────────────────

export function normalizeDICurvePackage(
  raw: RawDICurvePoint[] | null,
  assessment: QualityAssessment,
): FieldEnvelope<DICurveSnapshot> | null {
  if (!raw) {
    const absentAssessment: QualityAssessment =
      assessment.quality === "absent"
        ? assessment
        : {
            quality: "absent",
            absenceReason: "not-provided-by-source",
            reasons: [],
          };
    return envelopeFrom<DICurveSnapshot>(
      null,
      absentAssessment,
      makeObservedProvenance("bcb", new Date().toISOString()),
    );
  }
  const value: DICurveSnapshot = {
    baseDate: new Date().toISOString().slice(0, 10),
    points: raw.map((p) => ({ days: p.days, rate: p.rate })),
    source: "bcb",
  };
  return envelopeFrom<DICurveSnapshot>(
    value,
    assessment,
    makeObservedProvenance("bcb", new Date().toISOString()),
  );
}

// ─── NORMALIZE: CORPORATE EVENTS ──────────────────────────────────

export function normalizeCorporateEventsPackage(
  raw: RawCorporateEvent[] | null,
  assessment: QualityAssessment,
): FieldEnvelope<CorporateEventSnapshot[]> | null {
  if (!raw) {
    const absentAssessment: QualityAssessment =
      assessment.quality === "absent"
        ? assessment
        : {
            quality: "absent",
            absenceReason: "not-provided-by-source",
            reasons: [],
          };
    return envelopeFrom<CorporateEventSnapshot[]>(
      null,
      absentAssessment,
      makeObservedProvenance("yahoo-finance", new Date().toISOString()),
    );
  }
  const value: CorporateEventSnapshot[] = raw.map((e) => ({
    ticker: e.ticker,
    type: e.type,
    valueOrRatio: e.value,
    exDate: e.exDate,
    paymentDate: null,
  }));
  return envelopeFrom<CorporateEventSnapshot[]>(
    value,
    assessment,
    makeObservedProvenance("yahoo-finance", new Date().toISOString()),
  );
}

// ─── EXPORT DE TIPOS PARA Y.2.6 ──────────────────────────────────

export type { MarketDataPackage };
