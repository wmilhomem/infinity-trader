import type { Json } from "@/integrations/supabase/types";
import type { Perna } from "@/lib/payoff";
import { payoffCurve } from "@/lib/payoff";
import type { CadeiaEvidencia } from "@/lib/cadeia-evidencia";
import { lerCadeiaEvidencia } from "@/lib/cadeia-evidencia";
import { interpretar, type Interpretacao } from "./simulation-interpreter";
import { narrarMudanca, type PassoNarrativa } from "./narrator";
import { obj, txt, num } from "./decision-memory-reader";

/**
 * DECISION REPLAY — reconstitui uma decisão inteira a partir do snapshot
 * cognitivo gravado em decision_memory.contexto no instante do registro.
 * Tela, IV, payoff, emoção, contexto, regras e narrativa: tudo que a
 * plataforma sabia naquele dia volta a existir, sem chute e sem IA.
 * Campos que não foram observados na época aparecem como null.
 */

export type ReplayAlerta = {
  regra: string;
  severidade: string;
  motivo: string;
};

export type ReplayChecklist = {
  itens: { chave: string; ok: boolean }[];
  total: number;
  marcados: number;
};

import type { MarketContext } from "@/lib/market-context";
import type { MercadoObservadoComProvenance } from "@/lib/market-data/mercado-observado-provenance";

export type ReplayView = {
  entryId: string;
  ativo: string;
  estrutura: string;
  tese: string | null;
  data: string;
  score: number | null;
  scoreItens: { chave: string; rotulo: string; pts: number; max: number }[] | null;
  scoreLeitura: string | null;
  nome: string | null;
  pernas: Perna[] | null;
  precoReferencia: number | null;
  interpretacao: Interpretacao | null;
  curva: { preco: number; resultado: number }[] | null;
  narrativa: PassoNarrativa | null;
  checklist: ReplayChecklist | null;
  alertas: ReplayAlerta[];
  regraAplicada: string | null;
  seguiuRegra: boolean | null;
  emocao: string | null;
  padroes: string[];
  disciplinaHistorica: number | null;
  ivAtm: number | null;
  ivRank: number | null;
  liquidityScore: string | null;
  eventsImminent: boolean | null;
  resultado: number | null;
  status: string | null;
  capturedWeekday: number | null;
  sessionPhase: string | null;
  /** Como a pessoa chegou à decisão — ou null quando não registrado na época. */
  cadeiaEvidencia: CadeiaEvidencia | null;
  /** O contexto canônico de mercado observado no instante da decisão (Rodada X). */
  marketContext: MarketContext | null;
  /** Y.2 — Mercado observado com provenance granular por campo. */
  mercadoY2: MercadoObservadoComProvenance | null;
};

const ROTULOS_ITENS: Record<string, string> = {
  simulou: "Simulou antes de decidir",
  tese: "Tese escrita",
  checklist: "Checklist completo",
  risco: "Risco controlado",
  disciplina: "Disciplina histórica",
};

function isPerna(v: unknown): v is Perna {
  const p = obj(v);
  if (!p) return false;
  const tipo = txt(p.tipo);
  const acao = txt(p.acao);
  return (
    (tipo === "call" || tipo === "put") &&
    (acao === "compra" || acao === "venda") &&
    typeof p.strike === "number" &&
    typeof p.premio === "number" &&
    typeof p.quantidade === "number"
  );
}

