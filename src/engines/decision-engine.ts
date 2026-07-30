import type { Interpretacao } from "./simulation-interpreter";
import type { Alerta } from "./rule-engine";
import type { DiaryEntry } from "./types";

export type ScoreItem = { chave: string; label: string; pontos: number; max: number; ok: boolean };
export type DecisionScore = { score: number; itens: ScoreItem[]; leitura: string };

export type ScoreInput = {
  simulou: boolean;
  tese: string;
  checklist: Record<string, boolean>;
  alertas: Alerta[];
  interpretacao?: Interpretacao | null;
  disciplinaHistorica: number; // 0-100
};

/**
 * Decision Engine — nota de PROCESSO de 0 a 100.
 * Lucro nunca entra na conta.
 */
export function calcularDecisionScore(input: ScoreInput): DecisionScore {
  const teseOk = input.tese.trim().length >= 40;
  const checkKeys = Object.keys(input.checklist);
  const checkOk = checkKeys.length > 0 && checkKeys.every((k) => input.checklist[k]);
  const riscoConhecido =
    !!input.interpretacao && input.interpretacao.perdaLimitada && input.interpretacao.capitalEmRisco > 0;
  const criticos = input.alertas.filter((a) => a.severidade === "critico").length;
  const regrasOk = input.alertas.length === 0;

  const itens: ScoreItem[] = [
    { chave: "simulou", label: "Simulou antes de decidir", max: 20, pontos: input.simulou ? 20 : 0, ok: input.simulou },
    { chave: "tese", label: "Escreveu a tese com clareza", max: 20, pontos: teseOk ? 20 : input.tese.trim() ? 8 : 0, ok: teseOk },
    {
      chave: "regras",
      label: "A operação respeita suas regras",
      max: 20,
      pontos: regrasOk ? 20 : Math.max(0, 12 - criticos * 6),
      ok: regrasOk,
    },
    { chave: "checklist", label: "Respondeu o checklist de decisão", max: 15, pontos: checkOk ? 15 : 0, ok: checkOk },
    {
      chave: "risco",
      label: "Risco máximo conhecido e limitado",
      max: 15,
      pontos: riscoConhecido ? 15 : input.interpretacao ? 6 : 0,
      ok: riscoConhecido,
    },
    {
      chave: "disciplina",
      label: "Disciplina no histórico recente",
      max: 10,
      pontos: Math.round((Math.min(100, Math.max(0, input.disciplinaHistorica)) / 100) * 10),
      ok: input.disciplinaHistorica >= 70,
    },
  ];

  const score = Math.min(100, itens.reduce((s, i) => s + i.pontos, 0));
  const leitura =
    score >= 85
      ? "Decisão madura: você sabe o que está fazendo e por quê."
      : score >= 65
        ? "Decisão razoável, mas ainda há pontas soltas no seu processo."
        : score >= 40
          ? "Processo incompleto. Volte um passo antes de assumir esse risco."
          : "Isto ainda é um impulso, não uma decisão.";

  return { score, itens, leitura };
}

/** Disciplina histórica: % de operações em que o usuário seguiu a própria regra. */
export function disciplina(entries: DiaryEntry[]): number {
  const comRegra = entries.filter((e) => e.seguiu_regra !== null);
  if (!comRegra.length) return 0;
  return (comRegra.filter((e) => e.seguiu_regra).length / comRegra.length) * 100;
}
