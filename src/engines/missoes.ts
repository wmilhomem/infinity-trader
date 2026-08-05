import type { DiaryEntry } from "./types";
import { getLesson } from "@/lib/lessons";

/**
 * MISSÕES — a Academy que nasce dos seus erros.
 * Quando uma operação encerra com prejuízo, o sistema identifica a lição
 * que explica aquele erro específico e entrega como missão personalizada.
 * A trilha deixa de ser linear: passa a ser guiada pelo seu histórico.
 */

export type Missao = {
  slug: string;
  titulo: string;
  duracao: string;
  motivo: string;
};

function slugDaEstrategia(nome: string | null, licaoAprendida: string | null): string | null {
  const n = (nome ?? "").toLowerCase();
  const l = (licaoAprendida ?? "").toLowerCase();

  if (
    n.includes("compra de call") ||
    n.includes("compra de put") ||
    n.includes("call sozinha") ||
    n.includes("put sozinha")
  )
    return "compra-a-seco";
  if (
    n.includes("venda de call") ||
    n.includes("venda de put") ||
    n.includes("coberta") ||
    n.includes("covered")
  )
    return "venda-coberta";
  if (n.includes("trava de alta")) return "trava-de-alta";
  if (n.includes("trava de baixa")) return "trava-de-baixa";
  if (n.includes("roll") || n.includes("rolag")) return "rolagem-defensiva";
  if (
    n.includes("iron condor") ||
    n.includes("borboleta") ||
    n.includes("straddle") ||
    n.includes("strangle")
  )
    return "theta-e-tempo";
  if (l.includes("theta") || l.includes("tempo") || l.includes("vencimento"))
    return "theta-e-tempo";
  if (l.includes("tamanho") || l.includes("posição") || l.includes("lote"))
    return "gestao-de-risco-travas";
  return null;
}

/**
 * Recomenda a próxima missão a partir do erro mais recente.
 * Retorna null quando não há erro registrado, quando a lição já foi
 * concluída ou quando nenhuma lição explica aquele erro específico.
 */
export function recomendarMissao(entries: DiaryEntry[], doneSlugs: Set<string>): Missao | null {
  const encerradas = entries
    .filter((e) => e.status === "encerrada" && e.resultado !== null && Number(e.resultado) < 0)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (encerradas.length === 0) return null;

  const erro = encerradas[0];
  const nome = (() => {
    const i = erro.interpretacao;
    return i && typeof i === "object" && typeof (i as Record<string, unknown>).nome === "string"
      ? ((i as Record<string, unknown>).nome as string)
      : erro.estrutura;
  })();
  const slug = slugDaEstrategia(nome, erro.licao_aprendida ?? null);
  if (!slug || doneSlugs.has(slug)) return null;

  const lição = getLesson(slug);
  if (!lição) return null;

  return {
    slug,
    titulo: lição.titulo.replace(/^Lição \d+ — /, ""),
    duracao: "6 minutos",
    motivo: `Sua última operação em ${erro.ativo} (${nome}) terminou no prejuízo. Esta lição explica exatamente o que aconteceu — e como evitar que se repita.`,
  };
}
