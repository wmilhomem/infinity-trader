import type { DiaryEntry } from "./types";
import { evolucaoInvestidor, type Habito } from "./timeline";
import { construirGrafo } from "./knowledge-graph";

/**
 * ESPELHO — "quem você está se tornando".
 * Nada aqui é adivinhado: cada frase nasce de um hábito observável
 * (antes → depois) ou de um padrão que se repete no seu histórico.
 * Sem elogio vazio e sem rótulo: só o que você registrou.
 */

export type EixoEspelho = {
  chave: string;
  rotulo: string;
  antes: string;
  agora: string;
  mudou: boolean;
  frase: string | null;
};

export type Espelho = {
  registros: number;
  avaliados: number;
  eixos: EixoEspelho[];
  perfil: string;
  foco: string;
  caminhoRepetido: { rotulo: string }[] | null;
  fraseFinal: string;
};

const POSITIVO: Record<string, (h: Habito) => string> = {
  tese: (h) =>
    `Você está se tornando alguém que escreve a tese antes de decidir: antes escrevia em ${h.antes} das decisões, agora em ${h.agora}.`,
  regra: (h) =>
    `Você está se tornando alguém que respeita a própria regra: ${h.antes} → ${h.agora} das decisões avaliadas.`,
  simulou: (h) =>
    `Você está se tornando alguém que simula antes de operar: ${h.antes} → ${h.agora} das decisões nascem de uma simulação.`,
  fechou: (h) =>
    `Você está se tornando alguém que fecha o ciclo: ${h.antes} → ${h.agora} das operações terminam com resultado registrado.`,
  tamanho: (h) =>
    `Você está se tornando alguém que controla o tamanho do risco: R$ ${h.antes} → R$ ${h.agora} por operação.`,
};

const RISCO: Record<string, (h: Habito) => string> = {
  tese: (h) =>
    h.antes === "—"
      ? "Ainda não há decisões com tese suficientes para medir."
      : `Ainda decide sem tese em ${h.agora} dos casos — decisão sem nome é impulso.`,
  regra: (h) =>
    h.antes === "—"
      ? "Ainda não há decisões avaliadas contra regra."
      : `Ainda fura a própria regra em ${h.agora} das decisões avaliadas.`,
  simulou: (h) =>
    h.antes === "—"
      ? "Ainda não há decisões vindas de simulação suficientes para medir."
      : `Ainda monta ${h.agora} das operações sem simular antes.`,
  fechou: (h) =>
    h.antes === "—"
      ? "Ainda não há ciclos fechados suficientes para medir."
      : `Ainda deixa ${h.agora} das operações sem fechamento — sem fechamento não há aprendizado.`,
  tamanho: (h) =>
    h.antes === "—"
      ? "Dimensione suas operações pelo simulador para medir este eixo."
      : `O tamanho médio (${h.agora}) não caiu. É a próxima fronteira.`,
};

export function quemVoceEstaSeTornando(input: {
  diary: DiaryEntry[];
  rules: { id: string; texto: string }[];
}): Espelho {
  const habitos = evolucaoInvestidor(input.diary);

  const eixos: EixoEspelho[] = habitos.map((h) => ({
    chave: h.chave,
    rotulo: h.rotulo,
    antes: h.antes,
    agora: h.agora,
    mudou: h.mudou,
    frase: h.mudou ? (POSITIVO[h.chave]?.(h) ?? null) : null,
  }));

  const mudaram = habitos.filter((h) => h.mudou);
  const perfil =
    input.diary.length === 0
      ? "Você ainda não registrou nenhuma decisão. O espelho fica vazio — e isso é honesto: só o que você registrar aparece aqui."
      : mudaram.length === 0
        ? "Ainda não há mudança detectável entre a primeira e a segunda metade das suas decisões. Isso não é fracasso: é o ponto exato onde o processo começa a trabalhar."
        : mudaram
            .map((h) => POSITIVO[h.chave]?.(h))
            .filter(Boolean)
            .join(" ");

  const comDados = habitos.filter((h) => h.antes !== "—" && h.agora !== "—");
  const cuidado = comDados.find((h) => !h.mudou) ?? null;
  const foco =
    input.diary.length === 0
      ? "Escrever a primeira decisão no diário."
      : cuidado
        ? (RISCO[cuidado.chave]?.(cuidado) ?? "")
        : mudaram.length > 0
          ? "Nada pede atenção urgente. O trabalho agora é constância: continue registrando."
          : "Precisa de mais decisões registradas para o espelho enxergar uma direção.";

  const grafo = construirGrafo(input.diary, input.rules);
  const caminhoRepetido =
    grafo && grafo.caminho.length >= 2 ? grafo.caminho.map((n) => ({ rotulo: n.rotulo })) : null;

  return {
    registros: input.diary.length,
    avaliados: input.diary.filter((e) => e.seguiu_regra !== null).length,
    eixos,
    perfil,
    foco,
    caminhoRepetido,
    fraseFinal:
      "O espelho não adivinha. Ele só devolve o que você registrou — e quanto mais você registrar, mais nítida fica a imagem.",
  };
}
