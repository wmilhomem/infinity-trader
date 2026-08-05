import type { IMarketGateway } from "@/market/gateway";
import type {
  RawAsset,
  RawDICurvePoint,
  RawOptionChain,
  RawOptionContract,
} from "@/market/raw-types";
import { blackScholes } from "@/pricing";

/**
 * REAL GATEWAY — Acesso ao mercado brasileiro por fontes públicas verificáveis.
 *
 * - Spot + histórico: Yahoo Finance (v8 chart) — cotações reais da B3 (PETR4.SA).
 * - Chain de opções: Yahoo (v7 options, crumb+cookie) quando entrega o book real;
 *   quando a fonte não expõe o book (hoje, para B3), a chain é MODELADA sobre
 *   o spot REAL e a volatilidade REAL do ativo — e o payload é marcado
 *   `source: "modelo"` para o Confidence Engine auditá-la com honestidade.
 * - Taxa DI: Banco Central (SGS 4391, CDI mensal) anualizada.
 * - Eventos corporativos: nenhuma fonte pública gratuita verificada → vazio.
 *
 * Este arquivo é server-only (nunca importe de componentes React).
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const YAHOO_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

const TTL_MS = 60_000;
const cacheStore = new Map<string, { at: number; value: unknown }>();

async function jsonFetch(
  url: string,
  headers: Record<string, string>,
  retries = 3,
): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    const host = YAHOO_HOSTS[attempt % YAHOO_HOSTS.length];
    const tryUrl = url.includes("finance.yahoo.com")
      ? url.replace(/query\d\.finance\.yahoo\.com/, host)
      : url;
    try {
      const res = await fetch(tryUrl, {
        headers,
        cf: { cacheTtl: 45 },
      } as RequestInit);
      const text = await res.text();
      if (!res.ok || text.startsWith("Edge:") || text.includes("Too Many Requests")) {
        lastErr = new Error(`HTTP ${res.status}`);
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        continue;
      }
      return JSON.parse(text);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("fetch falhou");
}

async function realization<T>(cacheKey: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cacheStore.get(cacheKey);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await fn();
  cacheStore.set(cacheKey, { at: Date.now(), value });
  return value;
}

type VolInfo = { current: number | null; rank: number | null };

/**
 * Percentil da volatilidade realizada (janelas de 20 pregões) — o `ivRank`
 * real do ativo, usado pelo Confidence Engine e pelo modelo de chain.
 */
function realizedVolPercentile(closes: (number | null)[]): VolInfo {
  const px = closes.filter((c): c is number => typeof c === "number" && c > 0);
  if (px.length < 60) return { current: null, rank: null };
  const vols: number[] = [];
  for (let i = 21; i < px.length; i++) {
    let sum = 0;
    let sumSq = 0;
    for (let j = i - 21; j < i; j++) {
      const r = Math.log(px[j + 1] / px[j]);
      sum += r;
      sumSq += r * r;
    }
    const mean = sum / 21;
    const variance = Math.max(0, sumSq / 21 - mean * mean);
    vols.push(Math.sqrt(variance) * Math.sqrt(252));
  }
  if (vols.length < 20) return { current: null, rank: null };
  const current = vols[vols.length - 1];
  const below = vols.filter((v) => v <= current).length;
  return { current, rank: Math.round((below / vols.length) * 100) };
}

function proxVencimentos(quantidade: number): Date[] {
  const out: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= quantidade * 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 15);
    if (d.getDay() === 0) d.setDate(14);
    if (d.getDay() === 6) d.setDate(16);
    out.push(d);
  }
  return out.slice(0, quantidade);
}

/**
 * Modelo de chain: strikes ao redor do spot REAL, prêmios por Black-Scholes
 * com IV ancorada na volatilidade realizada REAL, r = DI real (anualizado).
 * Sempre marcado source: "modelo" — nunca finge ser book.
 */
