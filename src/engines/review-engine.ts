import type { DiaryEntry } from "./types";
import { detectarPadroes, type Padrao } from "./behavior-engine";

export type Periodo = "semana" | "mes";

export type MetricasPeriodo = {
  decisoes: number;
  encerradas: number;
  comTese: number;
  pctTese: number;
  scoreMedio: number;
  disciplina: number;
  resultado: number;
  winrate: number;
  checklistCompleto: number;
};

export type Delta = { label: string; atual: number; anterior: number; diff: number; unidade: "%" | "pt" | "R$" | "" };

export type Review = {
  periodo: Periodo;
  inicio: string; // ISO date (yyyy-mm-dd)
  fim: string;
  metricas: MetricasPeriodo;
  anterior: MetricasPeriodo;
  deltas: Delta[];
  narrativa: string;
  licoes: string[];
  padroes: Padrao[];
  foco: string;
};

const d0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const iso = (d: Date) => d0(d).toISOString().slice(0, 10);
const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const brl = (v: number) => `R$ ${v.toFixed(2)}`;

/** Início do período atual: segunda-feira da semana, ou dia 1 do mês. */
export function inicioPeriodo(periodo: Periodo, ref = new Date()): Date {
  if (periodo === "mes") return new Date(ref.getFullYear(), ref.getMonth(), 1);
  const day = ref.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const d = d0(ref);
  d.setDate(d.getDate() - diff);
  return d;
}

function anteriorPeriodo(periodo: Periodo, inicio: Date): { de: Date; ate: Date } {
  if (periodo === "mes") {
    const de = new Date(inicio.getFullYear(), inicio.getMonth() - 1, 1);
    return { de, ate: inicio };
  }
  const de = new Date(inicio);
  de.setDate(de.getDate() - 7);
  return { de, ate: inicio };
}

function metricas(entries: DiaryEntry[]): MetricasPeriodo {
  const encerradas = entries.filter((e) => e.status === "encerrada" && e.resultado !== null);
  const comRegra = entries.filter((e) => e.seguiu_regra !== null);
  const comTese = entries.filter((e) => (e.motivo ?? "").trim().length >= 40);
  const scores = entries.map((e) => e.decision_score).filter((s): s is number => typeof s === "number");
  const comChecklist = entries.filter((e) => {
    const c = e.checklist;
    if (!c || typeof c !== "object") return false;
    const vals = Object.values(c as Record<string, unknown>);
    return vals.length > 0 && vals.every(Boolean);
  });
  return {
    decisoes: entries.length,
    encerradas: encerradas.length,
    comTese: comTese.length,
    pctTese: entries.length ? (comTese.length / entries.length) * 100 : 0,
    scoreMedio: avg(scores),
    disciplina: comRegra.length ? (comRegra.filter((e) => e.seguiu_regra).length / comRegra.length) * 100 : 0,
    resultado: encerradas.reduce((s, e) => s + Number(e.resultado ?? 0), 0),
    winrate: encerradas.length
      ? (encerradas.filter((e) => Number(e.resultado ?? 0) > 0).length / encerradas.length) * 100
      : 0,
    checklistCompleto: entries.length ? (comChecklist.length / entries.length) * 100 : 0,
  };
}

/**
 * Review Engine — transforma o histórico bruto em leitura de período:
 * métricas, evolução contra o período anterior, narrativa, lições e foco.
 */
