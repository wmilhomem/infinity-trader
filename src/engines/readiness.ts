import type { DiaryEntry } from "./types";
import type { Forecast } from "./behavior-forecast";
import {
  avaliarEstadoMental,
  avaliarIntencao,
  type EstadoMental,
  type MotivoIntencao,
} from "./intencao";

/**
 * PAINEL DE VOO — o topo da Home. Não mostra scores; mostra estados.
 * 🟢 Estado mental · 🟡 Atenção (risco comportamental) · 🔴 Lembre-se (regra
 * crítica) · ⚪ Próximo passo. Tudo derivado de dados reais — check do dia,
 * forecast de comportamento e o diário. Auditável por construção.
 */

export type CheckCognitivo = {
  emocao: EstadoMental;
  motivo: MotivoIntencao;
  regraId: string | null;
  criadoEm: string;
};

export type CorPainel = "verde" | "amarelo" | "vermelho" | "cinza";

export type PainelDeVoo = {
  estado: { cor: CorPainel; rotulo: string; mensagem: string };
  atencao: { mensagem: string } | null;
  lembrete: { texto: string; vezes: number } | null;
  proximoPasso: string;
  checkFeitoHoje: boolean;
};

export function corDeSeveridade(severidade: "ok" | "aviso" | "alerta"): CorPainel {
  if (severidade === "ok") return "verde";
  if (severidade === "aviso") return "amarelo";
  return "vermelho";
}

export function regraMaisQuebrada(
  diary: DiaryEntry[],
  rules: { id: string; texto: string }[],
): { texto: string; vezes: number } | null {
  const furas = diary.filter((e) => e.seguiu_regra === false && e.rule_id);
  if (furas.length === 0 || rules.length === 0) return null;
  const porId = new Map<string, number>();
  for (const f of furas) porId.set(f.rule_id!, (porId.get(f.rule_id!) ?? 0) + 1);
  let melhor: { id: string; vezes: number } | null = null;
  for (const [id, vezes] of porId) {
    if (!melhor || vezes > melhor.vezes) melhor = { id, vezes };
  }
  const regra = melhor ? rules.find((r) => r.id === melhor.id) : undefined;
  return regra ? { texto: regra.texto, vezes: melhor!.vezes } : null;
}

export function montarPainelDeVoo(input: {
  checkHoje: CheckCognitivo | null;
  forecast: Forecast | null;
  rules: { id: string; texto: string }[];
  diary: DiaryEntry[];
}): PainelDeVoo {
  const { checkHoje, forecast, rules, diary } = input;

  const estado = checkHoje
    ? (() => {
        const s = avaliarEstadoMental(checkHoje.emocao);
        return { cor: corDeSeveridade(s.severidade), rotulo: s.rotulo, mensagem: s.mensagem };
      })()
    : {
        cor: "cinza" as const,
        rotulo: "Não registrado",
        mensagem: "Comece o dia com um check de 60 segundos para saber como você chega ao mercado.",
      };

  let atencao: { mensagem: string } | null = null;
  if (checkHoje) {
    const s = avaliarIntencao(checkHoje.motivo);
    if (s.severidade === "alerta") atencao = { mensagem: s.mensagem };
  }
  if (!atencao && forecast && forecast.probabilidade >= 40) {
    atencao = { mensagem: forecast.rotulo };
  }

  const lembrete = regraMaisQuebrada(diary, rules);

  const proximoPasso = checkHoje
    ? diary.length === 0
      ? "Escreva sua primeira tese antes de qualquer decisão."
      : "Siga a missão de hoje."
    : "Faça seu check de 60 segundos.";

  return {
    estado,
    atencao,
    lembrete,
    proximoPasso,
    checkFeitoHoje: checkHoje !== null,
  };
}
