import type { Json } from "@/integrations/supabase/types";

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
};

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function txt(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function obj(v: unknown): Record<string, unknown> | null {
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

  const alertas = Array.isArray(processo?.alertas) ? (processo.alertas as unknown[]) : [];
  const padroes = Array.isArray(comportamento?.padroesPresentes)
    ? (comportamento.padroesPresentes as unknown[])
        .map((p) => txt(obj(p)?.titulo))
        .filter((t): t is string => t !== null)
    : [];

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
  };
}
