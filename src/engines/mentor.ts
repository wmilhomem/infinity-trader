import type { DiaryEntry } from "./types";

/**
 * MENTOR — o copilot que inicia conversas.
 * Em vez de esperar pergunta, o sistema observa o diário e traz a
 * conversa certa na hora certa: revisão atrasada, regra furada,
 * operação sem fechamento, tese ausente. Tudo derivado dos registros —
 * nada de adivinhação.
 */

export type MentorSugestao = {
  id: string;
  titulo: string;
  corpo: string;
  rotulo: string;
  to: "/diario" | "/revisao";
};

const diasDesde = (iso: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

export function sugestoesMentor(entries: DiaryEntry[]): MentorSugestao[] {
  const out: MentorSugestao[] = [];
  if (entries.length === 0) {
    out.push({
      id: "diario-vazio",
      titulo: "Seu diário ainda está vazio",
      corpo:
        "A primeira tese escrita vale mais do que a primeira operação. Registre uma decisão (mesmo simulada) antes do mercado abrir.",
      rotulo: "Registrar no diário",
      to: "/diario",
    });
    return out;
  }

  const ordenadas = [...entries].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const ultima = ordenadas[0];
  const diasSemRegistro = diasDesde(ultima.created_at);

  const ultimaFurou = ordenadas.find((e) => e.seguiu_regra === false);
  if (ultimaFurou && diasDesde(ultimaFurou.created_at) <= 14) {
    out.push({
      id: "regra-furada",
      titulo: "Você quebrou a sua própria regra",
      corpo: `Na sua decisão mais recente (${ultimaFurou.ativo} · ${ultimaFurou.estrutura}) você furou a regra. Vale cinco minutos para entender por quê — esse é o único padrão que muda o seu futuro.`,
      rotulo: "Registrar no diário",
      to: "/diario",
    });
  }

  if (diasSemRegistro >= 5) {
    out.push({
      id: "revisao-atrasada",
      titulo: `Há ${diasSemRegistro} dias você não revisa o seu diário`,
      corpo:
        "Sem registro não existe revisão, e sem revisão não existe evolução. Dez minutos antes do mercado abrir resolvem isso.",
      rotulo: "Revisar agora",
      to: "/revisao",
    });
  }

  const abertas = ordenadas.filter((e) => e.status === "aberta");
  if (abertas.length >= 3) {
    out.push({
      id: "operacoes-abertas",
      titulo: `Você tem ${abertas.length} operações abertas sem fechamento`,
      corpo:
        "O ciclo só ensina quando fecha: registre o resultado de cada uma (mesmo sem número exato) para a revisão ter o que medir.",
      rotulo: "Fechar no diário",
      to: "/diario",
    });
  }

  const semTese = ordenadas.slice(0, 5).filter((e) => !e.motivo || e.motivo.trim().length < 20);
  if (semTese.length >= 2 && out.length < 3) {
    out.push({
      id: "tese-ausente",
      titulo: "Suas últimas decisões vieram sem tese",
      corpo:
        "Sem hipótese escrita não dá para saber depois se você errou a leitura ou a execução. Escreva o motivo em pelo menos duas frases.",
      rotulo: "Registrar no diário",
      to: "/diario",
    });
  }

  return out.slice(0, 3);
}
