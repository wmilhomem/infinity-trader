import { blackScholes, OptionType } from "./black-scholes";
import { vega } from "./greeks";

/**
 * Abordagem Rápida: Newton-Raphson.
 * Otimizado por causa da derivada primária presente (Vega).
 */
export function impliedVolatilityNewtonRaphson(
  targetPrice: number,
  type: OptionType,
  S: number,
  K: number,
  t: number,
  r: number,
  maxIter = 100,
  tolerance = 1e-6,
): number {
  let sigma = 0.3; // Initial guess = 30% Vol

  for (let i = 0; i < maxIter; i++) {
    const price = blackScholes(type, S, K, t, r, sigma);
    const diff = price - targetPrice;

    if (Math.abs(diff) < tolerance) return sigma;

    const v = vega(S, K, t, r, sigma);
    if (v < 1e-10) break; // Derivada esmagada, quebra NR e envia ao fallback

    sigma -= diff / v;
    if (sigma <= 0 || isNaN(sigma)) break; // Newton falhou.
  }

  return -1; // Sinaliza falha do Newton
}

/**
 * Abordagem Segura: Busca Binária (Bisection).
 * Mais lento (logN), mas nunca quebra. Garante que encontra a VI caso esteja na janela de [0% a 500%].
 */
export function impliedVolatilityBisection(
  targetPrice: number,
  type: OptionType,
  S: number,
  K: number,
  t: number,
  r: number,
  maxIter = 100,
  tolerance = 1e-6,
): number {
  let low = 1e-4; // 0.01%
  let high = 5.0; // 500%

  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2;
    const price = blackScholes(type, S, K, t, r, mid);
    const diff = price - targetPrice;

    if (Math.abs(diff) < tolerance) return mid;

    if (diff > 0) {
      high = mid; // Preço do modelo convergiu maior, a VI é menor
    } else {
      low = mid; // Preço do modelo convergiu menor, a VI é maior
    }
  }

  return (low + high) / 2;
}

/**
 * Calculador Oficial de Volatilidade Implícita.
 * Tenta Newton-Raphson para perfis O(1).
 * Aplica Bisection fallback para casos onde o Newton diverge por quebra geométrica nas extremidades.
 */
export function impliedVolatility(
  targetPrice: number,
  type: OptionType,
  S: number,
  K: number,
  t: number,
  r: number,
): number {
  // Option value at exp or negative value = malformed request.
  if (t <= 0 || targetPrice <= 0) return 0;

  const iv = impliedVolatilityNewtonRaphson(targetPrice, type, S, K, t, r);
  if (iv !== -1 && iv > 0) return iv;

  return impliedVolatilityBisection(targetPrice, type, S, K, t, r);
}
