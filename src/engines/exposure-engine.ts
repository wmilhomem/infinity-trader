import type { PortfolioDimension } from "./context-engine";

export type ExposureProfile = {
  volatilityExposure: string; // Ex: "comprado em volatilidade"
  timeExposure: string;       // Ex: "vendido em tempo" (short theta) ou "protegido pelo tempo"
  directionExposure: string;  // Ex: "dependente de alta"
  interestExposure: string;   // Ex: "exposto ao DI"
  concentration: string;      // Ex: "concentrado em PETR4"
};

/**
 * Exposure Engine
 * Avalia as gregas cegas e transforma no idioma real de Risco de Portfólio.
 * Responde à pergunta: "O que realmente está puxando o meu patrimônio neste segundo?"
 */
export function buildExposureProfile(port: PortfolioDimension): ExposureProfile {
  // Limites nominais para fins didáticos. Podem ser calibrados pelo % do AUM do cliente.
  const VEGA_THRESHOLD = 5; 
  const THETA_THRESHOLD = 2;
  const DELTA_THRESHOLD = 5;
  const RHO_THRESHOLD = 15;

  let vol = "neutro em volatilidade";
  if (port.netVega > VEGA_THRESHOLD) vol = "comprado em volatilidade";
  else if (port.netVega < -VEGA_THRESHOLD) vol = "vendido em volatilidade";

  let tempo = "neutro estruturalmente no tempo";
  // Theta negativo = A posição perde com o passar do tempo (opções compradas). Logo, você está "vendido contra o relógio".
  if (port.netTheta < -THETA_THRESHOLD) tempo = "vendido em tempo (decaimento te prejudica)";
  else if (port.netTheta > THETA_THRESHOLD) tempo = "comprado em tempo (decaimento te favorece)";

  let dir = "neutro direcionalmente";
  if (port.netDelta > DELTA_THRESHOLD) dir = "fortemente dependente de alta";
  else if (port.netDelta < -DELTA_THRESHOLD) dir = "fortemente dependente de baixa";

  let juros = "imune à curva de juros";
  if (Math.abs(port.netRho) > RHO_THRESHOLD) juros = "exposto ao DI (risco de taxa)";

  let conc = "portfólio diversificado";
  if (port.topAssets && port.topAssets.length > 0) {
    if (port.topAssets.length === 1) conc = `concentrado nativamente em ${port.topAssets[0]}`;
    else conc = `exposição primária pulverizada em ${port.topAssets.slice(0, 3).join(", ")}`;
  }

  return {
    volatilityExposure: vol,
    timeExposure: tempo,
    directionExposure: dir,
    interestExposure: juros,
    concentration: conc
  };
}
