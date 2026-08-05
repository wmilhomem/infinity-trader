import type { DiaryEntry } from "./types";
import { capitalEmRisco } from "./decision-diff";

/**
 * EVOLUTION SCORE — maior que o DQS: mede a evolução da decisão.
 * Não compete com outros usuários: compete com o seu eu de meses atrás.
 * Componentes ponderados (disciplina, consistência, tese, revisão,
 * aprendizado, consciência, estabilidade de risco) + série mensal.
 */

export type CompEvolution = {
  chave: string;
  rotulo: string;
  valor: number | null;
  max: number;
  pct: number | null;
  descricao: string;
};

export type SerieEvolution = {
  chave: string;
  rotulo: string;
  score: number | null;
  decisoes: number;
};

export type EvolutionScoreResult = {
  atual: number | null;
  componentes: CompEvolution[];
  serie: SerieEvolution[];
  leitura: string;
};

function pct(arr: DiaryEntry[], f: (e: DiaryEntry) => boolean): number | null {
  if (arr.length === 0) return null;
  return (arr.filter(f).length / arr.length) * 100;
}

function checklistCompleto(e: DiaryEntry): boolean {
  const c = e.checklist;
  if (!c || typeof c !== "object" || Array.isArray(c)) return false;
  const vals = Object.values(c as Record<string, unknown>).filter((v) => typeof v === "boolean");
  return vals.length > 0 && vals.every((v) => v === true);
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function calcularEvolutionScore(entries: DiaryEntry[]): EvolutionScoreResult {
  const componentes: CompEvolution[] = [];

  const disc = pct(entries, (e) => e.seguiu_regra === true);
  componentes.push({
    chave: "disciplina",
    rotulo: "Disciplina",
    valor: disc,
    max: 20,
    pct: disc,
    descricao: "Decisões que respeitaram suas próprias regras.",
  });

  const consist = pct(entries, checklistCompleto);
  componentes.push({
    chave: "consistencia",
    rotulo: "Consistência de processo",
    valor: consist,
    max: 15,
    pct: consist,
    descricao: "Checklist completo no momento da decisão — o processo se repete.",
  });

  const tese = pct(entries, (e) => (e.motivo ?? "").trim().length >= 40);
  componentes.push({
    chave: "tese",
    rotulo: "Qualidade das teses",
    valor: tese,
    max: 15,
    pct: tese,
    descricao: "Teses escritas com substância (40+ caracteres), não palpites.",
  });

  const revisao = pct(entries, (e) => e.status === "encerrada");
  componentes.push({
    chave: "revisao",
    rotulo: "Capacidade de revisão",
    valor: revisao,
    max: 15,
    pct: revisao,
    descricao: "Operações encerradas — aceitar o resultado para poder aprender.",
  });

  const aprendizado = pct(entries, (e) => e.status === "encerrada" && !!e.licao_aprendida);
  componentes.push({
    chave: "aprendizado",
    rotulo: "Aprendizado registrado",
    valor: aprendizado,
    max: 10,
    pct: aprendizado,
    descricao: "Lições extraídas das operações encerradas.",
  });

  const consciencia = pct(entries, (e) => !!e.emocao);
  componentes.push({
    chave: "consciencia",
    rotulo: "Consciência emocional",
    valor: consciencia,
    max: 10,
    pct: consciencia,
    descricao: "Estados emocionais registrados — quem nomeia a emoção a controla.",
  });

  const tamanhos = entries.map(capitalEmRisco).filter((v): v is number => v !== null);
  let estabilidade: number | null = null;
  if (tamanhos.length >= 3) {
    const media = tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length;
    const desvio = Math.sqrt(tamanhos.reduce((a, b) => a + (b - media) ** 2, 0) / tamanhos.length);
    const cv = media === 0 ? 1 : desvio / media;
    estabilidade = Math.max(0, Math.min(100, 100 - cv * 100));
  }
  componentes.push({
    chave: "risco",
    rotulo: "Estabilidade de risco",
    valor: estabilidade,
    max: 15,
    pct: estabilidade,
    descricao: "O tamanho das posições varia pouco — risco estável é decisão calma.",
  });

  const pesoUtilizado = componentes.filter((c) => c.pct !== null).reduce((a, c) => a + c.max, 0);
  const pontos = componentes
    .filter((c) => c.pct !== null)
    .reduce((a, c) => a + (c.pct! / 100) * c.max, 0);
  const atual = pesoUtilizado === 0 ? null : Math.round((pontos / pesoUtilizado) * 100);

  // Série mensal: componentes computáveis por mês.
  const porMes = new Map<string, DiaryEntry[]>();
  for (const e of entries) {
    const d = new Date(e.created_at);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    porMes.set(chave, [...(porMes.get(chave) ?? []), e]);
  }
  const serie: SerieEvolution[] = [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, arr]) => {
      const meses = (s: string) => {
        const [y, m] = s.split("-");
        return `${MESES[+m - 1]}/${y.slice(2)}`;
      };
      const pesos: [number | null, number][] = [
        [pct(arr, (e) => e.seguiu_regra === true), 20],
        [pct(arr, checklistCompleto), 15],
        [pct(arr, (e) => (e.motivo ?? "").trim().length >= 40), 15],
        [pct(arr, (e) => e.status === "encerrada"), 15],
        [pct(arr, (e) => !!e.emocao), 10],
      ];
      const usados = pesos.filter(([v]) => v !== null);
      const score =
        usados.length === 0
          ? null
          : Math.round(
              (usados.reduce((a, [v, w]) => a + (v! / 100) * w, 0) /
                usados.reduce((a, [, w]) => a + w, 0)) *
                100,
            );
      return { chave, rotulo: meses(chave), score, decisoes: arr.length };
    });

  const leitura =
    atual === null
      ? "Registre suas primeiras decisões para que o Evolution Score comece a existir."
      : atual >= 80
        ? "Processo maduro: você já decide como um investidor profissional decide — com processo, regras e revisão."
        : atual >= 60
          ? "Em consolidação: a base existe e o processo está virando hábito. O próximo salto vem da revisão."
          : atual >= 40
            ? "Processo começando: os alicerces estão aparecendo. Consistência agora vale mais que resultado."
            : "Poucos dados ainda: cada decisão registrada é um ponto a mais neste número.";

  return { atual, componentes, serie, leitura };
}
