import type { DiaryEntry } from "./types";

export type Padrao = { key: string; titulo: string; descricao: string; severidade: "info" | "alerta" };

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

/** Behavior Engine — padrões reais extraídos do histórico. Nada é inventado. */
export function detectarPadroes(entries: DiaryEntry[]): Padrao[] {
  const out: Padrao[] = [];
  const fechadas = entries.filter((e) => e.status === "encerrada" && e.resultado !== null);
  if (entries.length < 3) return out;

  const seguiu = fechadas.filter((e) => e.seguiu_regra === true);
  const furou = fechadas.filter((e) => e.seguiu_regra === false);
  if (furou.length >= 2 && seguiu.length >= 2) {
    const mS = avg(seguiu.map((e) => Number(e.resultado)));
    const mF = avg(furou.map((e) => Number(e.resultado)));
    out.push({
      key: "regra-vs-resultado",
      titulo: `Você ignorou a própria regra ${furou.length} vezes`,
      descricao: `Quando respeitou a regra, o resultado médio foi R$ ${mS.toFixed(2)}. Quando furou, foi R$ ${mF.toFixed(2)}.`,
      severidade: mF < mS ? "alerta" : "info",
    });
  }

  const porEstrutura = new Map<string, number[]>();
  for (const e of fechadas) {
    const k = (e.estrutura || "outra").split(" ")[0].toLowerCase();
    porEstrutura.set(k, [...(porEstrutura.get(k) ?? []), Number(e.resultado)]);
  }
  const grupos = [...porEstrutura.entries()].filter(([, v]) => v.length >= 2);
  if (grupos.length >= 2) {
    const ord = grupos.sort((a, b) => avg(b[1]) - avg(a[1]));
    out.push({
      key: "melhor-estrutura",
      titulo: `Você opera melhor "${ord[0][0]}" do que "${ord[ord.length - 1][0]}"`,
      descricao: `Média de R$ ${avg(ord[0][1]).toFixed(2)} contra R$ ${avg(ord[ord.length - 1][1]).toFixed(2)}, com base nas suas operações encerradas.`,
      severidade: "info",
    });
  }

  const porDia = new Map<number, number[]>();
  for (const e of fechadas) {
    const d = new Date(e.created_at).getDay();
    porDia.set(d, [...(porDia.get(d) ?? []), Number(e.resultado)]);
  }
  const dias = [...porDia.entries()].filter(([, v]) => v.length >= 2).sort((a, b) => avg(a[1]) - avg(b[1]));
  if (dias.length >= 2 && avg(dias[0][1]) < 0) {
    out.push({
      key: "pior-dia",
      titulo: `Seu maior erro acontece nas ${DIAS[dias[0][0]]}s-feiras`.replace("sábados-feiras", "sábados"),
      descricao: `Nesse dia da semana seu resultado médio é R$ ${avg(dias[0][1]).toFixed(2)}, o pior entre os dias em que você registra decisões.`,
      severidade: "alerta",
    });
  }

  const semTese = entries.filter((e) => !e.motivo || e.motivo.trim().length < 20);
  if (semTese.length >= 3) {
    out.push({
      key: "sem-tese",
      titulo: `${semTese.length} decisões registradas sem tese clara`,
      descricao: "Sem hipótese escrita não dá para saber depois se você errou a leitura ou a execução.",
      severidade: "alerta",
    });
  }

  return out;
}
