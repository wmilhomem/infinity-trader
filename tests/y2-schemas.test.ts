/**
 * Y.2.1 — TESTES DE SCHEMAS
 * Rodar com: npx -y vitest run tests/y2-schemas.test.ts
 */
import { describe, test, expect } from "vitest";
import {
  parseAsset,
  parseOptionContract,
  parseOptionChain,
  parseDICurve,
  parseCorporateEvents,
} from "../src/lib/market-data/schemas";

describe("Y.2.1 — schemas", () => {
  describe("parseAsset", () => {
    test("aceita RawAsset válido", () => {
      const result = parseAsset({
        ticker: "PETR4",
        symbol: "PETR4.SA",
        name: "Petrobras PN",
        price: 38.5,
        lastUpdate: 1717000000000,
        realizedVol: 0.25,
        ivRank: 42,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.ticker).toBe("PETR4");
        expect(result.data.price).toBe(38.5);
        expect(result.data.ivRank).toBe(42);
      }
    });

    test("aceita price=0 (zero legítimo preservado)", () => {
      const result = parseAsset({
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 0,
        lastUpdate: 1,
        realizedVol: null,
        ivRank: null,
      });
      expect(result.ok).toBe(true);
    });

    test("aceita realizedVol/ivRank = null (ausente)", () => {
      const result = parseAsset({
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 10,
        lastUpdate: 1,
        realizedVol: null,
        ivRank: null,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.realizedVol).toBeNull();
        expect(result.data.ivRank).toBeNull();
      }
    });

    test("rejeita price negativo", () => {
      const result = parseAsset({
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: -1,
        lastUpdate: 1,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].path).toBe("price");
      }
    });

    test("rejeita price faltando", () => {
      const result = parseAsset({
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        lastUpdate: 1,
      });
      expect(result.ok).toBe(false);
    });

    test("rejeita ivRank > 100", () => {
      const result = parseAsset({
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 10,
        lastUpdate: 1,
        realizedVol: null,
        ivRank: 150,
      });
      expect(result.ok).toBe(false);
    });

    test("rejeita ivRank negativo", () => {
      const result = parseAsset({
        ticker: "X",
        symbol: "X.SA",
        name: "X",
        price: 10,
        lastUpdate: 1,
        ivRank: -5,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("parseOptionContract", () => {
    test("aceita contrato válido com bid/ask/last = null", () => {
      const result = parseOptionContract({
        symbol: "PETR4A123",
        strikePrice: 38,
        right: "C",
        expiration: "2026-12-15",
        bid: null,
        ask: null,
        last: null,
      });
      expect(result.ok).toBe(true);
    });

    test("rejeita strike ≤ 0", () => {
      const result = parseOptionContract({
        symbol: "X",
        strikePrice: 0,
        right: "C",
        expiration: "2026-12-15",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].path).toBe("strikePrice");
      }
    });

    test("rejeita expiration não-ISO", () => {
      const result = parseOptionContract({
        symbol: "X",
        strikePrice: 38,
        right: "C",
        expiration: "15/12/2026",
      });
      expect(result.ok).toBe(false);
    });

    test("rejeita iv > 5 (500%)", () => {
      const result = parseOptionContract({
        symbol: "X",
        strikePrice: 38,
        right: "C",
        expiration: "2026-12-15",
        impliedVolatility: 6,
      });
      expect(result.ok).toBe(false);
    });

    test("aceita iv = 0", () => {
      const result = parseOptionContract({
        symbol: "X",
        strikePrice: 38,
        right: "C",
        expiration: "2026-12-15",
        impliedVolatility: 0,
      });
      expect(result.ok).toBe(true);
    });

    test("rejeita right diferente de C/P", () => {
      const result = parseOptionContract({
        symbol: "X",
        strikePrice: 38,
        right: "X",
        expiration: "2026-12-15",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("parseOptionChain", () => {
    test("aceita chain válida com source yahoo", () => {
      const result = parseOptionChain({
        underlying: "PETR4",
        timestamp: 1,
        source: "yahoo",
        contracts: [],
      });
      expect(result.ok).toBe(true);
    });

    test("aceita chain com source modelo", () => {
      const result = parseOptionChain({
        underlying: "PETR4",
        timestamp: 1,
        source: "modelo",
        contracts: [],
      });
      expect(result.ok).toBe(true);
    });

    test("rejeita source inválido", () => {
      const result = parseOptionChain({
        underlying: "PETR4",
        timestamp: 1,
        source: "random",
        contracts: [],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("parseDICurve", () => {
    test("aceita curva válida", () => {
      const result = parseDICurve([
        { days: 21, rate: 0.1065 },
        { days: 252, rate: 0.108 },
      ]);
      expect(result.ok).toBe(true);
    });

    test("rejeita ponto com days ≤ 0", () => {
      const result = parseDICurve([{ days: 0, rate: 0.1 }]);
      expect(result.ok).toBe(false);
    });

    test("rejeita rate > 1 (100%)", () => {
      const result = parseDICurve([{ days: 21, rate: 1.5 }]);
      expect(result.ok).toBe(false);
    });

    test("rejeita entrada não-array", () => {
      const result = parseDICurve("não-array");
      expect(result.ok).toBe(false);
    });
  });

  describe("parseCorporateEvents", () => {
    test("aceita array vazio", () => {
      const result = parseCorporateEvents([]);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toEqual([]);
    });

    test("filtra eventos inválidos silenciosamente", () => {
      const result = parseCorporateEvents([
        { ticker: "PETR4", type: "DIVIDEND", value: 1.5, exDate: "2026-12-15" },
        { ticker: "INVALIDO" }, // falta campos
        null,
      ]);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.length).toBe(1);
    });
  });
});
