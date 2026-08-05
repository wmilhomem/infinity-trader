import type { DiaryEntry } from "./types";
import { obj, num } from "./decision-memory-reader";

/**
 * DECISION DIFF — quem você era versus quem você é.
 * Compara a primeira metade das decisões com a segunda em eixos de
 * maturidade (tese, disciplina, processo, revisão, consciência, risco).
 * Lucro é consequência: aqui só se compara o modo de decidir.
 */

export type DirecaoDiff = "melhorou" | "piorou" | "estavel" | "sem-dados";

export type EixoDiff = {
  chave: string;
  rotulo: string;
  antes: string;
  agora: string;
  direcao: DirecaoDiff;
  detalhe: string;
};

function metade(entries: DiaryEntry[]) {
  const ordenadas = [...entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const meio = Math.ceil(ordenadas.length / 2);
  return { antes: ordenadas.slice(0, meio), agora: ordenadas.slice(meio) };
}

function pct(arr: DiaryEntry[], f: (e: DiaryEntry) => boolean): number | null {
  if (arr.length === 0) return null;
  return (arr.filter(f).length / arr.length) * 100;
}

function media(arr: DiaryEntry[], f: (e: DiaryEntry) => number | null): number | null {
  const valores = arr.map(f).filter((v): v is number => v !== null);
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function fmtPct(v: number | null, casas = 0) {
  return v === null ? "sem dados" : `${v.toFixed(casas)}%`;
}

function dir(antes: number | null, agora: number | null, sobeBom: boolean): DirecaoDiff {
  if (antes === null || agora === null) return "sem-dados";
  const delta = agora - antes;
  if (Math.abs(delta) < 5) return "estavel";
  return delta > 0 === sobeBom ? "melhorou" : "piorou";
}

export function capitalEmRisco(e: DiaryEntry): number | null {
  const i = obj(e.interpretacao);
  return num(i?.capitalEmRisco);
}

export function compararEvolucao(entries: DiaryEntry[]): EixoDiff[] | null {
  if (entries.length < 4) return null;

  const { antes, agora } = metade(entries);

  const eixos: EixoDiff[] = [];

  {
    const a = pct(antes, (e) => (e.motivo ?? "").trim().length >= 40);
    const b = pct(agora, (e) => (e.motivo ?? "").trim().length >= 40);
    eixos.push({
      chave: "tese",
      rotulo: "Tese escrita",
      antes: fmtPct(a),
      agora: fmtPct(b),
      direcao: dir(a, b, true),
      detalhe:
        "Palpite não precisa de explicação; tese exige. Escrever o porquê antes de clicar é o primeiro salto de maturidade.",
    });
  }

  {
    const a = pct(antes, (e) => e.seguiu_regra === true);
    const b = pct(agora, (e) => e.seguiu_regra === true);
    eixos.push({
      chave: "disciplina",
      rotulo: "Respeito às próprias regras",
      antes: fmtPct(a),
      agora: fmtPct(b),
      direcao: dir(a, b, true),
      detalhe:
        "A porcentagem de decisões em que você fez exatamente o que tinha combinado consigo mesmo.",
    });
  }

  {
    const a = media(antes, (e) => (typeof e.decision_score === "number" ? e.decision_score : null));
    const b = media(agora, (e) => (typeof e.decision_score === "number" ? e.decision_score : null));
    eixos.push({
      chave: "processo",
      rotulo: "Qualidade de processo (score médio)",
      antes: a === null ? "sem dados" : `${a.toFixed(1)}/100`,
      agora: b === null ? "sem dados" : `${b.toFixed(1)}/100`,
      direcao: dir(a, b, true),
      detalhe:
        "O Decision Score mede o processo, não o resultado: simular, escrever tese, checklist completo e risco controlado.",
    });
  }

  {
    const a = pct(antes, (e) => e.status === "encerrada");
    const b = pct(agora, (e) => e.status === "encerrada");
    eixos.push({
      chave: "revisao",
      rotulo: "Fechamento de operações",
      antes: fmtPct(a),
      agora: fmtPct(b),
      direcao: dir(a, b, true),
      detalhe:
        "Encerrar é aceitar o resultado. Quem não encerra, não aprende — só acumula posições sem sentença.",
    });
  }

  {
    const a = pct(antes, (e) => !!e.emocao);
    const b = pct(agora, (e) => !!e.emocao);
    eixos.push({
      chave: "consciencia",
      rotulo: "Consciência emocional",
      antes: fmtPct(a),
      agora: fmtPct(b),
      direcao: dir(a, b, true),
      detalhe:
        "Registrar o estado em que você decide é o primeiro passo para não ser dominado por ele.",
    });
  }

  {
    const a = pct(antes, (e) => e.status === "encerrada" && !!e.licao_aprendida);
    const b = pct(agora, (e) => e.status === "encerrada" && !!e.licao_aprendida);
    eixos.push({
      chave: "aprendizado",
      rotulo: "Lições extraídas",
      antes: fmtPct(a),
      agora: fmtPct(b),
      direcao: dir(a, b, true),
      detalhe:
        "Errar não é o problema. Repetir o erro sem anotar a lição é o que custa caro ao longo do tempo.",
    });
  }

  {
    const a = media(antes, capitalEmRisco);
    const b = media(agora, capitalEmRisco);
    eixos.push({
      chave: "risco",
      rotulo: "Tamanho da posição (capital em risco)",
      antes: a === null ? "sem dados" : `R$ ${a.toFixed(2)}`,
      agora: b === null ? "sem dados" : `R$ ${b.toFixed(2)}`,
      direcao: dir(a, b, false),
      detalhe:
        "Reduzir o tamanho por decisão enquanto o processo amadurece não é medo — é gestão. Crescer vem depois.",
    });
  }

  return eixos;
}
