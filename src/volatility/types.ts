export type VolatilityContext = {
  currentIV: number; // Volatilidade atual da estrutura (ou ATM mais próximo)
  historyIV: number[]; // Histórico da volatilidade implícita do ativo (Ex: fechamento de 252 dias)

  // Superfície de Volatilidade
  atmIVFront: number; // Volatilidade no dinheiro perto do vencimento
  atmIVBack: number; // Volatilidade no dinheiro no vencimento seguinte
  otmPutIV: number; // Vol OTM Put (Ex: 25 Delta)
  otmCallIV: number; // Vol OTM Call (Ex: 25 Delta)

  // Eventos
  daysToEvent?: number; // Dias úteis até balanço ou evento fixo (Copom/Fomc/Earnings)
  historicalCrushRate?: number; // Queda média da volatilidade que este ativo sofreu nos eventos anteriores
};

export type TermStructureState = "backwardation" | "contango" | "flat";
export type SkewState = "put_heavy" | "call_heavy" | "balanced";

export type EventImpact = {
  crushProbability: "alta" | "media" | "baixa";
  expectedDropPts: number;
  riskOfHolding: "alto" | "moderado" | "baixo";
};

export type VolatilityLanguage = {
  resumo: string; // Ex: "A volatilidade está extremamente cara."
  acaoStatus: "comprar_vol" | "vender_vol" | "neutro";
  detalheIVR: string; // Tradução pedagógica do ranking e percentil
  detalheSuperficie: string; // Explicação sobre term structure e skew
  detalheEvento: string | null; // Explica risco de Vol Crush
};
