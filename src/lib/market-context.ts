/**
 * CANONICAL MARKET CONTEXT — RODADA Y.1
 * Market Data Integrity & B3 Data Contract
 *
 * PRINCÍPIOS FUNDAMENTAIS:
 *
 * 1. null ≠ 0. Dados não observados são null, jamais zero.
 * 2. Todo campo de inteligência carrega PROVENIÊNCIA:
 *      origin: "observed" | "calculated" | "estimated"
 * 3. Campos "calculated" e "estimated" devem declarar:
 *      method + inputs + calculatedAt
 *    para garantir auditabilidade no Replay histórico.
 * 4. Nenhum dado silenciosamente preenchido por estimativa
 *    sem identificação explícita de origem.
 * 5. Sem sinais, recomendações, rankings ou alvos automáticos.
 */

// ─── TIPOS DE PROVENIÊNCIA ─────────────────────────────────────────

export type MarketDataSource =
  | "mock" // dado gerado para fins pedagógicos/sandbox
  | "live" // dado ao vivo de provider oficial B3
  | "delayed" // dado com atraso declarado
  | "provider" // dado de provedor terceirizado
  | "model" // gerado por modelo matemático interno
  | "replay" // dado congelado por snapshot histórico
  | "manual" // inserido manualmente pelo usuário
  | "unknown"; // origem desconhecida — máxima cautela

/**
 * Origem de um campo derivado ou calculado.
 *
 *   "observed"   — Valor lido diretamente de uma fonte externa (B3, provider).
 *   "calculated" — Valor derivado de outros campos observados por uma fórmula
 *                  explícita (ex: IV pela Black-Scholes a partir de bid/ask).
 *   "estimated"  — Aproximação (ex: interpolação de vencimento, arredondamento
 *                  de strike). Deve ser tratado com ceticismo.
 */
export type FieldOrigin = "observed" | "calculated" | "estimated";

/**
 * Metadados de proveniência de um campo derivado (calculated/estimated).
 * Preservados no snapshot para que futuros replays não recalculem dados
 * históricos com modelos ou parâmetros diferentes.
 */
export interface FieldProvenance {
  origin: FieldOrigin;
  /** Nome do modelo ou fórmula: "black-scholes-bsm", "put-call-parity", "binomial", etc. */
  method?: string | null;
  /** Entradas usadas no cálculo no momento do registro */
  inputs?: Record<string, number | string | null> | null;
  /** Fonte do dado, quando observado diretamente */
  source?: string | null;
  /** ISO timestamp do momento em que o cálculo ou observação ocorreu */
  calculatedAt?: string | null;
}

// ─── PROVENIÊNCIA GLOBAL DO CONTEXTO ──────────────────────────────

export interface MarketDataProvenance {
  source: MarketDataSource;
  provider?: string | null;
  observedAt?: string | null;
  receivedAt?: string | null;
  isDelayed?: boolean | null;
  delaySeconds?: number | null;
}

// ─── QUALIDADE GLOBAL DO CONTEXTO ──────────────────────────────────

export interface MarketDataQuality {
  freshness: "fresh" | "delayed" | "stale" | "unknown";
  completeness: "complete" | "partial" | "minimal" | "empty" | "unknown";
  sourceReliability: "official" | "provider" | "secondary" | "manual" | "unknown";
  confidence: "high" | "medium" | "low" | "unknown";
}

// ─── EVENTOS DE MERCADO ───────────────────────────────────────────

export interface MarketContextEvent {
  id?: string;
  category:
    | "corporate"
    | "economic"
    | "political"
    | "commodity"
    | "expiration"
    | "earnings"
    | "dividend"
    | "other";
  title: string;
  description?: string | null;
  source?: string | null;
  publishedAt?: string | null;
  observedAt?: string | null;
  reference?: string | null;
  /** Relevância contextual didática (nunca potencial de valorização ou sentido de trade). */
  relevance?: "low" | "medium" | "high" | null;
}

// ─── CONTRATO DE UM CAMPO DE GREGAS COM PROVENIÊNCIA ─────────────

/**
 * Um campo numérico de Greek (Delta, Gamma, Theta, Vega) com
 * proveniência explícita. No snapshot histórico, o valor E a metodologia
 * ficam congelados — replay não pode recalcular com modelo diferente.
 */
