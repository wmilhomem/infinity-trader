/**
 * Y.2.4 — TESTES DO YAHOO SOURCE ADAPTER
 */
import { describe, test, expect, vi } from "vitest";
import { YahooSourceAdapter } from "../src/lib/market-data/yahoo-source-adapter";
import type { IMarketGateway } from "../src/market/gateway";

const NOW = "2026-09-02T12:00:00.000Z";
const FUTURE_EXP = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);

function makeGateway(overrides: Partial<IMarketGateway> = {}): IMarketGateway {
  return {
    fetchAsset: vi.fn(async (_ticker) => ({
      ticker: "PETR4",
      symbol: "PETR4.SA",
      name: "Petrobras PN",
      price: 38.5,
      lastUpdate: Date.parse(NOW),
      realizedVol: 0.25,
      ivRank: 42,
    })),
    fetchOptionChain: vi.fn(async (_u) => ({
      underlying: "PETR4",
      timestamp: Date.parse(NOW),
      source: "yahoo",
      contracts: [
        {
          symbol: "PETR4A38",
          strikePrice: 38,
          right: "C",
          expiration: FUTURE_EXP,
          bid: 1.0,
          ask: 1.2,
          last: 1.1,
          impliedVolatility: 0.3,
        },
      ],
    })),
    fetchDICurve: vi.fn(async () => [
      { days: 21, rate: 0.1065 },
      { days: 252, rate: 0.108 },
    ]),
    fetchCorporateEvents: vi.fn(async () => []),
    ...overrides,
  };
}

describe("Y.2.4 — YahooSourceAdapter", () => {
  test("200 OK com dados → availability available", async () => {
    const gw = makeGateway();
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    expect(pkg.availability).toBe("available");
    expect(pkg.source).toBe("yahoo-finance");
    expect(pkg.provider).toBe("yahoo-finance-v8");
    expect(pkg.asset?.value?.price).toBe(38.5);
    expect(pkg.asset?.quality).toBe("valid");
    expect(pkg.optionChain?.value?.contracts.length).toBe(1);
    expect(pkg.diCurve?.value?.points.length).toBe(2);
  });

  test("Yahoo 5xx / timeout em tudo (incl. events) → availability unavailable", async () => {
    const gw = makeGateway({
      fetchAsset: vi.fn(async () => {
        throw new Error("ETIMEDOUT");
      }),
      fetchOptionChain: vi.fn(async () => {
        throw new Error("ETIMEDOUT");
      }),
      fetchDICurve: vi.fn(async () => {
        throw new Error("ETIMEDOUT");
      }),
      fetchCorporateEvents: vi.fn(async () => {
        throw new Error("ETIMEDOUT");
      }),
    });
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    expect(pkg.availability).toBe("unavailable");
    expect(pkg.asset).not.toBeNull();
    expect(pkg.asset?.value).toBeNull();
    expect(pkg.asset?.quality).toBe("absent");
    expect(pkg.asset?.absenceReason).toBe("source-unavailable");
    expect(pkg.optionChain?.quality).toBe("absent");
    expect(pkg.optionChain?.absenceReason).toBe("source-unavailable");
  });

  test("Yahoo 200 OK mas parse falhou (asset missing fields) → schema-error", async () => {
    const gw = makeGateway({
      fetchAsset: vi.fn(async () => ({ ticker: "X" })), // faltam symbol, name, price, lastUpdate
    });
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    // Asset com schema-error; demais OK → partial
    expect(pkg.availability).toBe("partial");
    expect(pkg.asset?.quality).toBe("invalid");
    expect(pkg.asset?.absenceReason).toBe("schema-error");
    expect(pkg.optionChain?.quality).toBe("valid");
  });

  test("Yahoo book indisponível → cai no modelo → source model", async () => {
    const gw = makeGateway({
      fetchOptionChain: vi.fn(async () => ({
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "modelo",
        contracts: [
          {
            symbol: "PETR4A38",
            strikePrice: 38,
            right: "C",
            expiration: FUTURE_EXP,
            bid: 1.0,
            ask: 1.2,
            last: 1.1,
          },
        ],
      })),
    });
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    // Mesmo com chain modelo, se asset é OK, fica partial ou available
    // O source "modelo" é um sinal interno, o pkg.source continua "yahoo-finance"
    expect(pkg.optionChain?.provenance.origin).toBe("calculated");
    expect(pkg.optionChain?.provenance.method).toBe("black-scholes-bsm");
  });

  test("Yahoo não entrega ivRank → not-provided-by-source (não source-unavailable)", async () => {
    const gw = makeGateway({
      fetchAsset: vi.fn(async () => ({
        ticker: "PETR4",
        symbol: "PETR4.SA",
        name: "Petrobras",
        price: 38.5,
        lastUpdate: Date.parse(NOW),
        realizedVol: 0.25,
        ivRank: null, // Yahoo não entrega
      })),
    });
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    expect(pkg.asset?.value?.ivRank).toBeNull();
    expect(pkg.asset?.quality).toBe("absent");
    expect(pkg.asset?.absenceReason).toBe("not-provided-by-source");
    // Diferente de source-unavailable (que é falha de rede)
    expect(pkg.asset?.absenceReason).not.toBe("source-unavailable");
    // pkg ainda é "available" ou "partial" — Yahoo entregou o resto
    expect(pkg.availability).not.toBe("unavailable");
  });

  test("bid > ask em contrato → contrato filtrado, crossed-book em reasons", async () => {
    const gw = makeGateway({
      fetchOptionChain: vi.fn(async () => ({
        underlying: "PETR4",
        timestamp: Date.parse(NOW),
        source: "yahoo",
        contracts: [
          {
            symbol: "BAD",
            strikePrice: 38,
            right: "C",
            expiration: FUTURE_EXP,
            bid: 1.3, // > ask
            ask: 1.2,
            last: 1.25,
          },
          {
            symbol: "OK",
            strikePrice: 40,
            right: "C",
            expiration: FUTURE_EXP,
            bid: 0.5,
            ask: 0.7,
            last: 0.6,
          },
        ],
      })),
    });
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    expect(pkg.optionChain?.value?.contracts.length).toBe(1);
    expect(pkg.optionChain?.reasons).toContain("crossed-book");
  });

  test("parcial: asset OK + DI indisponível → availability partial", async () => {
    const gw = makeGateway({
      fetchDICurve: vi.fn(async () => {
        throw new Error("BCB offline");
      }),
    });
    const adapter = new YahooSourceAdapter(gw);
    const pkg = await adapter.fetchPackage("PETR4");

    expect(pkg.availability).toBe("partial");
    expect(pkg.asset?.quality).toBe("valid");
    expect(pkg.diCurve?.quality).toBe("absent");
    expect(pkg.diCurve?.absenceReason).toBe("source-unavailable");
  });
});