export function gerarReview(entries: DiaryEntry[], periodo: Periodo, ref = new Date()): Review {
  const inicio = inicioPeriodo(periodo, ref);
  const fim = d0(ref);
  const ant = anteriorPeriodo(periodo, inicio);

  const noIntervalo = (de: Date, ate: Date) =>
    entries.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= de.getTime() && t < ate.getTime() + 86_400_000;
    });

  const atuais = noIntervalo(inicio, fim);
  const anteriores = entries.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t >= ant.de.getTime() && t < ant.ate.getTime();
  });

  const m = metricas(atuais);
  const a = metricas(anteriores);

  const deltas: Delta[] = [
    { label: "Disciplina", atual: m.disciplina, anterior: a.disciplina, diff: m.disciplina - a.disciplina, unidade: "%" },
    { label: "Decision Score médio", atual: m.scoreMedio, anterior: a.scoreMedio, diff: m.scoreMedio - a.scoreMedio, unidade: "pt" },
    { label: "Decisões com tese", atual: m.pctTese, anterior: a.pctTese, diff: m.pctTese - a.pctTese, unidade: "%" },
    { label: "Checklist completo", atual: m.checklistCompleto, anterior: a.checklistCompleto, diff: m.checklistCompleto - a.checklistCompleto, unidade: "%" },
    { label: "Decisões registradas", atual: m.decisoes, anterior: a.decisoes, diff: m.decisoes - a.decisoes, unidade: "" },
  ];

  const nome = periodo === "semana" ? "semana" : "mês";
  const partes: string[] = [];

  if (m.decisoes === 0) {
    partes.push(
      `Você não registrou nenhuma decisão nesta ${nome}. Sem registro não existe revisão: o histórico é a única memória confiável do seu processo.`,
    );
  } else {
    partes.push(
      `Nesta ${nome} você registrou ${m.decisoes} ${m.decisoes === 1 ? "decisão" : "decisões"}, sendo ${m.encerradas} já encerrada${m.encerradas === 1 ? "" : "s"}.`,
    );
    partes.push(
      m.scoreMedio >= 70
        ? `Seu Decision Score médio foi ${m.scoreMedio.toFixed(0)} — o processo esteve consistente.`
        : m.scoreMedio > 0
          ? `Seu Decision Score médio foi ${m.scoreMedio.toFixed(0)}: ainda há etapas do processo sendo puladas antes de decidir.`
          : `Nenhuma decisão desta ${nome} passou pelo cálculo de Decision Score.`,
    );
    if (a.decisoes > 0) {
      const dd = m.disciplina - a.disciplina;
      partes.push(
        Math.abs(dd) < 5
          ? `Sua disciplina ficou estável em ${m.disciplina.toFixed(0)}% contra o período anterior.`
          : dd > 0
            ? `Sua disciplina subiu de ${a.disciplina.toFixed(0)}% para ${m.disciplina.toFixed(0)}% — você está respeitando mais as próprias regras.`
            : `Sua disciplina caiu de ${a.disciplina.toFixed(0)}% para ${m.disciplina.toFixed(0)}%. É o sinal mais importante deste período.`,
      );
    }
    if (m.encerradas > 0) {
      partes.push(
        `O resultado financeiro somado foi ${brl(m.resultado)} com ${m.winrate.toFixed(0)}% de acerto — mas ele é consequência, não a nota do período.`,
      );
    }
  }

  const licoes: string[] = [];
  if (m.pctTese < 70 && m.decisoes > 0)
    licoes.push("Escrever a tese antes de entrar é o que separa decisão de impulso. Você deixou de escrever em parte das operações.");
  if (m.checklistCompleto < 60 && m.decisoes > 0)
    licoes.push("O checklist existe para pegar o que a empolgação esconde. Complete-o mesmo quando a operação parecer óbvia.");
  if (m.disciplina < 70 && m.decisoes > 0)
    licoes.push("Furar a própria regra com frequência significa que a regra está errada ou que você não confia nela. Reescreva ou respeite.");
  if (m.decisoes > 0 && m.encerradas === 0)
    licoes.push("Nenhuma operação foi encerrada com resultado. Fechar o ciclo é o que gera aprendizado real.");
  if (m.scoreMedio >= 80 && m.disciplina >= 80)
    licoes.push("Processo maduro nesta janela: mantenha o mesmo ritual mesmo depois de um prejuízo.");

  const foco =
    m.decisoes === 0
      ? `Registre ao menos uma decisão na próxima ${nome}, mesmo que simulada.`
      : m.disciplina < 70
        ? "Foco: seguir a própria regra em 100% das próximas decisões."
        : m.pctTese < 70
          ? "Foco: escrever uma tese com pelo menos duas frases em toda decisão."
          : m.checklistCompleto < 60
            ? "Foco: completar o checklist antes de registrar."
            : "Foco: manter o padrão e encerrar as operações abertas com lição escrita.";

  return {
    periodo,
    inicio: iso(inicio),
    fim: iso(fim),
    metricas: m,
    anterior: a,
    deltas,
    narrativa: partes.join(" "),
    licoes,
    padroes: detectarPadroes(atuais.length >= 3 ? atuais : entries),
    foco,
  };
}
