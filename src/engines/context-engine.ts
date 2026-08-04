import type { Interpretacao } from "./simulation-interpreter";
import type { DiaryEntry } from "./types";
import { disciplina } from "./decision-engine";

// ==========================================
// THE 5 DIMENSIONS OF CONTEXT
// ==========================================

export type MarketDimension = {
  ivRank: number;
  diCurveState: "normal" | "inclinada" | "invertida" | "flat";
  liquidityScore: "alta" | "media" | "baixa";
  eventsImminent: boolean;
};

export type StrategyDimension = {
  nature: "direcional" | "volatilidade" | "renda" | "protecao" | "neutro";
  complexity: "iniciante" | "intermediario" | "avancado";
  capitalAtRisk: number;
};

export type UserDimension = {
  experienceLevel: number; // 1 (Iniciante) a 4 (Avançado Trader)
  disciplineScore: number; // 0-100% histórico de respeito às próprias regras
  bias: "bullish" | "bearish" | "neutro"; // Extracão de vício direcional
  historicalWinrate: number;
};

export type TimeDimension = {
  daysToMaturity: number;
  weekSegment: "inicio" | "meio" | "fim";
  sessionPhase: "abertura" | "miolo" | "fechamento" | "fechado";
};

export type PortfolioDimension = {
  netDelta: number;
  netTheta: number;
  netVega: number;
  netRho: number;
  marginUtilized: number;
  topAssets: string[]; // Ex: ["PETR4", "VALE3"]
};

export type OmniscientContext = {
  market: MarketDimension;
  strategy: StrategyDimension;
  user: UserDimension;
  time: TimeDimension;
  portfolio: PortfolioDimension;
};

// ==========================================
// BUILDER LOGIC
// ==========================================

export function buildStrategyDimension(inter: Interpretacao): StrategyDimension {
  let nature: StrategyDimension["nature"] = "neutro";
  if (["alta", "baixa"].includes(inter.objetivo)) nature = "direcional";
  if (inter.objetivo === "renda") nature = "renda";
  if (inter.objetivo === "protecao") nature = "protecao";
  if (inter.objetivo === "lateralizacao") nature = "volatilidade";
  
  return {
    nature,
    complexity: inter.complexidade,
    capitalAtRisk: inter.capitalEmRisco
  };
}

export function buildTimeDimension(daysToMaturity: number, now = new Date()): TimeDimension {
  const day = now.getDay(); // 0(Dom) a 6(Sab)
  let week: TimeDimension["weekSegment"] = "meio";
  if (day === 1 || day === 2) week = "inicio";
  if (day === 4 || day === 5) week = "fim";

  const hour = now.getHours();
  const min = now.getMinutes();
  const t = hour + min / 60;
  
  // Horário B3 aprox
  let phase: TimeDimension["sessionPhase"] = "fechado";
  if (t >= 10 && t < 11.5) phase = "abertura";
  else if (t >= 11.5 && t < 16) phase = "miolo";
  else if (t >= 16 && t <= 17.5) phase = "fechamento";

  return { daysToMaturity, weekSegment: week, sessionPhase: phase };
}

export function buildUserDimension(entries: DiaryEntry[], currentLevel = 1): UserDimension {
  const closed = entries.filter((e) => e.status === "encerrada" && e.resultado !== null);
  
  let wr = 0;
  if (closed.length > 0) {
    const wins = closed.filter((e) => Number(e.resultado) > 0).length;
    wr = (wins / closed.length) * 100;
  }

  // Viés de confirmação (Bias Scanner)
  let bias: UserDimension["bias"] = "neutro";
  if (entries.length >= 3) {
    // Basic heuristics: are checking if the user almost always plays the same side
    const dirTexts = entries.map(e => e.motivo?.toLowerCase() || "");
    let bull = 0, bear = 0;
    dirTexts.forEach(t => {
      if (t.includes("alta") || t.includes("compra") || t.includes("subir")) bull++;
      if (t.includes("venda") || t.includes("baixa") || t.includes("cair")) bear++;
    });
    if (bull > bear * 3 && bull > entries.length * 0.5) bias = "bullish";
    if (bear > bull * 3 && bear > entries.length * 0.5) bias = "bearish";
  }

  return {
    experienceLevel: currentLevel,
    disciplineScore: Math.round(disciplina(entries)),
    bias,
    historicalWinrate: wr
  };
}

export function buildMarketDimension(
  ivRank: number, 
  diShortDays: number, 
  diLongDays: number, 
  eventsImminent: boolean
): MarketDimension {
  let curva: MarketDimension["diCurveState"] = "normal"; // Default short < long
  if (diShortDays > diLongDays + 0.5) curva = "invertida";
  else if (Math.abs(diShortDays - diLongDays) <= 0.2) curva = "flat";
  else if (diLongDays - diShortDays > 1.5) curva = "inclinada"; // Curva ingrime de risco de longo prazo

  // No MVP assumiremos media se dados estiverem saudaveis. Em prod derivará do BBO Spread da B3.
  const liquidity = ivRank > 90 || ivRank < 10 ? "media" : "alta";

  return {
    ivRank,
    diCurveState: curva,
    liquidityScore: liquidity,
    eventsImminent
  };
}

export function buildOmniscientContext(
  market: MarketDimension,
  strategy: StrategyDimension,
  user: UserDimension,
  time: TimeDimension,
  portfolio: PortfolioDimension
): OmniscientContext {
  return { market, strategy, user, time, portfolio };
}
