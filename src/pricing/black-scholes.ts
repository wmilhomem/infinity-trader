import { standardNormalCDF } from "./math";

export type OptionType = "call" | "put";

export function d1(S: number, K: number, t: number, r: number, sigma: number): number {
  // Evita divisão por zero se t=0
  if (t <= 0) t = 1e-10;
  return (Math.log(S / K) + (r + (sigma * sigma) / 2) * t) / (sigma * Math.sqrt(t));
}

export function d2(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) t = 1e-10;
  return d1(S, K, t, r, sigma) - sigma * Math.sqrt(t);
}

/**
 * Motor puro de Precificação Black-Scholes para precificação Teórica de Opções Europeias.
 * @param type "call" ou "put"
 * @param S Preço atual do ativo (Spot)
 * @param K Preço de exercício (Strike)
 * @param t Tempo até vencimento em ANOS (Ex: 30 dias = 30/365)
 * @param r Taxa livre de risco anualizada contínua
 * @param sigma Volatilidade Implícita (anualizada, Ex: 0.3)
 */
export function blackScholes(
  type: OptionType,
  S: number,
  K: number,
  t: number,
  r: number,
  sigma: number,
): number {
  if (t <= 0) return type === "call" ? Math.max(0, S - K) : Math.max(0, K - S);

  const d_1 = d1(S, K, t, r, sigma);
  const d_2 = d_1 - sigma * Math.sqrt(t);

  const Nd1 = standardNormalCDF(d_1);
  const Nd2 = standardNormalCDF(d_2);

  if (type === "call") {
    return S * Nd1 - K * Math.exp(-r * t) * Nd2;
  } else {
    const nNd1 = standardNormalCDF(-d_1);
    const nNd2 = standardNormalCDF(-d_2);
    return K * Math.exp(-r * t) * nNd2 - S * nNd1;
  }
}
