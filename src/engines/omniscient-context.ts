import type { DecisionContext } from "./decision-context";
import { FONTE_MERCADO_LABEL } from "@/lib/mercado-snapshot";

// ==========================================
// OMNISCIENT CONTEXT — CONTEXTO ESTRUTURADO DO COPILOT
// ==========================================
// O que o copilot precisa saber sobre a simulação do usuário, em fatos
// estruturados — NUNCA como síntese em prosa. O modelo lê os números e
// as respostas das 5 perguntas e explica a mecânica com a voz do tutor.
// É extraído 1:1 do DecisionContext — o copilot verbaliza a moeda do sistema.
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
  /**
   * Mercado observado no instante da decisão (Rodada W). Proveniência
   * (fonte + instante) é parte do dado — nunca chute, nunca refetch.
   */
  mercado: {
    fonte: string | null;
    observadoEm: string | null;
    spot: number | null;
    ivAtm: number | null;
    ivRank: number | null;
    liquidez: string | null;
  } | null;
  /** Exposições líquidas da carteira (estimadas pelo modelo). Null sem posições. */
  portfolio: {
    source: string | null;
    valuationSource: string | null;
    valuatedAt: string | null;
    netDelta: number | null;
    netTheta: number | null;
    netVega: number | null;
    netRho: number | null;
    marginUtilized: number | null;
    topAssets: string[] | null;
  } | null;
};

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

/** Extrai o contexto estruturado do copilot a partir do DecisionContext. */
export function buildOmniscientContext(ctx: DecisionContext): OmniscientContext {
  const t = ctx.technical;
  const c = ctx.cognitive;
  const inter = t.strategy.interpretacao;

  return {
    version: 1,
    origem: "simulacao",
    captured_at: ctx.captured_at,
    estrategia: {
      ativo: t.ativo,
      estrutura: inter.nome,
      precoReferencia: t.pricing.spot,
      objetivoLabel: inter.objetivoLabel,
      breakevens: inter.breakevens,
      lucroMax: inter.lucroMax,
      perdaMax: inter.perdaMax,
      capitalEmRisco: inter.capitalEmRisco,
    },
    gregas: {
      dias: t.time.daysToMaturity,
      iv: t.volatility.iv,
      delta: t.greeks.netDelta,
      reagePorR1: t.greeks.netDelta * 100,
      gamma: t.greeks.netGamma,
      thetaPorDia: t.greeks.netTheta,
      vegaPorPonto: t.greeks.netVega,
      rhoPorPonto: t.greeks.netRho,
      tempoStatus: t.greeks.tempo.status,
      tempoMecanica: t.greeks.tempo.mecanica,
      perguntas: [
        t.greeks.perguntas.direcao,
        t.greeks.perguntas.gamma,
        t.greeks.perguntas.volatilidade,
        t.greeks.perguntas.juros,
        t.greeks.perguntas.probabilidade,
      ].map((p) => ({ pergunta: p.pergunta, resposta: p.resposta, numerico: p.numerico })),
    },
    probabilidade: {
      pop: t.greeks.perguntas.probabilidade.pop,
      expectedMoveBrl: t.pricing.expectedMoveBrl,
    },
    processo: {
      score: c.decisionScore.score,
      leitura: c.decisionScore.leitura,
      alertas: c.rules.map((a) => ({
        regra: a.regra,
        motivo: a.motivo,
        severidade: a.severidade,
      })),
      disciplinaHistorica: c.disciplinaHistorica,
    },
    mercado: t.market
      ? {
          fonte: t.market.fonte,
          observadoEm: t.market.observadoEm,
          spot: t.pricing.spot,
          ivAtm: t.volatility.iv,
          ivRank: t.market.ivRank,
          liquidez: t.market.liquidityScore,
        }
      : null,
    portfolio: t.portfolio
      ? {
          source: t.portfolio.source,
          valuationSource: t.portfolio.valuationSource,
          valuatedAt: t.portfolio.valuatedAt,
          netDelta: t.portfolio.netDelta,
          netTheta: t.portfolio.netTheta,
          netVega: t.portfolio.netVega,
          netRho: t.portfolio.netRho,
          marginUtilized: t.portfolio.marginUtilized,
          topAssets: t.portfolio.topAssets,
        }
      : null,
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

  if (ctx.mercado) {
    const m = ctx.mercado;
    const rotulo = m.fonte
      ? FONTE_MERCADO_LABEL[m.fonte as keyof typeof FONTE_MERCADO_LABEL]
      : m.fonte;
    lines.push(
      `MERCADO (${rotulo ?? "fonte não observada"}): spot ${m.spot != null ? brl(m.spot) : "não observado"} às ${m.observadoEm ?? "instante não registrado"}`,
    );
    if (m.ivAtm != null) lines.push(`- IV ATM: ${m.ivAtm.toFixed(1)}% a.a. (usado na valoração)`);
    if (m.ivRank != null) lines.push(`- Percentil de IV no histórico do ativo: ${m.ivRank}%`);
    if (m.liquidez) lines.push(`- Liquidez: ${m.liquidez}`);
  }

  if (ctx.portfolio) {
    const p = ctx.portfolio;
    lines.push(
      `CARTEIRA (posições ${p.source ?? "não registradas"} · valoração ${p.valuationSource ?? "sem modelo"}): exposição ESTIMADA pelo modelo no momento — não é valor oficial de corretora.`,
    );
    if (p.netDelta != null)
      lines.push(`- Delta líquido estimado: ${p.netDelta.toFixed(2)} contratos-equivalentes`);
    if (p.netTheta != null) lines.push(`- Theta estimado: ${brl(p.netTheta)} por dia`);
    if (p.netVega != null) lines.push(`- Vega estimado: ${brl(p.netVega)} por 1 ponto de IV`);
    if (p.netRho != null) lines.push(`- Rho estimado: ${brl(p.netRho)} por 1 ponto de taxa`);
    if (p.topAssets?.length) lines.push(`- Concentração: ${p.topAssets.join(", ")}`);
  }

  lines.push(
    "==POLÍTICA DE CONTEXTO DE MERCADO (RODADA X)==",
    "- Você NUNCA deve produzir sinais de compra/venda, metas de preço ou recomendações de trade.",
    "- O contexto de mercado é estritamente observacional e factual.",
    "- Ausência de dados (null) deve ser tratada como ausência de observação, nunca como zero.",
    "==",
  );

  lines.push("==");
  return lines.join("\n");
}
