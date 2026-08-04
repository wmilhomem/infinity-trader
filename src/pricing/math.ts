// src/pricing/math.ts

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/**
 * Probability Density Function (PDF) da Distribuição Normal Padrão.
 * Usado extensivamente no cálculo das gregas (N'(x)).
 */
export function standardNormalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/**
 * Cumulative Distribution Function (CDF) da Distribuição Normal Padrão.
 * Aproximação de Abramowitz & Stegun.
 * Retorna N(x).
 */
export function standardNormalCDF(x: number): number {
  const d1 = 0.049867347, d2 = 0.0211410061, d3 = 0.0032776263;
  const d4 = 0.0000380036, d5 = 0.0000488906, d6 = 0.000005383;
  
  const v = Math.abs(x);
  const v2 = v * v;
  const v3 = v2 * v;
  const v4 = v3 * v;
  const v5 = v4 * v;
  const v6 = v5 * v;
  
  let p = 1.0 + d1 * v + d2 * v2 + d3 * v3 + d4 * v4 + d5 * v5 + d6 * v6;
  p *= p; p *= p; p *= p; p *= p; // p^16
  
  const prob = 1.0 - (0.5 / p);
  return x >= 0 ? prob : 1.0 - prob;
}