export interface GreekField {
  value: number | null;
  provenance: FieldProvenance;
}

// ─── CONTRATO DE UM CONTRATO DE OPÇÃO ────────────────────────────

/**
 * Representação de um contrato individual da cadeia de opções.
 *
 * Campos obrigatórios:
 *   - symbol, strike, type, expiration, daysToExpiration
 *
 * Campos observados de mercado (lidos do provider):
 *   - last, bid, ask, volume, openInterest, impliedVolatility
 *
 * Campos derivados (calculados ou estimados pelo sistema):
 *   - delta, gamma, theta, vega — devem declarar proveniência
 *
 * REGRA: se bid/ask não estiver disponível na fonte, deve ser null.
 * Nunca preencher com zero ou com estimativa silenciosa.
 */
export interface OptionContract {
  // ── Identificação ──────────────────────────────────────────
  symbol: string;
  strike: number;
  type: "call" | "put";
  style?: "american" | "european" | null;
  expiration: string; // ISO date "YYYY-MM-DD"
  daysToExpiration: number;

  // ── Dados observados de mercado ────────────────────────────
  /** Último preço negociado. null se não houve negócio recente. */
  last?: number | null;
  /** Melhor oferta de compra no livro. null se livro vazio. */
  bid?: number | null;
  /** Melhor oferta de venda no livro. null se livro vazio. */
  ask?: number | null;
  /** Volume negociado no dia. null se não disponível na fonte. */
  volume?: number | null;
  /** Contratos em aberto. null se não disponível na fonte. */
  openInterest?: number | null;
  /**
   * Volatilidade Implícita. Pode ser observed (lida do provider) ou
   * calculated (derivada de Black-Scholes a partir de bid/ask + spot + DTE).
   * Proveniência obrigatória quando presente.
   */
  impliedVolatility?: {
    value: number | null;
    provenance: FieldProvenance;
  } | null;

  // ── Greeks: sempre com proveniência ───────────────────────
  /**
   * Sensibilidade ao preço do ativo base (Δ).
   * Deve declarar se observed (do provider) ou calculated (modelo + inputs).
   */
  delta?: GreekField | null;
  gamma?: GreekField | null;
  theta?: GreekField | null;
  vega?: GreekField | null;
}

// ─── CONTRATO DE ATM ──────────────────────────────────────────────

/**
 * Define explicitamente qual a metodologia de determinação do ATM.
 * Preservada no snapshot para auditoria histórica.
 *
 * Infinity Trader Y.1 adota:
 *   "nearest-strike" — strike negociável mais próximo do spot observado.
 */
export interface AtmDefinition {
  /** Strike identificado como ATM */
  strike: number;
  /** Spot do ativo base no momento da determinação do ATM */
  spotUsed: number;
  /** ISO timestamp da determinação */
  determinedAt: string;
  /**
   * Convenção utilizada:
   *   "nearest-strike"   — strike negociável mais próximo do spot
   *   "delta-neutral"    — strike com delta mais próximo de 0.50 (requer modelo)
   */
  method: "nearest-strike" | "delta-neutral";
}

// ─── CONTRATO DE IV ATM ───────────────────────────────────────────

export interface ImpliedVolatilityAtm {
  value: number | null;
  provenance: FieldProvenance;
  /**
   * Se calculada, qual strike foi usado como ATM (referência ao AtmDefinition).
   * null se IV ATM não puder ser determinada.
   */
  atmStrikeUsed?: number | null;
}

// ─── CONTRATO DE SKEW ────────────────────────────────────────────

export interface VolatilitySkew {
  /** IV da put OTM de referência */
  putIvOtm: number | null;
  /** IV da call OTM de referência */
  callIvOtm: number | null;
  /** putIvOtm - callIvOtm */
  slope: number | null;
  provenance: FieldProvenance;
  /** Strike da put OTM usada no cálculo */
  putStrikeUsed?: number | null;
  /** Strike da call OTM usada no cálculo */
  callStrikeUsed?: number | null;
  /** Distância percentual do ATM usada para selecionar OTM (ex: 0.05 = 5%) */
  otmDistanceUsed?: number | null;
}

