import type { EventImpact } from "./types";

/**
 * Volatility Crush Probability e Earnings Impact
 * Avalia se o usuário está comprando cego antes de um desestresse de mercado.
 */
export function analyzeEventImpact(
  ivr: number, 
  daysToEvent?: number, 
  historicalDrop: number = 20 
): EventImpact {
  if (daysToEvent === undefined || daysToEvent > 15) {
    return { crushProbability: "baixa", expectedDropPts: 0, riskOfHolding: "baixo" };
  }
  
  // Evento muito perto + Volatilidade já inflada (Rank > 75)
  if (daysToEvent <= 5 && ivr > 75) {
    return { 
      crushProbability: "alta", 
      expectedDropPts: historicalDrop, 
      riskOfHolding: "alto" 
    };
  }
  
  // Evento medianamente proximo + Volatilidade mediana pra cima
  if (daysToEvent <= 10 && ivr > 50) {
    return { 
      crushProbability: "media", 
      expectedDropPts: historicalDrop / 2, 
      riskOfHolding: "moderado" 
    };
  }

  return { crushProbability: "baixa", expectedDropPts: 0, riskOfHolding: "baixo" };
}
