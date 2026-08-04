import { d1, d2, OptionType } from "./black-scholes";
import { standardNormalPDF, standardNormalCDF } from "./math";

// ==========================================
// PRIMEIRA ORDEM
// ==========================================

export function delta(type: OptionType, S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
  const d1_val = d1(S, K, t, r, sigma);
  return type === "call" ? standardNormalCDF(d1_val) : standardNormalCDF(d1_val) - 1;
}

export function gamma(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  return standardNormalPDF(d1_val) / (S * sigma * Math.sqrt(t));
}

export function theta(type: OptionType, S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  const term1 = -(S * standardNormalPDF(d1_val) * sigma) / (2 * Math.sqrt(t));
  
  if (type === "call") {
    return term1 - r * K * Math.exp(-r * t) * standardNormalCDF(d2_val);
  } else {
    return term1 + r * K * Math.exp(-r * t) * standardNormalCDF(-d2_val);
  }
}

export function vega(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  return S * standardNormalPDF(d1_val) * Math.sqrt(t);
}

export function rho(type: OptionType, S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d2_val = d2(S, K, t, r, sigma);
  if (type === "call") {
    return K * t * Math.exp(-r * t) * standardNormalCDF(d2_val);
  } else {
    return -K * t * Math.exp(-r * t) * standardNormalCDF(-d2_val);
  }
}

// ==========================================
// SEGUNDA E TERCEIRA ORDEM
// ==========================================

export function charm(type: OptionType, S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  const nPrime = standardNormalPDF(d1_val);
  const c = -nPrime * (r / (sigma * Math.sqrt(t)) - d2_val / (2 * t));
  return type === "call" ? c : c + r * Math.exp(-r * t);
}

export function vanna(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  return -standardNormalPDF(d1_val) * d2_val / sigma;
}

export function vomma(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  const v = vega(S, K, t, r, sigma);
  return v * d1_val * d2_val / sigma;
}

export function color(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  const nPrime = standardNormalPDF(d1_val);
  return -nPrime / (2 * S * t * sigma * Math.sqrt(t)) * (1 + (2 * r * t * d1_val) / (sigma * Math.sqrt(t)) - d1_val * d2_val);
}

export function speed(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const g = gamma(S, K, t, r, sigma);
  const d1_val = d1(S, K, t, r, sigma);
  return (-g / S) * ((d1_val / (sigma * Math.sqrt(t))) + 1);
}

export function zomma(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const g = gamma(S, K, t, r, sigma);
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  return g * (d1_val * d2_val - 1) / sigma;
}

export function ultima(S: number, K: number, t: number, r: number, sigma: number): number {
  if (t <= 0) return 0;
  const v = vega(S, K, t, r, sigma);
  const d1_val = d1(S, K, t, r, sigma);
  const d2_val = d2(S, K, t, r, sigma);
  return (-v / (sigma * sigma)) * (d1_val * d2_val * (1 - d1_val * d2_val) + d1_val * d1_val + d2_val * d2_val);
}
