import type { Perna } from "@/lib/payoff";
import type { Interpretacao } from "./simulation-interpreter";

export type Regra = {
  id: string;
  texto: string;
  nome?: string | null;
  categoria?: string | null;
  ativa: boolean;
  tipo?: string | null;
  parametros_json?: any;
};

export type Alerta = {
  ruleId: string;
  indice: number;
  regra: string;
  motivo: string;
  severidade: "aviso" | "critico";
};

const KEYS = {
  trava: ["trava", "spread", "sozinha", "seco", "descoberta"],
  riscoLimitado: ["risco limitado", "perda limitada", "100% limitado", "descoberta", "risco definido"],
  vwap: ["vwap"],
  rsi: ["rsi"],
  media: ["média móvel", "media movel", "mm ", "ema", "sma"],
  volume: ["volume"],
  tamanho: ["1%", "2%", "capital", "position", "tamanho"],
};

function has(t: string, list: string[]) {
  return list.some((k) => t.includes(k));
}

/**
 * Rule Engine: cruza a estrutura simulada com as regras pessoais.
 * Nunca bloqueia — apenas alerta e registra que o usuário foi avisado.
 */
export function validarRegras(
  pernas: Perna[],
  regras: Regra[],
  i: Interpretacao,
  ctx: { confirmacoes?: Record<string, boolean>; capital?: number } = {},
): Alerta[] {
  const alertas: Alerta[] = [];
  const ativas = regras.filter((r) => r.ativa);
  const compraSeca =
    pernas.length === 1 && pernas[0].acao === "compra";
  const confirm = ctx.confirmacoes ?? {};

  ativas.forEach((r, idx) => {
    const t = `${r.nome ?? ""} ${r.texto}`.toLowerCase();
    const indice = idx + 1;
    const push = (motivo: string, severidade: Alerta["severidade"] = "aviso") =>
      alertas.push({ ruleId: r.id, indice, regra: r.texto, motivo, severidade });

    if (compraSeca && has(t, KEYS.trova ?? KEYS.trava))
      push("Você está simulando uma opção sozinha, sem trava.");

    if (!i.perdaLimitada && has(t, KEYS.riscoLimitado))
      push("Esta estrutura tem perna vendida descoberta — o risco não é limitado.", "critico");

    if (has(t, KEYS.vwap) && !confirm[r.id])
      push("Esta simulação não tem confirmação de VWAP marcada.");

    if (has(t, KEYS.rsi) && !confirm[r.id])
      push("Sua regra condiciona a entrada ao RSI e você não confirmou esse filtro.");

    if (has(t, KEYS.media) && !confirm[r.id])
      push("Sua regra depende de média móvel e não há confirmação marcada.");

    if (has(t, KEYS.volume) && !confirm[r.id])
      push("Sua regra pede confirmação de volume e ela não foi marcada.");

    if (has(t, KEYS.tamanho) && ctx.capital && i.capitalEmRisco > ctx.capital * 0.02)
      push(
        `O capital em risco (R$ ${i.capitalEmRisco.toFixed(2)}) passa de 2% do capital informado.`,
        "critico",
      );
  });

  return alertas.filter(
    (a, idx, arr) => arr.findIndex((b) => b.ruleId === a.ruleId && b.motivo === a.motivo) === idx,
  );
}

/** Regras que exigem uma confirmação manual do usuário na simulação. */
export function regrasQuePedemConfirmacao(regras: Regra[]) {
  return regras
    .filter((r) => r.ativa)
    .filter((r) => {
      const t = `${r.nome ?? ""} ${r.texto}`.toLowerCase();
      return has(t, [...KEYS.vwap, ...KEYS.rsi, ...KEYS.media, ...KEYS.volume]);
    });
}
