import type { ProviderQuote } from "@/market/providers";

/**
 * CONFIDENCE ENGINE — Auditor de Qualidade de Dados
 * Avalia o que o provedor de mercado entregou e diz se o OS pode confiar.
 * Impede o Copilot (e a UI) de dar certezas baseadas em lixo: spread largo,
 * book vazio, dado velho ou IV inexistente derrubam o score.
 */
export type ConfidenceContext = {
  score: number; // 0-100
  isReliable: boolean; // score >= 60
  diagnostics: string[]; // Ex: ["Spread de 12% detectado", "Book de ofertas vazio"]
};

const RELIABLE_THRESHOLD = 60;

function spreadPct(bid: number, ask: number): number | null {
  if (bid <= 0 || ask <= 0 || ask <= bid) return null;
  return ((ask - bid) / ((ask + bid) / 2)) * 100;
}

/**
 * Auditoria pura: recebe o quote do provedor e devolve o veredito.
 * Nenhuma regra de mercado aqui — só qualidade de dado observável.
 */
export function computeConfidence(quote: ProviderQuote | null): ConfidenceContext {
  if (!quote) {
    return {
      score: 0,
      isReliable: false,
      diagnostics: ["Sem dados de mercado (provedor não conectado)"],
    };
  }

  const diagnostics: string[] = [];
  let score = 100;

  // Fonte — o OS sempre sabe de onde veio o dado.
  const fonte =
    quote.provider === "mock"
      ? "Provedor simulado (sandbox didático)"
      : quote.provider === "live"
        ? "Provedor ao vivo"
        : quote.provider === "modelo"
          ? "Preços modelados (sem book real)"
          : "Provedor replay";

  if (quote.provider === "modelo") {
    score -= 10;
    diagnostics.push("Chain modelada: prêmios calculados, não negociados");
  }

  if (quote.spot <= 0) {
    score -= 40;
    diagnostics.push("Preço do ativo inválido ou zero");
  }

  // Idade do dado.
  if (quote.spotAgeMs > 5 * 60 * 1000) {
    score -= 30;
    diagnostics.push("Cotações antigas: mais de 5 minutos sem atualização");
  } else if (quote.spotAgeMs > 60 * 1000) {
    score -= 10;
    diagnostics.push("Cotações com mais de 1 minuto de idade");
  }

  // IV observado.
  if (quote.ivAtm === null || quote.ivAtm <= 0) {
    score -= 30;
    diagnostics.push("Volatilidade implícita não observada");
  }
  if (quote.ivRank === null) {
    score -= 10;
    diagnostics.push("Percentil histórico de IV indisponível");
  }

  // Book de opções: spread e profundidade.
  const book = quote.optionBook ?? [];
  if (book.length === 0) {
    score -= 40;
    diagnostics.push("Book de ofertas vazio");
  } else {
    let wideSpreads = 0;
    let emptyDepth = 0;
    let depthOculta = 0;
    for (const o of book) {
      const sp = spreadPct(o.bid, o.ask);
      if (sp === null) {
        emptyDepth++;
        continue;
      }
      if (sp > 8) wideSpreads++;
      if (o.depthBid === 0 || o.depthAsk === 0) emptyDepth++;
      else if (o.depthBid === undefined || o.depthAsk === undefined) depthOculta++;
    }
    if (wideSpreads > 0) {
      score -= Math.min(30, wideSpreads * 10);
      diagnostics.push(
        `Spread largo em ${wideSpreads} ${wideSpreads === 1 ? "contrato" : "contratos"} (>8% do prêmio)`,
      );
    }
    if (emptyDepth > 0) {
      score -= Math.min(20, emptyDepth * 5);
      diagnostics.push(
        `Book vazio em ${emptyDepth} ${emptyDepth === 1 ? "contrato" : "contratos"}`,
      );
    }
    if (depthOculta === book.length) {
      score -= 10;
      diagnostics.push("Profundidade do book não exposta pelo provedor");
    }
  }

  // Liquidez declarada pelo provedor.
  if (quote.liquidityScore === "baixa") {
    score -= 15;
    diagnostics.push("Liquidez baixa no ativo");
  } else if (quote.liquidityScore === "media") {
    score -= 5;
    diagnostics.push("Liquidez média — spreads mais folgados");
  }

  if (quote.eventsImminent) {
    score -= 10;
    diagnostics.push("Evento corporativo iminente (risco de gap no preço)");
  }

  diagnostics.unshift(`Fonte: ${fonte}`);

  return {
    score: Math.max(0, Math.min(100, score)),
    isReliable: score >= RELIABLE_THRESHOLD,
    diagnostics: diagnostics.slice(0, 6),
  };
}
