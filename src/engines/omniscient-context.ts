import type { Perna } from "@/lib/payoff";
import type { Alerta } from "./rule-engine";
import type { Interpretacao } from "./simulation-interpreter";
import type { PositionIntelligence } from "./position-intelligence";

// ==========================================
// OMNISCIENT CONTEXT — CONTEXTO ESTRUTURADO DO COPILOT
// ==========================================
// O que o copilot precisa saber sobre a simulação do usuário, em fatos
// estruturados — NUNCA como síntese em prosa. O modelo lê os números e
// as respostas das 5 perguntas e explica a mecânica com a voz do tutor.
//
// Blocos `mercado` e `portfolio` são propositalmente nulos nesta fase
// (Eixo 3 preenche com dados B3). O que não foi observado é null — nunca chute.

export type OmniscientContext = {
  version: 1;
  origem: "simulacao";
  captured_at: string;
  estrategia: {
    ativo: string;
    estrutura: string;
    precoReferencia: number;
    objetivoLabel: string;
    breakevens: number[];
    lucroMax: number;
    perdaMax: number;
    capitalEmRisco: number;
  } | null;
  gregas: {
    dias: number;
    iv: number;
    delta: number;
    reagePorR1: number;
    gamma: number;
    thetaPorDia: number;
    vegaPorPonto: number;
    rhoPorPonto: number;
    tempoStatus: string;
    tempoMecanica: string;
    perguntas: { pergunta: string; resposta: string; numerico: string }[];
  } | null;
  probabilidade: {
    pop: number;
    expectedMoveBrl: number;
  } | null;
  processo: {
    score: number;
    leitura: string;
    alertas: { regra: string; motivo: string; severidade: string }[];
    disciplinaHistorica: number;
  } | null;
  mercado: null;
  portfolio: null;
};

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

/** Monta o contexto estruturado da simulação no instante da thread. */
export function buildOmniscientContext(params: {
  pernas: Perna[];
  centro: number;
  ativo: string;
  interpretacao: Interpretacao | null;
  intel: PositionIntelligence;
  score: number;
  leitura: string;
  alertas: Alerta[];
  disciplinaHistorica: number;
}): OmniscientContext {
  const {
    pernas,
    centro,
    ativo,
    interpretacao,
    intel,
    score,
    leitura,
    alertas,
    disciplinaHistorica,
  } = params;

  const estrategia = interpretacao
    ? {
        ativo,
        estrutura: interpretacao.nome,
        precoReferencia: centro,
        objetivoLabel: interpretacao.objetivoLabel,
        breakevens: interpretacao.breakevens,
        lucroMax: interpretacao.lucroMax,
        perdaMax: interpretacao.perdaMax,
        capitalEmRisco: interpretacao.capitalEmRisco,
      }
    : null;

  return {
    version: 1,
    origem: "simulacao",
    captured_at: new Date().toISOString(),
    estrategia,
    gregas: {
      dias: intel.dias,
      iv: intel.iv,
      delta: intel.netDeltaContratos,
      reagePorR1: intel.netDeltaContratos * 100,
      gamma: intel.netGammaContratos,
      thetaPorDia: intel.netThetaPorDia,
      vegaPorPonto: intel.netVegaPorPonto,
      rhoPorPonto: intel.netRhoPorPonto,
      tempoStatus: intel.tempo.status,
      tempoMecanica: intel.tempo.mechanic,
      perguntas: [
        intel.direcao,
        intel.gamma,
        intel.volatilidade,
        intel.juros,
        {
          pergunta: intel.probabilidade.pergunta,
          resposta: intel.probabilidade.resposta,
          numerico: `PoP ${Math.round(intel.probabilidade.pop)}%`,
        },
      ].map((p) => ({ pergunta: p.pergunta, resposta: p.resposta, numerico: p.numerico })),
    },
    probabilidade: {
      pop: intel.probabilidade.pop,
      expectedMoveBrl: intel.probabilidade.expectedMoveBrl,
    },
    processo: {
      score,
      leitura,
      alertas: alertas.map((a) => ({
        regra: a.regra,
        motivo: a.motivo,
        severidade: a.severidade,
      })),
      disciplinaHistorica,
    },
    mercado: null,
    portfolio: null,
  };
}

/**
 * Formata o contexto como fatos estruturados para o system prompt.
 * Números secos + as respostas das 5 perguntas — sem síntese em prosa.
 */
export function formatOmniscientContextForPrompt(ctx: OmniscientContext | null): string {
  if (!ctx) return "";

  const lines: string[] = [];
  lines.push(
    "==CONTEXTO DA SIMULAÇÃO DO USUÁRIO (hipótese didática — não é dado real de mercado)==",
  );

  if (ctx.estrategia) {
    const e = ctx.estrategia;
    lines.push(`ESTRUTURA: ${e.estrutura} — ${e.ativo}`);
    lines.push(`- Preço de referência: ${brl(e.precoReferencia)}`);
    lines.push(`- Objetivo: ${e.objetivoLabel}`);
    if (e.breakevens.length) lines.push(`- Breakevens: ${e.breakevens.map(brl).join(" e ")}`);
    lines.push(
      `- Lucro máximo: ${brl(e.lucroMax)} | Perda máxima: ${brl(Math.abs(e.perdaMax))} | Capital em risco: ${brl(Math.abs(e.capitalEmRisco))}`,
    );
  }

  if (ctx.gregas) {
    const g = ctx.gregas;
    lines.push(`CENÁRIO: ${g.dias} dias até o vencimento, IV ${g.iv}% a.a.`);
    lines.push(`- Delta líquido: ${g.delta.toFixed(3)} (reage ~${brl(g.reagePorR1)} por R$ 1)`);
    lines.push(`- Gamma líquido: ${g.gamma.toFixed(3)}`);
    lines.push(`- Theta: ${brl(g.thetaPorDia)} por dia (${g.tempoStatus})`);
    lines.push(`- Vega: ${brl(g.vegaPorPonto)} por 1 ponto de IV`);
    lines.push(`- Rho: ${brl(g.rhoPorPonto)} por 1 ponto de taxa`);
    for (const p of g.perguntas) {
      lines.push(`- ${p.pergunta} → ${p.resposta} (${p.numerico})`);
    }
  }

  if (ctx.probabilidade) {
    lines.push(
      `PROBABILIDADE: PoP ${Math.round(ctx.probabilidade.pop)}% | Movimento esperado 1σ: ${brl(ctx.probabilidade.expectedMoveBrl)}`,
    );
  }

  if (ctx.processo) {
    lines.push(`PROCESSO: score ${ctx.processo.score}/100 — "${ctx.processo.leitura}"`);
    if (ctx.processo.alertas.length) {
      for (const a of ctx.processo.alertas) {
        lines.push(`- ALERTA [${a.severidade.toUpperCase()}]: ${a.regra} (${a.motivo})`);
      }
    }
  }

  lines.push("==");
  return lines.join("\n");
}
