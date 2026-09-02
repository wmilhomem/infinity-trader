/**
 * Y.2.2 — VALIDADORES DE QUALIDADE
 *
 * Avaliam a integridade de um valor e classificam sua qualidade,
 * sem corrigir nem estimar. suspicious NÃO é apagado — entra com
 * value preservado + diagnóstico.
 *
 * REGRAS:
 *  - bid > ask          → invalid   (crossed-book)
 *  - bid === ask        → valid     (locked-book)
 *  - spread/mid > 50%   → suspicious (spread > 50%)
 *  - |strike-spot|/spot > 40% → suspicious (extreme-moneyness)
 *  - expiration < now   → invalid   (expired)
 *  - volume < 0 ou oi < 0 → invalid (negative-volume)
 *  - ivRank com closes < 60 → absent (insufficient-history)
 *  - ivRank com closes ≥ 60 → valid
 *  - Yahoo não entrega ivRank → absent (not-provided-by-source)
 */

import type { DataAbsenceReason, DataQuality } from "./types";

// ─── TIPO DE ASSESSMENT ───────────────────────────────────────────

export interface QualityAssessment {
  quality: DataQuality;
  absenceReason?: DataAbsenceReason;
  reasons: string[];
}

// ─── HELPERS ──────────────────────────────────────────────────────

function mk(
  quality: DataQuality,
  reasons: string[] = [],
  absenceReason?: DataAbsenceReason,
): QualityAssessment {
  return { quality, reasons, absenceReason };
}

// ─── BID/ASK ──────────────────────────────────────────────────────

/**
 * Avalia par bid/ask:
 *  - bid > ask       → invalid, crossed-book
 *  - bid === ask     → valid (locked-book)
 *  - spread > 50%    → suspicious
 *  - normal          → valid
 */
export function assessBidAsk(
  bid: number | null,
  ask: number | null,
): QualityAssessment {
  if (bid === null || ask === null) {
    return mk("absent", ["bid-or-ask-missing"], "not-provided-by-source");
  }
  if (bid > ask) {
    return mk("invalid", ["crossed-book"]);
  }
  if (bid === ask) {
    return mk("valid");
  }
  // spread/mid
  const mid = (bid + ask) / 2;
  if (mid <= 0) {
    return mk("suspicious", ["non-positive-mid"]);
  }
  const spreadPct = (ask - bid) / mid;
  if (spreadPct > 0.5) {
    return mk("suspicious", ["spread > 50%"]);
  }
  return mk("valid");
}

// ─── EXTREME MONEYNESS ────────────────────────────────────────────

/**
 * Avalia moneyness de um contrato: |strike - spot| / spot.
 *  - > 40% → suspicious (extreme-moneyness)
 *  - ≤ 40% → valid
 */
export function assessMoneyness(
  strike: number | null,
  spot: number | null,
): QualityAssessment {
  if (strike === null || spot === null || spot <= 0) {
    return mk("absent", ["strike-or-spot-missing"], "not-provided-by-source");
  }
  const ratio = Math.abs(strike - spot) / spot;
  if (ratio > 0.4) {
    return mk("suspicious", ["extreme-moneyness"]);
  }
  return mk("valid");
}

// ─── EXPIRATION ───────────────────────────────────────────────────

/**
 * Avalia se a data de vencimento é válida.
 *  - expiration < now → invalid (expired)
 *  - expiration ≥ now → valid
 */
export function assessExpiration(expiration: string | null): QualityAssessment {
  if (expiration === null) {
    return mk("absent", ["expiration-missing"], "not-provided-by-source");
  }
  const d = new Date(expiration);
  if (isNaN(d.getTime())) {
    return mk("invalid", ["expiration-not-iso"]);
  }
  if (d.getTime() < Date.now()) {
    return mk("invalid", ["expired"]);
  }
  return mk("valid");
}

// ─── VOLUME / OPEN INTEREST ───────────────────────────────────────

export function assessVolume(volume: number | null): QualityAssessment {
  if (volume === null) {
    return mk("absent", ["volume-missing"], "not-provided-by-source");
  }
  if (volume < 0) {
    return mk("invalid", ["negative-volume"]);
  }
  return mk("valid");
}

export function assessOpenInterest(oi: number | null): QualityAssessment {
  if (oi === null) {
    return mk("absent", ["open-interest-missing"], "not-provided-by-source");
  }
  if (oi < 0) {
    return mk("invalid", ["negative-open-interest"]);
  }
  return mk("valid");
}

// ─── IVRANK ───────────────────────────────────────────────────────

/**
 * Avalia o cálculo de ivRank a partir de histórico de closes.
 *  - closes < 60 → absent, insufficient-history
 *  - closes ≥ 60 → valid (caller calcula o valor)
 */
export function assessIvRank(closes: number[] | null): QualityAssessment {
  if (closes === null) {
    return mk("absent", ["closes-not-provided"], "not-provided-by-source");
  }
  if (closes.length < 60) {
    return mk("absent", [], "insufficient-history");
  }
  return mk("valid");
}

// ─── IV ───────────────────────────────────────────────────────────

export function assessImpliedVolatility(iv: number | null): QualityAssessment {
  if (iv === null) {
    return mk("absent", ["iv-missing"], "not-provided-by-source");
  }
  if (iv < 0 || iv > 5) {
    return mk("invalid", ["iv-out-of-range"]);
  }
  return mk("valid");
}

// ─── SCHEMA ERROR ─────────────────────────────────────────────────

/**
 * Cria assessment de schema-error quando o parse falhou.
 */
export function schemaErrorAssessment(errors: string[]): QualityAssessment {
  return mk("invalid", errors, "schema-error");
}

// ─── AGGREGATE ────────────────────────────────────────────────────

/**
 * Combina múltiplos assessments. Pior caso vence:
 *  - qualquer invalid → invalid
 *  - senão qualquer suspicious → suspicious
 *  - senão qualquer absent → absent
 *  - senão → valid
 *
 * Os reasons são concatenados.
 */
export function combineAssessments(
  list: QualityAssessment[],
): QualityAssessment {
  const reasons: string[] = [];
  let worstAbsent: DataAbsenceReason | undefined;
  let hasInvalid = false;
  let hasSuspicious = false;
  let hasAbsent = false;

  for (const a of list) {
    reasons.push(...a.reasons);
    if (a.quality === "invalid") hasInvalid = true;
    if (a.quality === "suspicious") hasSuspicious = true;
    if (a.quality === "absent") {
      hasAbsent = true;
      // Prioridade de classificação de ausência:
      // 1. source-unavailable (mais grave — falha técnica)
      // 2. schema-error
      // 3. not-provided-by-source (neutro)
      // 4. insufficient-history
      const incoming = a.absenceReason;
      if (!incoming) continue;
      if (!worstAbsent) {
        worstAbsent = incoming;
        continue;
      }
      const order: Record<string, number> = {
        "source-unavailable": 4,
        "schema-error": 3,
        "not-provided-by-source": 2,
        "insufficient-history": 1,
      };
      const incomingRank = order[incoming] ?? 0;
      const currentRank = order[worstAbsent] ?? 0;
      if (incomingRank > currentRank) worstAbsent = incoming;
    }
  }

  if (hasInvalid) return mk("invalid", reasons);
  if (hasSuspicious) return mk("suspicious", reasons);
  if (hasAbsent) return mk("absent", reasons, worstAbsent ?? null);
  return mk("valid", reasons);
}
