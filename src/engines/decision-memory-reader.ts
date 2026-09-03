import type { Json } from "@/integrations/supabase/types";
import type { CadeiaEvidencia } from "@/lib/cadeia-evidencia";
import { lerCadeiaEvidencia } from "@/lib/cadeia-evidencia";
import type { FonteMercado } from "@/lib/mercado-snapshot";
import { mercadoObservadoTemFato } from "@/lib/mercado-snapshot";
import type { MarketContext } from "@/lib/market-context";

/**
 * DECISION MEMORY READER — lê o snapshot cognitivo gravado em
 * decision_memory.contexto (JSON) no instante da decisão e devolve uma
 * visão tipada e segura para a UI. Nunca chuta: campo ausente = null.
 */

export type SnapshotCognitivoView = {
  estrategia: string | null;
  score: number | null;
  regrasQuebradas: number;
  emocao: string | null;
  padroes: string[];
  capitalEmRisco: number | null;
  capitalComprometido: number | null;
  ivAtm: number | null;
  ivRank: number | null;
  resultado: number | null;
  status: string | null;
  representacao: string | null;
  brickSize: number | null;
  /** A cadeia de evidência registrada nesta decisão — ou null em decisões antigas. */
  cadeiaEvidencia: CadeiaEvidencia | null;
  /** O mercado observado no instante (Rodada W) — null se não registrado. */
  mercado: MercadoObservadoView | null;
  /** Exposições líquidas da carteira no instante (Rodada W) — null sem posições. */
  portfolio: PortfolioObservadoView | null;
  /** O Contexto de Mercado canônico (Rodada X) — null em decisões antigas. */
  marketContext: MarketContext | null;
};

export type MercadoObservadoView = {
  observadoEm: string | null;
  fonte: FonteMercado | null;
  spot: number | null;
  ivAtm: number | null;
  ivRank: number | null;
  diCurveState: string | null;
  liquidityScore: string | null;
  eventsImminent: boolean | null;
};

export type PortfolioObservadoView = {
  source: string | null;
  valuationSource: string | null;
  valuatedAt: string | null;
  netDelta: number | null;
  netTheta: number | null;
  netVega: number | null;
  netRho: number | null;
  marginUtilized: number | null;
  topAssets: string[] | null;
};

export function temCadeiaEvidencia(snap: Pick<SnapshotCognitivoView, "cadeiaEvidencia">): boolean {
  return snap.cadeiaEvidencia !== null;
}

export function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function txt(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

export function obj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export function lerSnapshotCognitivo(contexto: Json | null): SnapshotCognitivoView | null {
  const c = obj(contexto);
  if (!c) return null;

  const strategy = obj(c.strategy);
  const interpretacao = obj(strategy?.interpretacao);
  const processo = obj(c.processo);
  const comportamento = obj(c.comportamento);
  const mercado = obj(c.mercado);
  const resultado = obj(c.resultado);
  const marketContextObj = obj(c.marketContext) as unknown as MarketContext | null;

  const alertas = Array.isArray(processo?.alertas) ? (processo.alertas as unknown[]) : [];
  const padroes = Array.isArray(comportamento?.padroesPresentes)
    ? (comportamento.padroesPresentes as unknown[])
        .map((p) => txt(obj(p)?.titulo))
        .filter((t): t is string => t !== null)
    : [];
  const marketReading = obj(processo?.marketReading);

  // Mercado observado — só vira objeto se carregar pelo menos um fato
  // observado (ou proveniência). Bloco vazio/antigo = null (não observado).
  const mercadoBruto = mercado
    ? {
        observadoEm: txt(mercado.observadoEm),
        fonte: (txt(mercado.fonte) ?? null) as FonteMercado | null,
        spot: num(mercado.spot),
        ivAtm: num(mercado.ivAtm),
        ivRank: num(mercado.ivRank),
        diCurveState: txt(mercado.diCurveState),
        liquidityScore: txt(mercado.liquidityScore),
        eventsImminent: typeof mercado.eventsImminent === "boolean" ? mercado.eventsImminent : null,
      }
    : null;
  const mercadoView = mercadoBruto && mercadoObservadoTemFato(mercadoBruto) ? mercadoBruto : null;

  const portfolio = obj(c.portfolio);
  const portfolioView: PortfolioObservadoView | null = portfolio
    ? {
        source: txt(portfolio.source),
        valuationSource: txt(portfolio.valuationSource),
        valuatedAt: txt(portfolio.valuatedAt),
        netDelta: num(portfolio.netDelta),
        netTheta: num(portfolio.netTheta),
        netVega: num(portfolio.netVega),
        netRho: num(portfolio.netRho),
        marginUtilized: num(portfolio.marginUtilized),
        topAssets: Array.isArray(portfolio.topAssets)
          ? (portfolio.topAssets as unknown[])
              .map((a) => txt(a))
              .filter((t): t is string => t !== null)
          : null,
      }
    : null;
  // Bloco presente mas sem nenhum fato de exposição (source/valuationSource
  // são metadados de proveniência, não fatos de exposição) = não observado.
  // Nunca reconstruir o passado.
  const portfolioTemFato =
    portfolioView !== null &&
    (portfolioView.netDelta !== null ||
      portfolioView.netTheta !== null ||
      portfolioView.netVega !== null ||
      portfolioView.netRho !== null ||
      portfolioView.marginUtilized !== null ||
      (portfolioView.topAssets !== null && portfolioView.topAssets.length > 0));

  return {
    estrategia: txt(strategy?.estrutura) ?? txt(c.estrategia),
    score: num(processo?.score),
    regrasQuebradas: alertas.length,
    emocao: txt(comportamento?.emocao),
    padroes,
    capitalEmRisco: num(interpretacao?.capitalEmRisco),
    capitalComprometido: num(interpretacao?.capitalComprometido),
    ivAtm: num(mercado?.ivAtm),
    ivRank: num(mercado?.ivRank),
    resultado: num(resultado?.resultado),
    status: txt(resultado?.status),
    representacao: marketReading ? txt(marketReading.representation) : null,
    brickSize: marketReading ? num(marketReading.brickSize) : null,
    cadeiaEvidencia: lerCadeiaEvidencia(processo?.cadeiaEvidencia),
    mercado: mercadoView,
    portfolio: portfolioTemFato ? portfolioView : null,
    marketContext: marketContextObj && marketContextObj.version === 1 ? marketContextObj : null,
  };
}
