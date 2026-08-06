import type { DiaryEntry } from "./types";
import { evolucaoInvestidor } from "./timeline";

/**
 * HISTÓRIA — os marcos da evolução do investidor.
 * A Timeline não é uma tabela: é a história de quem decidiu virar
 * sistemático. Cada marco é observável (registrado pelo usuário) e
 * narrável em linguagem humana.
 */

export type Marco = {
  chave: string;
  titulo: string;
  texto: string;
  data: string; // ISO
};

export type EntradaHistoria = {
  diary: DiaryEntry[];
  sims: { created_at: string }[];
  rules: { created_at: string }[];
  licoes: { completed_at: string }[];
  revisoes: { data: string }[];
};

const SEMANA_MS = 7 * 86_400_000;
const DIA_MS = 86_400_000;

function minData(lista: string[]): string | null {
  const validas = lista.filter((d) => !!d && !Number.isNaN(new Date(d).getTime()));
  if (!validas.length) return null;
  return validas.reduce((a, b) => (new Date(a).getTime() <= new Date(b).getTime() ? a : b));
}

export function historiaDeEvolucao(input: EntradaHistoria): Marco[] {
  const marcos: Marco[] = [];

  const primeiraTese = minData(input.diary.map((e) => e.created_at));
  if (primeiraTese)
    marcos.push({
      chave: "primeira-tese",
      titulo: "Você registrou sua primeira decisão",
      texto:
        "Uma decisão com nome é uma decisão que você entende. Foi aqui que o processo começou.",
      data: primeiraTese,
    });

  const primeiraSim = minData(input.sims.map((s) => s.created_at));
  if (primeiraSim)
    marcos.push({
      chave: "primeira-simulacao",
      titulo: "Primeira simulação",
      texto:
        "Você viu o prejuízo máximo antes do mercado te mostrar. Isso separa planejar de apostar.",
      data: primeiraSim,
    });

  const primeiraRegra = minData(input.rules.map((r) => r.created_at));
  if (primeiraRegra)
    marcos.push({
      chave: "primeira-regra",
      titulo: "Sua primeira regra nasceu",
      texto:
        "Regra não é limite — é o nome da sua disciplina. A partir dela, tudo o mais se compara.",
      data: primeiraRegra,
    });

  const primeiraLicao = minData(input.licoes.map((l) => l.completed_at));
  if (primeiraLicao)
    marcos.push({
      chave: "primeira-licao",
      titulo: "Primeira lição concluída",
      texto: "Uma lição vale mais que dez opiniões.",
      data: primeiraLicao,
    });

  const primeiroFechamento = minData(
    input.diary
      .filter((e) => e.status === "encerrada" && e.resultado !== null)
      .map((e) => e.created_at),
  );
  if (primeiroFechamento)
    marcos.push({
      chave: "primeiro-fechamento",
      titulo: "Você fechou o primeiro ciclo",
      texto:
        "Operação sem fechamento não ensina nada. Você registrou o resultado — ganho ou perda — e deu nome ao aprendizado.",
      data: primeiroFechamento,
    });

  // Primeira janela de 7 dias com 5+ decisões avaliadas e nenhuma fura.
  const avaliadas = [...input.diary]
    .filter((e) => e.seguiu_regra !== null)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (let i = 4; i < avaliadas.length; i++) {
    const janela = avaliadas.slice(i - 4, i + 1);
    const primeira = new Date(janela[0].created_at).getTime();
    const ultima = new Date(janela[janela.length - 1].created_at).getTime();
    if (ultima - primeira <= SEMANA_MS && janela.every((e) => e.seguiu_regra)) {
      marcos.push({
        chave: "primeira-semana-disciplina",
        titulo: "Uma semana sem furar a própria regra",
        texto: "Cinco decisões, sete dias, zero furas. Disciplina não é perfeição — é constância.",
        data: janela[0].created_at,
      });
      break;
    }
  }

  // Primeira virada de hábito detectada (antes → depois).
  const ordenadas = [...input.diary].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const virada = evolucaoInvestidor(input.diary).find((h) => h.mudou);
  if (virada && ordenadas.length >= 4) {
    const metade = Math.floor(ordenadas.length / 2);
    marcos.push({
      chave: "virada-habito",
      titulo: `O sistema detectou uma virada: ${virada.rotulo}`,
      texto: `Antes: ${virada.antes}. Agora: ${virada.agora}. ${virada.descricao}`,
      data: ordenadas[metade].created_at,
    });
  }

  // 30 dias desde a primeira atividade.
  const primeiraAtividade = minData([
    ...input.diary.map((e) => e.created_at),
    ...input.sims.map((s) => s.created_at),
    ...input.rules.map((r) => r.created_at),
  ]);
  if (primeiraAtividade) {
    const trintaDias = new Date(new Date(primeiraAtividade).getTime() + 30 * DIA_MS);
    if (trintaDias.getTime() <= Date.now()) {
      marcos.push({
        chave: "trinta-dias",
        titulo: "30 dias construindo um processo",
        texto:
          "A maioria desiste na terceira semana. Você está registrando, revisando e se comparando com quem você era — não com o mercado.",
        data: trintaDias.toISOString(),
      });
    }
  }

  const primeiraRevisao = minData(input.revisoes.map((r) => r.data));
  if (primeiraRevisao)
    marcos.push({
      chave: "primeira-revisao",
      titulo: "Primeira revisão do período",
      texto:
        "Parar, olhar o que fez e escolher o foco do próximo período. É assim que se vira sistemático.",
      data: primeiraRevisao,
    });

  return marcos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}
