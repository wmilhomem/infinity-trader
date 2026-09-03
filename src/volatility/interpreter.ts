import { calculateIVRank, calculateIVPercentile } from "./math";
import { analyzeTermStructure, analyzeSkew } from "./surface";
import { analyzeEventImpact } from "./events";
import type { VolatilityContext, VolatilityLanguage } from "./types";

/**
 * Interpreter
 * Converge a matemática IV, IVR, IVP, Superficie Quântica e Grega em Textos Simples.
 * O Usuário não precisa calcular ou saber Black-Scholes para extrair Insight Operacional.
 */
export function interpretVolatility(ctx: VolatilityContext): VolatilityLanguage {
  const ivr = calculateIVRank(ctx.currentIV, ctx.historyIV);
  const ivp = calculateIVPercentile(ctx.currentIV, ctx.historyIV);

  const term = analyzeTermStructure(ctx.atmIVFront, ctx.atmIVBack);
  const skew = analyzeSkew(ctx.otmPutIV, ctx.otmCallIV, ctx.atmIVFront);

  const evento = analyzeEventImpact(ivr, ctx.daysToEvent, ctx.historicalCrushRate);

  // Síntese principal (Ação Humana)
  let resumo = "";
  let acao: "comprar_vol" | "vender_vol" | "neutro" = "neutro";

  if (ivp > 85 || ivr > 80) {
    resumo = "A volatilidade está extremamente cara.";
    acao = "vender_vol";
  } else if (ivp > 60) {
    resumo = "A volatilidade está cara, acima da sua média.";
    acao = "vender_vol";
  } else if (ivp < 20 || ivr < 20) {
    resumo = "A volatilidade está barata e adormecida.";
    acao = "comprar_vol";
  } else {
    resumo = "A volatilidade está em um nível normal.";
    acao = "neutro";
  }

  // Traduções Didáticas (Detalhes)
  const acaoPalavra = acao === "comprar_vol" ? "barato" : "caro";
  // IVP é a estatística preferida para pedagogia porque ignora "spikes fantasma" do IVR.
  const detalheIVR = `Historicamente, em ${ivp.toFixed(0)}% dos últimos doze meses a volatilidade esteve menor que agora. Você está pagando ${acaoPalavra} pelo prêmio das opções desse ativo.`;

  let superf = "";
  if (term === "backwardation")
    superf += "O mercado está com pânico imediato (opções curtas valendo mais que as longas). ";
  else superf += "O prêmio no tempo estrutural está normal para longo prazo. ";

  if (skew === "put_heavy")
    superf +=
      "Existe um forte medo de queda: as Puts de proteção estão desproporcionalmente caras.";
  if (skew === "call_heavy")
    superf += "Existe euforia: os investidores estão pagando agressivo pelas Calls (Alta).";
  if (skew === "balanced")
    superf += "O preço do medo vs cobiça no mercado está perfeitamente equilibrado.";

  // Crush Alert (Esmagamento de Prêmio)
  let evtMsg = null;
  if (evento.crushProbability === "alta") {
    evtMsg =
      "CUIDADO: Há um balanço/evento corporativo iminente. Se você comprar opções secas agora, será esmagado pela queda natural da Volatilidade (Vol Crush) que ocorre no mercado no dia seguinte do anúncio, mesmo acertando a direção da ação.";
  } else if (evento.crushProbability === "media") {
    evtMsg =
      "Atenção: Evento se aproximando. As opções começam a inchar o prêmio (volatilidade subindo) antecipando um provável balanço corporativo.";
  }

  return {
    resumo,
    acaoStatus: acao,
    detalheIVR,
    detalheSuperficie: superf.trim(),
    detalheEvento: evtMsg,
  };
}