function modelChain(spot: number, ivAtm: number, diAnnual: number): RawOptionContract[] {
  const step = spot >= 100 ? 5 : 0.5;
  const offset = Math.round(spot / step) * step;
  const strikes = Array.from({ length: 17 }, (_, i) => offset + (i - 8) * step);
  const tYears = 45 / 252;
  const vencer = proxVencimentos(2)[0];
  return strikes.flatMap((strike) => {
    const dist = Math.abs(strike - spot) / spot;
    const skew = strike < spot ? 1.12 : 0.92; // puts OTM mais caras
    const sigma = Math.max(0.15, ivAtm * skew);
    return (["call", "put"] as const).map((tipo) => {
      const mid = blackScholes(tipo, spot, strike, tYears, diAnnual, sigma);
      const spread = 0.012 + dist * 0.3;
      const half = (mid * spread) / 2;
      const bid = Math.max(0.01, mid - half);
      const ask = mid + half;
      return {
        symbol: `${tipo === "call" ? "C" : "P"}${strike.toFixed(2).replace(".", "")}@${vencer.toISOString().slice(0, 10)}`,
        strikePrice: strike,
        right: tipo === "call" ? "C" : "P",
        bid: Number(bid.toFixed(4)),
        ask: Number(ask.toFixed(4)),
        last: Number(mid.toFixed(4)),
        expiration: vencer.toISOString(),
        greeks: {
          delta:
            tipo === "call"
              ? Number((0.5 + dist * 0.4).toFixed(3))
              : Number((-0.5 + dist * 0.4).toFixed(3)),
          gamma: Number((1 / (spot * sigma * Math.sqrt(tYears))).toFixed(6)),
          theta: Number((-mid / tYears / 252).toFixed(5)),
          vega: Number((mid * 0.2).toFixed(5)),
          rho: Number((0.05 * mid).toFixed(5)),
          impliedVolatility: sigma,
        },
      };
    });
  });
}

type YahooOption = {
  contractSymbol?: string;
  strike?: number;
  bid?: number | null;
  ask?: number | null;
  lastPrice?: number;
  expiration?: number;
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
};

type YahooChainResponse = {
  optionChain?: {
    result?: {
      options?: { calls?: YahooOption[]; puts?: YahooOption[] }[];
    }[];
  };
};

type ChartMeta = {
  regularMarketPrice?: number;
  shortName?: string;
  longName?: string;
};

type ChartResult = {
  meta?: ChartMeta;
  indicators?: { quote?: { close?: (number | null)[] }[] };
};

export class RealGateway implements IMarketGateway {
  private crumb: string | null = null;
  private cookie: string | null = null;

  private async session(): Promise<{ crumb: string; cookie: string }> {
    if (this.crumb && this.cookie) return { crumb: this.crumb, cookie: this.cookie };
    const fc = await fetch("https://fc.yahoo.com", { headers: { "user-agent": UA } });
    const cookie = fc.headers.get("set-cookie")?.split(";")[0] ?? "";
    const raw = (await jsonFetch(
      "https://query1.finance.yahoo.com/v1/test/getcrumb",
      {
        "user-agent": UA,
        cookie,
      },
      2,
    )) as string;
    this.crumb = String(raw ?? "");
    this.cookie = cookie;
    return { crumb: this.crumb, cookie };
  }

