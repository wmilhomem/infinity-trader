/**
 * Y.2 — MARKET DATA PACKAGE & DATA QUALITY
 * Rodada Y.2 — Camada de Adapter de Fonte
 *
 * Esta camada representa o PACOTE que sai de uma fonte de dados (Yahoo,
 * BCB, modelo, etc.) antes de ser normalizado para o `MarketContext` Y.1.
 *
 * PRINCÍPIOS FUNDAMENTAIS (Y.2):
 *
 * 1. Falha de rede ≠ ausência de dados ≠ dado inválido.
 *    O pacote carrega diagnóstico de origem distinto por motivo:
 *      - source-unavailable   (timeout/5xx): quality "absent"
 *      - not-provided-by-source (campo não existe na fonte): quality "absent"
 *      - insufficient-history   (histórico < 60 dias): quality "absent"
 *      - schema-error         (campo obrigatório inválido): quality "invalid"
 *      - crossed-book         (bid > ask): quality "invalid"
 *
 * 2. null tem significado duplo e distinto:
 *      - ausente na fonte  (quality "absent", reason "not-provided-by-source")
 *      - indisponível      (quality "absent", reason "source-unavailable")
 *      - inválido          (quality "invalid", reason "crossed-book" etc.)
 *
 * 3. Nunca inventa valores. Preserva o diagnóstico.
 * 4. suspicious NÃO é apagado: entra com value preservado + diagnóstico.
 * 5. Nenhuma recomendação/operação/sinal.
 */

// ─── QUALIDADE DE DADO (POR ENVELOPE) ────────────────────────────

export type DataQuality = "valid" | "suspicious" | "invalid" | "absent";

/**
 * Razão de ausência (quando quality === "absent").
 * `null` significa: o campo está ausente mas sem motivo classificado
 * (não deve acontecer em produção — sempre classificar).
 */
export type DataAbsenceReason =
  | "not-provided-by-source"
  | "insufficient-history"
  | "source-unavailable"
  | "schema-error"
  | null;

// ─── PROVENIÊNCIA DE CAMPO (Y.1) ───────────────────────────────────

/**
 * Proveniência de um campo individual.
 * Mesmo formato Y.1 — preservado para que o Replay histórico não
 * tenha que recalcular dados antigos com modelos diferentes.
 */
export interface FieldProvenance {
  origin: "observed" | "calculated" | "estimated";
  method?: string | null;
  inputs?: Record<string, number | string | null> | null;
  source?: string | null;
  calculatedAt?: string | null;
}

// ─── ENVELOPE GENÉRICO (Y.2) ─────────────────────────────────────

/**
 * Envelope de um campo de dados vindo de uma fonte externa.
 *
 * - `value`       : o valor observado, ou null se ausente/inválido
 * - `provenance`  : de onde veio (observado, calculado, estimado)
 * - `quality`     : validação de integridade
 * - `absenceReason`: por que o valor é null (quando quality === "absent")
 * - `reasons`     : diagnóstico adicional (ex: "spread > 50%", "crossed-book")
 *
 * REGRA: 0 legítimo é preservado. null ≠ 0. Sem coerção silenciosa.
 */
export interface FieldEnvelope<T> {
  value: T | null;
  provenance: FieldProvenance;
  quality: DataQuality;
  absenceReason?: DataAbsenceReason;
  reasons?: string[];
}

// ─── SNAPSHOTS DE DOMÍNIO ────────────────────────────────────────

/**
 * Snapshot de um ativo (papel, índice, etc.).
 * Pode ser observado diretamente (preço) ou derivado (rank de IV).
 */
export interface AssetSnapshot {
  ticker: string;
  symbol: string;
  name: string;
  price: number | null;
  previousClose: number | null;
  volume: number | null;
  realizedVol: number | null;
  ivRank: number | null;
  observedAt: string;
}

/**
 * Snapshot de uma cadeia de opções.
 * Atenção: contratos individuais carregam proveniência por campo.
 */
export interface OptionContractSnapshot {
  symbol: string;
  strike: number;
  right: "C" | "P";
  expiration: string;
  bid: number | null;
  ask: number | null;
  last: number | null;
  volume: number | null;
  openInterest: number | null;
  impliedVolatility: number | null;
}

export interface OptionChainSnapshot {
  underlying: string;
  expiration: string;
  contracts: OptionContractSnapshot[];
  observedAt: string;
}

/**
 * Snapshot da curva DI (BCB).
 */
export interface DICurvePointSnapshot {
  days: number;
  rate: number;
}

export interface DICurveSnapshot {
  baseDate: string;
  points: DICurvePointSnapshot[];
  source: string;
}

/**
 * Snapshot de eventos corporativos (dividendos, JCP, desdobramentos).
 */
export interface CorporateEventSnapshot {
  ticker: string;
  type: string;
  valueOrRatio: number;
  exDate: string;
  paymentDate?: string | null;
}

// ─── PACOTE DE MERCADO (Y.2) ─────────────────────────────────────

/**
 * Pacote de dados de mercado vindo de uma fonte.
 *
 * `availability` agrega a qualidade de cada envelope:
 *   - "available"   : todos os envelopes são valid
 *   - "partial"     : algum valid + algum absent/suspicious
 *   - "unavailable" : todos absent com source-unavailable (falha de rede)
 */
export interface MarketDataPackage {
  schemaVersion: 1;
  source: "yahoo-finance" | "bcb" | "model" | "unknown";
  provider: string | null;
  capturedAt: string;
  observedAt: string | null;
  availability: "available" | "partial" | "unavailable";

  asset: FieldEnvelope<AssetSnapshot> | null;
  optionChain: FieldEnvelope<OptionChainSnapshot> | null;
  diCurve: FieldEnvelope<DICurveSnapshot> | null;
  corporateEvents: FieldEnvelope<CorporateEventSnapshot[]> | null;
}

// ─── INTERFACE DE PROVIDER (Y.2) ──────────────────────────────────

/**
 * Contrato de provider de dados de mercado.
 * BOUNDARY B3: preparado para futura substituição por adapter nativo B3.
 * Quando a B3 real existir, criar B3SourceAdapter implements MarketDataProvider
 * sem alterar camadas acima.
 */
export interface MarketDataProvider {
  fetchPackage(ticker: string): Promise<MarketDataPackage>;
}

// ─── AGREGAÇÃO DE AVAILABILITY ────────────────────────────────────

/**
 * Regra de agregação:
 * - algum envelope valid                                       → não-unavailable
 * - todos os envelopes com source-unavailable (incluindo null) → "unavailable"
 * - algum valid + algum absent/suspicious/invalid              → "partial"
 * - tudo valid                                                 → "available"
 */
export function aggregateAvailability(
  envelopes: Array<FieldEnvelope<unknown> | null>,
): MarketDataPackage["availability"] {
  let hasValid = false;
  let hasUnavail = false;
  let hasOther = false; // ausente (não-unavail), suspicious, invalid
  let total = 0;

  for (const e of envelopes) {
    total++;
    if (!e) {
      hasUnavail = true;
      continue;
    }
    if (e.quality === "valid") {
      hasValid = true;
    } else if (e.quality === "absent" && e.absenceReason === "source-unavailable") {
      hasUnavail = true;
    } else {
      hasOther = true;
    }
  }

  if (total === 0) return "unavailable";
  // Se TODOS os envelopes são source-unavailable (sem nenhum valid/outro)
  if (hasUnavail && !hasValid && !hasOther) return "unavailable";
  if (hasValid && !hasUnavail && !hasOther) return "available";
  return "partial";
}
