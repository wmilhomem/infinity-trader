import type { ProviderQuote } from "@/market/providers";

/**
 * MERCADO OBSERVADO — a fatia do mundo que existia no instante da decisão.
 * Domínio puro (sem React/Supabase/IA). Regra da Rodada W: o snapshot é
 * imutável — o que não foi observado é null, nunca refetch/recalculo do
 * passado com dados atuais. A proveniência (fonte + instante) é parte do
 * dado: "PETR4 estava em R$ 38 às 14:32:17, segundo a fonte X" — não
 * apenas "PETR4 estava em R$ 38".
 */

export type FonteMercado = ProviderQuote["provider"]; // "mock" | "live" | "modelo" | "replay"

/** Rótulo honesto de cada fonte — o Copilot e a UI usam esta linguagem. */
export const FONTE_MERCADO_LABEL: Record<FonteMercado, string> = {
  mock: "Ambiente didático (sandbox)",
  live: "Book ao vivo",
  modelo: "Dado calculado/modelado — não é o book real",
  replay: "Recuperado de uma decisão histórica",
};

export type MercadoObservado = {
  /** Instante exato da observação que participou da decisão (ISO). */
  observadoEm: string | null;
  /** Proveniência do dado: mock | live | modelo | replay. */
  fonte: FonteMercado | null;
  spot: number | null;
  ivAtm: number | null;
  ivRank: number | null;
  /** Estado da curva DI. Nulo enquanto não observado — nunca chute. */
  diCurveState: string | null;
  liquidityScore: "alta" | "media" | "baixa" | null;
  eventsImminent: boolean | null;
};

/**
 * Converte o quote do provedor no bloco de mercado do snapshot.
 * Sem quote → null (o mercado não foi observado nesta decisão).
 * A curva DI não é observada no simulador → permanece null.
 */
export function mercadoDoQuote(quote: ProviderQuote | null): MercadoObservado | null {
  if (!quote) return null;
  return {
    observadoEm: typeof quote.quoteTime === "string" && quote.quoteTime ? quote.quoteTime : null,
    fonte: quote.provider,
    spot: Number.isFinite(quote.spot) && quote.spot > 0 ? quote.spot : null,
    ivAtm: Number.isFinite(quote.ivAtm ?? NaN) && (quote.ivAtm ?? 0) > 0 ? quote.ivAtm : null,
    ivRank: Number.isFinite(quote.ivRank ?? NaN) ? quote.ivRank : null,
    diCurveState: null,
    liquidityScore: quote.liquidityScore ?? null,
    eventsImminent: quote.eventsImminent ?? null,
  };
}

function temValor(v: unknown): boolean {
  return v !== null && v !== undefined && v !== "";
}

/** Indica se o bloco carrega pelo menos um fato observado (ou proveniência). */
export function mercadoObservadoTemFato(
  m: {
    fonte: unknown;
    spot: unknown;
    ivAtm: unknown;
    ivRank: unknown;
    liquidityScore: unknown;
    eventsImminent: unknown;
  } | null,
): boolean {
  if (!m) return false;
  return (
    temValor(m.fonte) ||
    temValor(m.spot) ||
    temValor(m.ivAtm) ||
    temValor(m.ivRank) ||
    temValor(m.liquidityScore) ||
    temValor(m.eventsImminent)
  );
}
