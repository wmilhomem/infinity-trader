/**
 * Y.2.1 — SCHEMAS DE PARSE (Validação de runtime)
 *
 * Sem dependência externa (Zod/Valibot). Parsers próprios, sem coerção
 * silenciosa. null permanece null. Em falha de schema, o campo é marcado
 * quality "invalid" com absenceReason "schema-error" e reasons[] com a
 * lista de erros.
 *
 * REGRAS:
 *  - strike > 0
 *  - expiration ISO (YYYY-MM-DD)
 *  - iv ∈ [0, 5]
 *  - sem coerção silenciosa: valor inválido vira erro, não default
 */

import type {
  RawAsset,
  RawOptionContract,
  RawOptionChain,
  RawDICurvePoint,
  RawCorporateEvent,
} from "@/market/raw-types";

// ─── TIPOS DE ERRO E RESULTADO ────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
  expected?: string;
  received?: unknown;
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: ValidationError[] };

// ─── HELPERS ──────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function isIsoDate(s: unknown): s is string {
  if (typeof s !== "string") return false;
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d.getTime());
}

function pushError(
  errors: ValidationError[],
  path: string,
  message: string,
  expected?: string,
  received?: unknown,
): void {
  errors.push({ path, message, expected, received });
}

// ─── PARSE: ASSET ─────────────────────────────────────────────────

/**
 * Valida um RawAsset vindo do gateway.
 * Campos opcionais (realizedVol, ivRank) podem ser null.
 * Campos obrigatórios: ticker, symbol, name, price, lastUpdate.
 */
export function parseAsset(raw: unknown): ParseResult<RawAsset> {
  const errors: ValidationError[] = [];
  const r = (raw ?? {}) as Record<string, unknown>;

  if (typeof r.ticker !== "string" || r.ticker.length === 0) {
    pushError(errors, "ticker", "ticker obrigatório", "string", r.ticker);
  }
  if (typeof r.symbol !== "string" || r.symbol.length === 0) {
    pushError(errors, "symbol", "symbol obrigatório", "string", r.symbol);
  }
  if (typeof r.name !== "string") {
    pushError(errors, "name", "name obrigatório", "string", r.name);
  }
  if (!isFiniteNumber(r.price) || r.price < 0) {
    pushError(errors, "price", "price deve ser number ≥ 0", "number ≥ 0", r.price);
  }
  if (!isFiniteNumber(r.lastUpdate) || r.lastUpdate < 0) {
    pushError(errors, "lastUpdate", "lastUpdate deve ser number ≥ 0", "number ≥ 0", r.lastUpdate);
  }
  if (r.realizedVol !== null && r.realizedVol !== undefined && !isFiniteNumber(r.realizedVol)) {
    pushError(
      errors,
      "realizedVol",
      "realizedVol deve ser number ou null",
      "number|null",
      r.realizedVol,
    );
  }
  if (r.ivRank !== null && r.ivRank !== undefined) {
    if (!isFiniteNumber(r.ivRank) || r.ivRank < 0 || r.ivRank > 100) {
      pushError(
        errors,
        "ivRank",
        "ivRank deve ser number ∈ [0,100] ou null",
        "number ∈ [0,100] | null",
        r.ivRank,
      );
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      ticker: r.ticker as string,
      symbol: r.symbol as string,
      name: r.name as string,
      price: r.price as number,
      lastUpdate: r.lastUpdate as number,
      realizedVol: (r.realizedVol as number | null | undefined) ?? null,
      ivRank: (r.ivRank as number | null | undefined) ?? null,
    },
  };
}

// ─── PARSE: OPTION CONTRACT ───────────────────────────────────────

/**
 * Valida um RawOptionContract.
 * Regra: strike > 0, expiration ISO, iv ∈ [0, 5].
 */
export function parseOptionContract(raw: unknown): ParseResult<RawOptionContract> {
  const errors: ValidationError[] = [];
  const r = (raw ?? {}) as Record<string, unknown>;

  if (typeof r.symbol !== "string" || r.symbol.length === 0) {
    pushError(errors, "symbol", "symbol obrigatório", "string", r.symbol);
  }
  if (!isFiniteNumber(r.strikePrice) || r.strikePrice <= 0) {
    pushError(errors, "strikePrice", "strike deve ser number > 0", "number > 0", r.strikePrice);
  }
  if (r.right !== "C" && r.right !== "P") {
    pushError(errors, "right", "right deve ser 'C' ou 'P'", "'C' | 'P'", r.right);
  }
  if (!isIsoDate(r.expiration)) {
    pushError(
      errors,
      "expiration",
      "expiration deve ser ISO date YYYY-MM-DD",
      "ISO date",
      r.expiration,
    );
  }
  // bid/ask/last: podem ser 0, null ou number.
  if (r.bid !== null && r.bid !== undefined && !isFiniteNumber(r.bid)) {
    pushError(errors, "bid", "bid deve ser number ou null", "number|null", r.bid);
  }
  if (r.ask !== null && r.ask !== undefined && !isFiniteNumber(r.ask)) {
    pushError(errors, "ask", "ask deve ser number ou null", "number|null", r.ask);
  }
  if (r.last !== null && r.last !== undefined && !isFiniteNumber(r.last)) {
    pushError(errors, "last", "last deve ser number ou null", "number|null", r.last);
  }
  if (r.impliedVolatility !== null && r.impliedVolatility !== undefined) {
    if (
      !isFiniteNumber(r.impliedVolatility) ||
      r.impliedVolatility < 0 ||
      r.impliedVolatility > 5
    ) {
      pushError(
        errors,
        "impliedVolatility",
        "iv deve ser number ∈ [0, 5] ou null",
        "number ∈ [0, 5] | null",
        r.impliedVolatility,
      );
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      symbol: r.symbol as string,
      strikePrice: r.strikePrice as number,
      right: r.right as "C" | "P",
      expiration: r.expiration as string,
      bid: ((r.bid as number | null | undefined) ?? null) as number | null,
      ask: ((r.ask as number | null | undefined) ?? null) as number | null,
      last: ((r.last as number | null | undefined) ?? null) as number | null,
      volume: ((r.volume as number | null | undefined) ?? null) as number | null,
      openInterest: ((r.openInterest as number | null | undefined) ?? null) as number | null,
      impliedVolatility: ((r.impliedVolatility as number | null | undefined) ?? null) as
        number | null,
      greeks: r.greeks as RawOptionContract["greeks"],
    },
  };
}

