import type { DiaryEntry } from "./types";

export type Padrao = {
  key: string;
  titulo: string;
  descricao: string;
  severidade: "info" | "alerta";
};

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

/** Tamanho da posição registrado no instante da decisão (interpretacao JSON). */
function tamanhoPosicao(e: DiaryEntry): number | null {
  const i = e.interpretacao;
  if (!i || typeof i !== "object") return null;
  const r = i as Record<string, unknown>;
  const capitalEmRisco = typeof r.capitalEmRisco === "number" ? r.capitalEmRisco : null;
  const capitalComprometido =
    typeof r.capitalComprometido === "number" ? r.capitalComprometido : null;
  const v = capitalEmRisco ?? capitalComprometido;
  return v !== null && Number.isFinite(v) && v > 0 ? v : null;
}

/**
 * Behavior Engine — camada preditiva sobre o histórico.
 * Detecta padrões temporais e de dimensionamento que o olho humano
 * não enxerga: em que dia o tamanho cresce, quando ele cresce em série.
 * Os dados vêm do que foi registrado — nada aqui é inventado.
 */
export function detectarPadroesTemporais(entries: DiaryEntry[]): Padrao[] {
  const out: Padrao[] = [];
  const fechadas = entries.filter((e) => e.status === "encerrada" && e.resultado !== null);
  if (entries.length < 3) return out;

  // Padrão A: dia da semana em que o tamanho da posição cresce (e costuma doer).
  const comTamanho = entries
    .map((e) => ({ e, t: tamanhoPosicao(e) }))
    .filter((x): x is { e: DiaryEntry; t: number } => x.t !== null);
  if (comTamanho.length >= 3) {
    const mediaGeral = avg(comTamanho.map((x) => x.t));
    const porDia = new Map<number, { tamanhos: number[]; resultados: number[] }>();
    for (const { e, t } of comTamanho) {
      const d = new Date(e.created_at).getDay();
      const grupo = porDia.get(d) ?? { tamanhos: [], resultados: [] };
      grupo.tamanhos.push(t);
      if (e.resultado !== null) grupo.resultados.push(Number(e.resultado));
      porDia.set(d, grupo);
    }
    const suspeitos = [...porDia.entries()]
      .filter(([, g]) => g.tamanhos.length >= 2 && g.resultados.length >= 2)
      .map(([d, g]) => ({ d, media: avg(g.tamanhos), resultado: avg(g.resultados) }))
      .filter((s) => s.media > mediaGeral * 1.25)
      .sort((a, b) => b.media - a.media);
    if (suspeitos.length > 0) {
      const pior = suspeitos.find((s) => s.resultado < 0) ?? suspeitos[0];
      const dias = suspeitos.map((s) => DIAS[s.d]).join(" e ");
      out.push({
        key: "tamanho-por-dia",
        titulo: `Você aumenta o tamanho da posição nas ${dias}`,
        descricao:
          pior.resultado < 0
            ? `Nesse dia o tamanho médio sobe para R$ ${pior.media.toFixed(2)} (acima da sua média de R$ ${mediaGeral.toFixed(2)}) — e o resultado médio fica em R$ ${pior.resultado.toFixed(2)}. Sinal clássico de tamanho empolgado.`
            : `Nesse dia o tamanho médio chega a R$ ${pior.media.toFixed(2)} contra R$ ${mediaGeral.toFixed(2)} no geral. Mantenha o tamanho estável: é o que separa planejamento de empolgação.`,
        severidade: pior.resultado < 0 ? "alerta" : "info",
      });
    }
  }

  // Padrão B: escalada no tempo — o tamanho cresce nas operações recentes.
  const ordenadas = [...comTamanho].sort((a, b) => a.e.created_at.localeCompare(b.e.created_at));
  if (ordenadas.length >= 6) {
    const metade = Math.floor(ordenadas.length / 2);
    const primeiras = ordenadas.slice(0, metade);
    const ultimas = ordenadas.slice(metade);
    const m1 = avg(primeiras.map((x) => x.t));
    const m2 = avg(ultimas.map((x) => x.t));
    if (m2 > m1 * 1.3) {
      const resultados2 = avg(
        ultimas
          .map((x) => (x.e.resultado !== null ? Number(x.e.resultado) : null))
          .filter((v): v is number => v !== null),
      );
      out.push({
        key: "escalada-de-tamanho",
        titulo: "Suas posições estão crescendo sem você perceber",
        descricao:
          `O tamanho médio subiu de R$ ${m1.toFixed(2)} para R$ ${m2.toFixed(2)} nas últimas operações. ` +
          (resultados2 < 0
            ? "E o resultado recente médio é negativo (R$ " +
              resultados2.toFixed(2) +
              "). Tamanho maior com resultado pior é a receita clássica da perda acelerada."
            : "Isso pode ser intencional — mas só pode crescer se o processo (tese, regra, checklist) estiver sendo cumprido em todas elas."),
        severidade: resultados2 < 0 ? "alerta" : "info",
      });
    }
  }

  return out;
}

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
  const dias = [...porDia.entries()]
    .filter(([, v]) => v.length >= 2)
    .sort((a, b) => avg(a[1]) - avg(b[1]));
  if (dias.length >= 2 && avg(dias[0][1]) < 0) {
    out.push({
      key: "pior-dia",
      titulo: `Seu maior erro acontece nas ${DIAS[dias[0][0]]}s-feiras`.replace(
        "sábados-feiras",
        "sábados",
      ),
      descricao: `Nesse dia da semana seu resultado médio é R$ ${avg(dias[0][1]).toFixed(2)}, o pior entre os dias em que você registra decisões.`,
      severidade: "alerta",
    });
  }

  const semTese = entries.filter((e) => !e.motivo || e.motivo.trim().length < 20);
  if (semTese.length >= 3) {
    out.push({
      key: "sem-tese",
      titulo: `${semTese.length} decisões registradas sem tese clara`,
      descricao:
        "Sem hipótese escrita não dá para saber depois se você errou a leitura ou a execução.",
      severidade: "alerta",
    });
  }

  return out;
}