export function lerReplay(
  entry: {
    id: string;
    ativo: string;
    estrutura: string;
    motivo: string | null;
    created_at: string;
    status: string;
    resultado: number | null;
  },
  contexto: Json | null,
): ReplayView | null {
  const c = obj(contexto);
  if (!c) return null;

  const strategy = obj(c.strategy);
  const interpretacaoRaw = obj(strategy?.interpretacao);
  const pernas = Array.isArray(strategy?.pernas)
    ? ((strategy.pernas as unknown[]).filter(isPerna) as Perna[])
    : [];
  const precoReferencia = num(strategy?.precoReferencia);

  const processo = obj(c.processo);
  const comportamento = obj(c.comportamento);
  const mercado = obj(c.mercado);
  const resultado = obj(c.resultado);
  const tempo = obj(c.tempo);

  const alertas = Array.isArray(processo?.alertas)
    ? (processo.alertas as unknown[])
        .map((a) => {
          const o = obj(a);
          return o
            ? {
                regra: txt(o.regra) ?? "Regra",
                severidade: txt(o.severidade) ?? "aviso",
                motivo: txt(o.motivo) ?? "",
              }
            : null;
        })
        .filter((a): a is ReplayAlerta => a !== null)
    : [];

  const checkRaw = obj(processo?.checklist);
  const itensChecklist = checkRaw
    ? Object.entries(checkRaw)
        .filter(([, v]) => typeof v === "boolean")
        .map(([chave, v]) => ({ chave, ok: v === true }))
    : null;
  const checklist: ReplayChecklist | null = itensChecklist
    ? {
        itens: itensChecklist,
        total: itensChecklist.length,
        marcados: itensChecklist.filter((i) => i.ok).length,
      }
    : null;

  const itensScore = Array.isArray(processo?.itens)
    ? (processo.itens as unknown[])
        .map((i) => {
          const o = obj(i);
          if (!o) return null;
          return {
            chave: txt(o.chave) ?? "item",
            rotulo: txt(o.rotulo) ?? ROTULOS_ITENS[txt(o.chave) ?? ""] ?? "Item",
            pts: num(o.pts) ?? 0,
            max: num(o.max) ?? 0,
          };
        })
        .filter((i): i is NonNullable<typeof i> => i !== null)
    : null;

  const padroes = Array.isArray(comportamento?.padroesPresentes)
    ? (comportamento.padroesPresentes as unknown[])
        .map((p) => txt(obj(p)?.titulo))
        .filter((t): t is string => t !== null)
    : [];

  const nome = txt(interpretacaoRaw?.nome) ?? txt(c.estrategia) ?? entry.estrutura;

  let interpretacao: Interpretacao | null = null;
  let curva: { preco: number; resultado: number }[] | null = null;
  let narrativa: PassoNarrativa | null = null;
  if (pernas.length > 0 && precoReferencia && precoReferencia > 0) {
    interpretacao = interpretar(pernas, precoReferencia, entry.ativo);
    curva = payoffCurve(pernas, precoReferencia, 0.3, 101);
    narrativa = narrarMudanca([], pernas, entry.ativo, precoReferencia);
  }

  const marketContextObj = obj(c.marketContext) as unknown as MarketContext | null;
  const mercadoY2Obj = obj(c.mercadoY2) as unknown as MercadoObservadoComProvenance | null;

  return {
    entryId: entry.id,
    ativo: entry.ativo,
    estrutura: entry.estrutura,
    tese: txt(entry.motivo) ?? txt(processo?.tese),
    data: entry.created_at,
    score: num(processo?.score),
    scoreItens: itensScore,
    scoreLeitura: txt(processo?.leitura),
    nome,
    pernas: pernas.length ? pernas : null,
    precoReferencia,
    interpretacao,
    curva,
    narrativa,
    checklist,
    alertas,
    regraAplicada: txt(processo?.regraAplicada),
    seguiuRegra: typeof processo?.seguiuRegra === "boolean" ? processo.seguiuRegra : null,
    emocao: txt(comportamento?.emocao),
    padroes,
    disciplinaHistorica: num(comportamento?.disciplinaHistorica),
    ivAtm: num(mercado?.ivAtm),
    ivRank: num(mercado?.ivRank),
    liquidityScore: txt(mercado?.liquidityScore),
    eventsImminent: typeof mercado?.eventsImminent === "boolean" ? mercado.eventsImminent : null,
    resultado: num(resultado?.resultado) ?? entry.resultado,
    status: txt(resultado?.status) ?? entry.status,
    capturedWeekday: num(tempo?.capturedWeekday),
    sessionPhase: txt(tempo?.sessionPhase),
    cadeiaEvidencia: lerCadeiaEvidencia(processo?.cadeiaEvidencia),
    marketContext: marketContextObj && marketContextObj.version === 1 ? marketContextObj : null,
    mercadoY2: mercadoY2Obj,
  };
}