// ─── PARSE: OPTION CHAIN ──────────────────────────────────────────

export function parseOptionChain(raw: unknown): ParseResult<RawOptionChain> {
  const errors: ValidationError[] = [];
  const r = (raw ?? {}) as Record<string, unknown>;

  if (typeof r.underlying !== "string" || r.underlying.length === 0) {
    pushError(errors, "underlying", "underlying obrigatório", "string", r.underlying);
  }
  if (!isFiniteNumber(r.timestamp) || r.timestamp < 0) {
    pushError(errors, "timestamp", "timestamp deve ser number ≥ 0", "number ≥ 0", r.timestamp);
  }
  if (r.source !== "yahoo" && r.source !== "modelo") {
    pushError(
      errors,
      "source",
      "source deve ser 'yahoo' ou 'modelo'",
      "'yahoo' | 'modelo'",
      r.source,
    );
  }
  if (!Array.isArray(r.contracts)) {
    pushError(errors, "contracts", "contracts deve ser array", "Array", r.contracts);
  }

  if (errors.length > 0) return { ok: false, errors };

  // valida cada contrato, mas permite que a chain inteira seja válida
  // mesmo com contratos individuais com problemas (eles serão filtrados
  // pelo normalizer). Aqui só validamos a estrutura da chain.
  return {
    ok: true,
    data: {
      underlying: r.underlying as string,
      timestamp: r.timestamp as number,
      source: r.source as "yahoo" | "modelo",
      contracts: r.contracts as RawOptionContract[],
    },
  };
}

// ─── PARSE: DI CURVE ──────────────────────────────────────────────

export function parseDICurve(raw: unknown): ParseResult<RawDICurvePoint[]> {
  if (!Array.isArray(raw)) {
    return {
      ok: false,
      errors: [{ path: "", message: "DI curve deve ser array", expected: "Array", received: raw }],
    };
  }

  const errors: ValidationError[] = [];
  const points: RawDICurvePoint[] = [];

  for (let i = 0; i < raw.length; i++) {
    const r = (raw[i] ?? {}) as Record<string, unknown>;
    const pointErrors: ValidationError[] = [];

    if (!isFiniteNumber(r.days) || r.days <= 0) {
      pointErrors.push({
        path: `[${i}].days`,
        message: "days deve ser number > 0",
        expected: "number > 0",
        received: r.days,
      });
    }
    if (!isFiniteNumber(r.rate) || r.rate < 0 || r.rate > 1) {
      pointErrors.push({
        path: `[${i}].rate`,
        message: "rate deve ser number ∈ [0, 1]",
        expected: "number ∈ [0, 1]",
        received: r.rate,
      });
    }

    if (pointErrors.length > 0) {
      errors.push(...pointErrors);
    } else {
      points.push({ days: r.days as number, rate: r.rate as number });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: points };
}

// ─── PARSE: CORPORATE EVENTS ──────────────────────────────────────

/**
 * Valida um array de eventos corporativos.
 * Eventos individuais inválidos são filtrados (não geram erro global).
 * Retorna apenas os válidos.
 */
export function parseCorporateEvents(raw: unknown): ParseResult<RawCorporateEvent[]> {
  if (!Array.isArray(raw)) {
    return {
      ok: false,
      errors: [{ path: "", message: "events deve ser array", expected: "Array", received: raw }],
    };
  }

  const events: RawCorporateEvent[] = [];
  for (let i = 0; i < raw.length; i++) {
    const r = (raw[i] ?? {}) as Record<string, unknown>;
    if (
      typeof r.ticker === "string" &&
      typeof r.type === "string" &&
      isFiniteNumber(r.value) &&
      isIsoDate(r.exDate)
    ) {
      events.push({
        ticker: r.ticker,
        type: r.type,
        value: r.value as number,
        exDate: r.exDate,
      });
    }
    // inválidos são silenciosamente filtrados (não há requirement forte
    // sobre integridade de eventos hoje — gateway retorna [])
  }

  return { ok: true, data: events };
}
