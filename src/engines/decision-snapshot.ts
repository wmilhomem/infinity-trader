import type { Perna } from "@/lib/payoff";
import type { Interpretacao } from "./simulation-interpreter";
import type { Alerta } from "./rule-engine";
import type { DecisionScore } from "./decision-engine";
import type { Padrao } from "./behavior-engine";
import { buildTimeDimension } from "./context-engine";

// ==========================================
// DECISION MEMORY — SNAPSHOT DE ESTADO
// ==========================================
// O cenário completo registrado no instante da decisão. Gravado em
// decision_memory.contexto junto à entrada do Diário, para que o módulo
// Review consiga reconstruir — meses depois — exatamente em que condições
// (mercado, estratégia, processo e comportamento) a decisão foi tomada.
//
// Os blocos `mercado` e `portfolio` são propositalmente nulos nesta fase:
// serão preenchidos pelo Eixo 3 (Gateway B3 real). O restante já é 100%
// fiel ao que a plataforma sabe no momento do registro.

export type DecisionSnapshot = {
  version: 1;
  captured_at: string;
  /** O que foi montado: estrutura, pernas e leitura estratégica. */
  strategy: {
    ativo: string | null;
    estrutura: string | null;
    precoReferencia: number | null;
    pernas: Perna[] | null;
    interpretacao: Interpretacao | null;
  } | null;
  /** Como foi decidido: tese, checklist, alertas de regra, Decision Score. */
  processo: {
    simulou: boolean;
    tese: string;
    checklist: Record<string, boolean>;
    score: number;
    itens: DecisionScore["itens"];
    leitura: string;
    alertas: Alerta[];
    regraAplicada: string | null;
    seguiuRegra: boolean | null;
    marketReading?: {
      representation: "candle" | "renko";
      brickSize?: number;
    } | null;
  };
  /** Quem estava decidindo: disciplina histórica, padrões presentes, emoção. */
  comportamento: {
    disciplinaHistorica: number;
    padroesPresentes: Padrao[];
    emocao: string | null;
  };
  /** O que sabemos do desfecho até o momento do registro. */
  resultado: {
    status: string;
    resultado: number | null;
  };
  /** Preenchido pelo Eixo 3 (B3 / Cumbuca Livre / BCB). Nulo enquanto mock. */
  mercado: {
    ivAtm: number | null;
    ivRank: number | null;
    diCurveState: string | null;
    liquidityScore: string | null;
    eventsImminent: boolean | null;
  };
  /** Janela temporal do registro (aprox. horário da B3). */
  tempo: {
    capturedWeekday: number;
    sessionPhase: "abertura" | "miolo" | "fechamento" | "fechado";
    weekSegment: "inicio" | "meio" | "fim";
  };
  /** Exposições líquidas da carteira. Nulo enquanto não há somatório de gregas. */
  portfolio: {
    netDelta: number | null;
    netTheta: number | null;
    netVega: number | null;
    netRho: number | null;
  };
};

export type DecisionSnapshotInput = {
  capturedAt?: Date;
  strategy?: {
    ativo: string | null;
    estrutura: string | null;
    precoReferencia: number | null;
    pernas: Perna[] | null;
    interpretacao: Interpretacao | null;
  } | null;
  processo: {
    simulou: boolean;
    tese: string;
    checklist: Record<string, boolean>;
    score: DecisionScore;
    alertas: Alerta[];
    regraAplicada: string | null;
    seguiuRegra: boolean | null;
    marketReading?: {
      representation: "candle" | "renko";
      brickSize?: number;
    } | null;
  };
  comportamento: {
    disciplinaHistorica: number;
    padroesPresentes: Padrao[];
    emocao: string | null;
  };
  resultado: {
    status: string;
    resultado: number | null;
  };
  mercado?: DecisionSnapshot["mercado"];
  portfolio?: DecisionSnapshot["portfolio"];
};

/**
 * Monta o snapshot completo do instante da decisão. Tudo que não é
 * fornecida na entrada entra como "não observado" (null) — nunca como chute.
 */
export function buildDecisionSnapshot(input: DecisionSnapshotInput): DecisionSnapshot {
  const capturedAt = input.capturedAt ?? new Date();
  const t = buildTimeDimension(0, capturedAt);
  const m = input.mercado;
  const p = input.portfolio;

  return {
    version: 1,
    captured_at: capturedAt.toISOString(),
    strategy: input.strategy
      ? {
          ativo: input.strategy.ativo,
          estrutura: input.strategy.estrutura,
          precoReferencia: input.strategy.precoReferencia,
          pernas: input.strategy.pernas,
          interpretacao: input.strategy.interpretacao,
        }
      : null,
    processo: {
      simulou: input.processo.simulou,
      tese: input.processo.tese,
      checklist: input.processo.checklist,
      score: input.processo.score.score,
      itens: input.processo.score.itens,
      leitura: input.processo.score.leitura,
      alertas: input.processo.alertas,
      regraAplicada: input.processo.regraAplicada,
      seguiuRegra: input.processo.seguiuRegra,
      marketReading: input.processo.marketReading ?? null,
    },
    comportamento: {
      disciplinaHistorica: input.comportamento.disciplinaHistorica,
      padroesPresentes: input.comportamento.padroesPresentes,
      emocao: input.comportamento.emocao,
    },
    resultado: {
      status: input.resultado.status,
      resultado: input.resultado.resultado,
    },
    mercado: m
      ? {
          ivAtm: m.ivAtm ?? null,
          ivRank: m.ivRank ?? null,
          diCurveState: m.diCurveState ?? null,
          liquidityScore: m.liquidityScore ?? null,
          eventsImminent: m.eventsImminent ?? null,
        }
      : {
          ivAtm: null,
          ivRank: null,
          diCurveState: null,
          liquidityScore: null,
          eventsImminent: null,
        },
    tempo: {
      capturedWeekday: capturedAt.getDay(),
      sessionPhase: t.sessionPhase,
      weekSegment: t.weekSegment,
    },
    portfolio: p
      ? {
          netDelta: p.netDelta ?? null,
          netTheta: p.netTheta ?? null,
          netVega: p.netVega ?? null,
          netRho: p.netRho ?? null,
        }
      : { netDelta: null, netTheta: null, netVega: null, netRho: null },
  };
}
