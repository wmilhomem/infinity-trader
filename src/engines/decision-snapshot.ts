import type { Perna } from "@/lib/payoff";
import type { CadeiaEvidencia } from "@/lib/cadeia-evidencia";
import { validarCadeiaEvidencia } from "@/lib/cadeia-evidencia";
import type { MercadoObservado } from "@/lib/mercado-snapshot";
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
    /**
     * O processo cognitivo que produziu a decisão (Rodada V). Opcional e
     * null-safe: decisões antigas seguem com null — a cadeia nunca é
     * reconstruída artificialmente. A versão do snapshot permanece 1 porque
     * o contrato existente só foi enriquecido, não alterado.
     */
    cadeiaEvidencia?: CadeiaEvidencia | null;
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
  /**
   * O mercado observado no instante da decisão (Rodada W). Provém do quote
   * que efetivamente participou da decisão — fonte + instante fazem parte do
   * dado. Nulo enquanto mock/não observado; nunca refetch do passado.
   */
  mercado: MercadoObservado;
  /** Janela temporal do registro (aprox. horário da B3). */
  tempo: {
    capturedWeekday: number;
    sessionPhase: "abertura" | "miolo" | "fechamento" | "fechado";
    weekSegment: "inicio" | "meio" | "fim";
  };
  /**
   * Exposições líquidas da carteira no instante (Rodada W). A origem das
   * posições e a qualidade da valoração são parte do dado — "estimada pelo
   * modelo", nunca "exatamente X". Nulo enquanto não há posições registradas.
   */
  portfolio: {
    source: "manual" | null;
    valuationSource: "modelo" | null;
    valuatedAt: string | null;
    netDelta: number | null;
    netTheta: number | null;
    netVega: number | null;
    netRho: number | null;
    marginUtilized: number | null;
    topAssets: string[] | null;
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
    cadeiaEvidencia?: CadeiaEvidencia | null;
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

  const cadeia = input.processo.cadeiaEvidencia ?? null;
  if (cadeia) {
    const validacao = validarCadeiaEvidencia(cadeia);
    if (!validacao.ok) {
      throw new Error(
        `Cadeia de evidência inválida — ${validacao.problemas.map((pr) => pr.motivo).join(" | ")}`,
      );
    }
  }

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
      cadeiaEvidencia: cadeia,
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
          observadoEm: m.observadoEm ?? null,
          fonte: m.fonte ?? null,
          spot: m.spot ?? null,
          ivAtm: m.ivAtm ?? null,
          ivRank: m.ivRank ?? null,
          diCurveState: m.diCurveState ?? null,
          liquidityScore: m.liquidityScore ?? null,
          eventsImminent: m.eventsImminent ?? null,
        }
      : {
          observadoEm: null,
          fonte: null,
          spot: null,
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
          source: p.source ?? null,
          valuationSource: p.valuationSource ?? null,
          valuatedAt: p.valuatedAt ?? null,
          netDelta: p.netDelta ?? null,
          netTheta: p.netTheta ?? null,
          netVega: p.netVega ?? null,
          netRho: p.netRho ?? null,
          marginUtilized: p.marginUtilized ?? null,
          topAssets: p.topAssets ?? null,
        }
      : {
          source: null,
          valuationSource: null,
          valuatedAt: null,
          netDelta: null,
          netTheta: null,
          netVega: null,
          netRho: null,
          marginUtilized: null,
          topAssets: null,
        },
  };
}