  async fetchAsset(ticker: string): Promise<RawAsset> {
    return realization(`asset:${ticker}`, TTL_MS, async () => {
      const symbol = ticker.toUpperCase().includes(".") ? ticker : `${ticker.toUpperCase()}.SA`;
      const raw = (await jsonFetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`,
        { "user-agent": UA },
      )) as { chart?: { result?: ChartResult[] } };
      const r = raw?.chart?.result?.[0];
      if (!r?.meta) throw new Error(`Ativo ${symbol} não encontrado`);
      const meta = r.meta;
      const closes = r.indicators?.quote?.[0]?.close ?? [];
      const { current: volAtual, rank: ivRank } = realizedVolPercentile(closes);
      return {
        ticker,
        symbol,
        name: meta.shortName ?? meta.longName ?? ticker,
        price: Number(meta.regularMarketPrice),
        lastUpdate: Date.now(),
        realizedVol: volAtual,
        ivRank,
      };
    });
  }

  async fetchOptionChain(underlying: string): Promise<RawOptionChain> {
    return realization(`chain:${underlying}`, TTL_MS, async () => {
      const symbol = underlying.toUpperCase().includes(".")
        ? underlying
        : `${underlying.toUpperCase()}.SA`;
      const asset = await this.fetchAsset(underlying);

      // 1) Tenta o book REAL do Yahoo (v7 options).
      try {
        const { crumb, cookie } = await this.session();
        const res = (await jsonFetch(
          `https://query1.finance.yahoo.com/v7/finance/options/${symbol}?crumb=${encodeURIComponent(crumb)}`,
          { "user-agent": UA, cookie },
        )) as YahooChainResponse;
        const result = res?.optionChain?.result?.[0];
        const rawOptions = result?.options?.[0];
        const parseYahoo = (
          list: YahooOption[] | undefined,
          right: "C" | "P",
        ): RawOptionContract[] =>
          (list ?? [])
            .filter(
              (c) =>
                c &&
                Number(c.strike) > 0 &&
                Number(c.bid) > 0 &&
                Number(c.ask) > 0 &&
                Number(c.impliedVolatility) > 0,
            )
            .filter((c) => Math.abs(Number(c.strike) - asset.price) / asset.price <= 0.4)
            .map((c) => ({
              symbol: String(c.contractSymbol ?? ""),
              strikePrice: Number(c.strike),
              right,
              bid: Number(c.bid),
              ask: Number(c.ask),
              last: Number(c.lastPrice ?? 0),
              expiration: new Date(Number(c.expiration) * 1000).toISOString(),
              greeks: {
                delta: Number(c.delta ?? 0),
                gamma: Number(c.gamma ?? 0),
                theta: Number(c.theta ?? 0),
                vega: Number(c.vega ?? 0),
                rho: Number(c.rho ?? 0),
                impliedVolatility: Number(c.impliedVolatility),
              },
            }));
        const contracts: RawOptionContract[] = [
          ...parseYahoo(rawOptions?.calls, "C"),
          ...parseYahoo(rawOptions?.puts, "P"),
        ];
        if (contracts.length >= 6) {
          return {
            underlying,
            timestamp: Date.now(),
            source: "yahoo",
            contracts,
          };
        }
      } catch {
        /* cai para o modelo */
      }

      // 2) Book real indisponível → chain MODELADA sobre spot e IV reais.
      const ivAtm = asset.realizedVol ? Math.max(asset.realizedVol, 0.2) : 0.35;
      const di = (await this.fetchDICurve())[1]?.rate ?? 0.11;
      return {
        underlying,
        timestamp: Date.now(),
        source: "modelo",
        contracts: modelChain(asset.price, ivAtm, di),
      };
    });
  }

  async fetchDICurve(): Promise<RawDICurvePoint[]> {
    return realization("di:cdi", 6 * 60 * 60 * 1000, async () => {
      const res = await fetch(
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados/ultimos/13?formato=json",
        { headers: { "user-agent": UA } },
      );
      const dados = (await res.json()) as { valor: string }[];
      let mensais = dados.map((d) => Number(d.valor));
      if (mensais[0] < 0.5) mensais = mensais.slice(1); // mês parcial em andamento
      mensais = mensais.slice(-12);
      const anual = mensais.reduce((acc, m) => acc * (1 + m / 100), 1) - 1;
      return [
        { days: 21, rate: anual },
        { days: 63, rate: anual },
        { days: 126, rate: anual },
        { days: 252, rate: anual },
        { days: 504, rate: anual },
      ];
    });
  }

  async fetchCorporateEvents(_ticker?: string): Promise<unknown[]> {
    return [];
  }
}