// ─── CONTRATO DE EXPECTED MOVE ────────────────────────────────────

export interface ExpectedMove {
  /** Variação em BRL (R$) para 1 sigma */
  sigma1Brl: number | null;
  lowerBound1Sigma: number | null;
  upperBound1Sigma: number | null;
  provenance: FieldProvenance;
  /** IV usada no cálculo (valor exato, não percentil) */
  ivUsed?: number | null;
  /** Spot usado no cálculo */
  spotUsed?: number | null;
  /** DTE (dias corridos) usado no cálculo */
  dteUsed?: number | null;
  /**
   * Base temporal do DTE:
   *   "calendar"   — dias corridos (padrão B3)
   *   "trading"    — dias úteis
   */
  dteBase?: "calendar" | "trading" | null;
  /**
   * Fórmula utilizada:
   *   "spot-iv-sqrt-t" — Expected Move ≈ Spot × IV × √(T/252)
   */
  formula?: string | null;
}

// ─── CONTEXTO CANÔNICO PRINCIPAL ──────────────────────────────────

export interface MarketContext {
  /**
   * Versão do schema. Permanece 1 enquanto o contrato não tiver
   * breaking changes que invalidem snapshots históricos.
   */
  version: 1;

  instrument: {
    symbol: string;
    market?: string | null;
    assetClass?: "stock" | "option" | "future" | "etf" | "index" | "unknown";
  };

  /** ISO timestamp de captura do contexto */
  timestamp: string;

  /** Proveniência global do contexto */
  provenance: MarketDataProvenance;

  /** Qualidade global do contexto */
  quality: MarketDataQuality;

  // ── Spot Market ─────────────────────────────────────────────
  quote?: {
    last?: number | null;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    previousClose?: number | null;
    bid?: number | null;
    ask?: number | null;
    volume?: number | null;
  } | null;

  candle?: {
    timeframe?: string | null;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
    direction?: "up" | "down" | "neutral" | null;
    body?: number | null;
    upperWick?: number | null;
    lowerWick?: number | null;
  } | null;

  indicators?: {
    vwap?: number | null;
    movingAverages?: Array<{
      period: number;
      type: "SMA" | "EMA";
      value: number | null;
    }>;
    fibonacci?: {
      referenceHigh?: number | null;
      referenceLow?: number | null;
      levels?: Array<{ ratio: number; price: number }>;
    } | null;
  } | null;

  representation?: {
    type?: "candle" | "renko" | null;
    renko?: {
      blockSize?: number | null;
      direction?: "up" | "down" | "neutral" | null;
      sequence?: number | null;
    } | null;
  } | null;

  volatility?: {
    impliedVolatility?: number | null;
    ivRank?: number | null;
    expectedMove?: number | null;
  } | null;

  liquidity?: {
    bidAskSpread?: number | null;
    openInterest?: number | null;
    volume?: number | null;
  } | null;

  // ── Options Chain — Contratos com Proveniência por Campo ───
  /**
   * Cadeia de opções com integridade epistêmica completa.
   *
   * Y.1: Cada campo derivado (IV, Greeks, Skew, Expected Move, ATM)
   * carrega sua própria FieldProvenance para auditabilidade no Replay.
   */
  optionsChain?: {
    expirationDate?: string | null;
    daysToExpiration?: number | null;

    /**
     * Definição explícita do que é "ATM" neste contexto.
     * Congelada no snapshot; futura mudança de convenção não invalida
     * o replay histórico.
     */
    atm?: AtmDefinition | null;

    /**
     * IV ATM com proveniência. Pode ser observed (do provider) ou
     * calculated (Black-Scholes a partir do contrato ATM observado).
     */
    impliedVolatilityAtm?: ImpliedVolatilityAtm | null;

    /** Skew de volatilidade com metodologia e strikes declarados */
    skew?: VolatilitySkew | null;

    /** Expected Move com fórmula, inputs e base temporal declarados */
    expectedMove?: ExpectedMove | null;

    /** Contratos individuais com Greeks auditáveis */
    contracts?: OptionContract[];
  } | null;

  events?: MarketContextEvent[];
  macro?: MarketContextEvent[];
  fundamental?: MarketContextEvent[];
}
