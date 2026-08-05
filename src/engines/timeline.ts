import type { DiaryEntry } from "./types";

/**
 * DECISION TIMELINE — o verdadeiro ativo do projeto.
 * Agrega o histórico de decisões por mês e compara o investidor de
 * "antes" com o de "agora": tese escrita, regra seguida, simulação,
 * fechamento de ciclo e dimensionamento. Nenhuma corretora entrega isso
 * porque nenhuma corretora registra o processo — só o resultado.
 */

export type MesTimeline = {
  chave: string; // "2026-01"
  rotulo: string; // "Janeiro"
  decisoes: number;
  encerradas: number;
  disciplina: number | null; // % seguiu a regra
  resultado: number; // soma R$ das encerradas
  scoreMedio: number | null;
  pctTese: number | null;
};

export type Habito = {
  chave: string;
  rotulo: string;
  antes: string;
  agora: string;
  mudou: boolean;
  descricao: string;
};

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const pct = (num: number, den: number) => (den ? Math.round((num / den) * 100) : 0);

function tamanhoPosicao(e: DiaryEntry): number | null {
  const i = e.interpretacao;
  if (!i || typeof i !== "object") return null;
  const r = i as Record<string, unknown>;
  const v =
    typeof r.capitalEmRisco === "number"
      ? r.capitalEmRisco
      : typeof r.capitalComprometido === "number"
        ? r.capitalComprometido
        : null;
  return v !== null && Number.isFinite(v) && v > 0 ? v : null;
}

export function linhaDoTempo(entries: DiaryEntry[]): MesTimeline[] {
  const porMes = new Map<string, DiaryEntry[]>();
  for (const e of entries) {
    const chave = e.created_at.slice(0, 7);
    porMes.set(chave, [...(porMes.get(chave) ?? []), e]);
  }
  return [...porMes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([chave, lista]) => {
      const encerradas = lista.filter((e) => e.status === "encerrada" && e.resultado !== null);
      const comRegra = lista.filter((e) => e.seguiu_regra !== null);
      const comTese = lista.filter((e) => (e.motivo ?? "").trim().length >= 40);
      const scores = lista
        .map((e) => e.decision_score)
        .filter((s): s is number => typeof s === "number");
      return {
        chave,
        rotulo: MESES[Number(chave.slice(5, 7)) - 1] ?? chave,
        decisoes: lista.length,
        encerradas: encerradas.length,
        disciplina: comRegra.length
          ? pct(comRegra.filter((e) => e.seguiu_regra).length, comRegra.length)
          : null,
        resultado: encerradas.reduce((s, e) => s + Number(e.resultado ?? 0), 0),
        scoreMedio: scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : null,
        pctTese: lista.length ? pct(comTese.length, lista.length) : null,
      };
    });
}

/**
 * Compara a primeira metade do histórico com a segunda e diz em que
 * o investidor mudou. Exige no mínimo 4 decisões para ter o que medir.
 */
export function evolucaoInvestidor(entries: DiaryEntry[]): Habito[] {
  const ordenadas = [...entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (ordenadas.length < 4) return [];

  const metade = Math.floor(ordenadas.length / 2);
  const antes = ordenadas.slice(0, metade);
  const agora = ordenadas.slice(metade);

  const fmt = (n: number) => `${n}%`;
  const rl = (n: number) => `R$ ${n.toFixed(0)}`;

  const habito = (
    chave: string,
    rotulo: string,
    valorAntes: number | null,
    valorAgora: number | null,
    bomSeCrescer: boolean,
    descricao: string,
  ): Habito => {
    if (valorAntes === null || valorAgora === null)
      return { chave, rotulo, antes: "—", agora: "—", mudou: false, descricao };
    const mudou = bomSeCrescer ? valorAgora > valorAntes + 4 : valorAgora < valorAntes - 4;
    return {
      chave,
      rotulo,
      antes: fmt(valorAntes),
      agora: fmt(valorAgora),
      mudou,
      descricao,
    };
  };

  const tese = habito(
    "tese",
    "Escreve a tese antes de decidir",
    pct(antes.filter((e) => (e.motivo ?? "").trim().length >= 40).length, antes.length),
    pct(agora.filter((e) => (e.motivo ?? "").trim().length >= 40).length, agora.length),
    true,
    "Decisão com tese é hipótese; sem tese é impulso.",
  );

  const comRegraAntes = antes.filter((e) => e.seguiu_regra !== null);
  const comRegraAgora = agora.filter((e) => e.seguiu_regra !== null);
  const regra = habito(
    "regra",
    "Segue a própria regra",
    comRegraAntes.length
      ? pct(comRegraAntes.filter((e) => e.seguiu_regra).length, comRegraAntes.length)
      : null,
    comRegraAgora.length
      ? pct(comRegraAgora.filter((e) => e.seguiu_regra).length, comRegraAgora.length)
      : null,
    true,
    "Disciplina é o único fator que você controla de verdade.",
  );

  const simulou = habito(
    "simulou",
    "Simula antes de decidir",
    pct(antes.filter((e) => e.simulation_id).length, antes.length),
    pct(agora.filter((e) => e.simulation_id).length, agora.length),
    true,
    "Ver o prejuízo máximo antes do mercado te mostrar.",
  );

  const fechou = habito(
    "fechou",
    "Fecha o ciclo com resultado",
    pct(antes.filter((e) => e.status === "encerrada" && e.resultado !== null).length, antes.length),
    pct(agora.filter((e) => e.status === "encerrada" && e.resultado !== null).length, agora.length),
    true,
    "Operação sem fechamento não ensina nada.",
  );

  const tamanhosAntes = antes.map(tamanhoPosicao).filter((v): v is number => v !== null);
  const tamanhosAgora = agora.map(tamanhoPosicao).filter((v): v is number => v !== null);
  const operarMenor: Habito =
    tamanhosAntes.length && tamanhosAgora.length
      ? (() => {
          const m1 = tamanhosAntes.reduce((s, v) => s + v, 0) / tamanhosAntes.length;
          const m2 = tamanhosAgora.reduce((s, v) => s + v, 0) / tamanhosAgora.length;
          const mudou = m2 < m1 - m1 * 0.05;
          return {
            chave: "tamanho",
            rotulo: "Mantém o tamanho sob controle",
            antes: rl(m1),
            agora: rl(m2),
            mudou,
            descricao: mudou
              ? "Você passou a arriscar menos por operação — a base do sobreviver ao tempo."
              : "O tamanho médio por operação subiu ou ficou estável. Confira se o processo acompanhou.",
          };
        })()
      : {
          chave: "tamanho",
          rotulo: "Mantém o tamanho sob controle",
          antes: "—",
          agora: "—",
          mudou: false,
          descricao: "Dimensione suas operações pelo simulador para medir este hábito.",
        };

  return [tese, regra, simulou, fechou, operarMenor];
}
