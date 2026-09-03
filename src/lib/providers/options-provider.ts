import type { MarketContext } from "../market-context";

/**
 * CONTRATO FUTURO DE MARKET DATA DE OPÇÕES & PROVEDORES DE MERCADO
 *
 * Abstração para fontes de dados de mercado (Mock, Live, Delayed, B3 Provider).
 * Prepara o terreno para a Rodada Y sem acoplar o sistema a uma API específica.
 */

export interface OptionsMarketData {
  underlying?: number | null;
  strike?: number | null;
  bid?: number | null;
  ask?: number | null;
  last?: number | null;

  impliedVolatility?: number | null;

  delta?: number | null;
  gamma?: number | null;
  theta?: number | null;
  vega?: number | null;

  openInterest?: number | null;
  volume?: number | null;

  observedAt?: string | null;
  source?: string | null;
}

export interface MarketDataProvider {
  getContext(instrument: string): Promise<Partial<MarketContext>>;
}
