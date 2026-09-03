/**
 * Y.2.2 — TESTES DE VALIDADORES
 */
import { describe, test, expect } from "vitest";
import {
  assessBidAsk,
  assessMoneyness,
  assessExpiration,
  assessVolume,
  assessOpenInterest,
  assessIvRank,
  assessImpliedVolatility,
  schemaErrorAssessment,
  combineAssessments,
} from "../src/lib/market-data/validators";

describe("Y.2.2 — validators", () => {
  describe("assessBidAsk", () => {
    test("bid > ask → invalid + crossed-book", () => {
      const r = assessBidAsk(1.3, 1.2);
      expect(r.quality).toBe("invalid");
      expect(r.reasons).toContain("crossed-book");
    });

    test("bid === ask → valid (locked-book)", () => {
      const r = assessBidAsk(1.2, 1.2);
      expect(r.quality).toBe("valid");
    });

    test("spread > 50% → suspicious", () => {
      const r = assessBidAsk(1.0, 1.6); // mid=1.3, spread=0.6 → 46% → valid
      expect(r.quality).toBe("valid");
      const r2 = assessBidAsk(1.0, 2.5); // mid=1.75, spread=1.5 → 86% → suspicious
      expect(r2.quality).toBe("suspicious");
      expect(r2.reasons).toContain("spread > 50%");
    });

    test("spread normal → valid", () => {
      const r = assessBidAsk(1.2, 1.3); // mid=1.25, spread=0.10 → 8%
      expect(r.quality).toBe("valid");
    });

    test("bid null → absent + not-provided-by-source", () => {
      const r = assessBidAsk(null, 1.3);
      expect(r.quality).toBe("absent");
      expect(r.absenceReason).toBe("not-provided-by-source");
    });

    test("ask null → absent + not-provided-by-source", () => {
      const r = assessBidAsk(1.2, null);
      expect(r.quality).toBe("absent");
      expect(r.absenceReason).toBe("not-provided-by-source");
    });
  });

  describe("assessMoneyness", () => {
    test("|strike-spot|/spot > 40% → suspicious", () => {
      const r = assessMoneyness(50, 20); // 150% → suspicious
      expect(r.quality).toBe("suspicious");
      expect(r.reasons).toContain("extreme-moneyness");
    });

    test("ratio 40% exato → valid (boundary)", () => {
      const r = assessMoneyness(28, 20); // 40% → valid (estritamente > 40%)
      expect(r.quality).toBe("valid");
    });

    test("ratio normal → valid", () => {
      const r = assessMoneyness(38, 38.5);
      expect(r.quality).toBe("valid");
    });

    test("spot null → absent", () => {
      const r = assessMoneyness(38, null);
      expect(r.quality).toBe("absent");
    });
  });

  describe("assessExpiration", () => {
    test("expiration passada → invalid + expired", () => {
      const r = assessExpiration("2020-01-01");
      expect(r.quality).toBe("invalid");
      expect(r.reasons).toContain("expired");
    });

    test("expiration futura → valid", () => {
      const future = new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10);
      const r = assessExpiration(future);
      expect(r.quality).toBe("valid");
    });

    test("expiration null → absent", () => {
      const r = assessExpiration(null);
      expect(r.quality).toBe("absent");
      expect(r.absenceReason).toBe("not-provided-by-source");
    });

    test("expiration não-ISO → invalid", () => {
      const r = assessExpiration("15/12/2026");
      expect(r.quality).toBe("invalid");
    });
  });

  describe("assessVolume", () => {
    test("volume < 0 → invalid", () => {
      const r = assessVolume(-1);
      expect(r.quality).toBe("invalid");
      expect(r.reasons).toContain("negative-volume");
    });

    test("volume 0 → valid", () => {
      const r = assessVolume(0);
      expect(r.quality).toBe("valid");
    });

    test("volume null → absent", () => {
      const r = assessVolume(null);
      expect(r.quality).toBe("absent");
    });
  });

  describe("assessOpenInterest", () => {
    test("oi < 0 → invalid", () => {
      const r = assessOpenInterest(-100);
      expect(r.quality).toBe("invalid");
    });

    test("oi null → absent", () => {
      const r = assessOpenInterest(null);
      expect(r.quality).toBe("absent");
    });
  });

  describe("assessIvRank", () => {
    test("closes < 60 → absent + insufficient-history", () => {
      const r = assessIvRank(Array(30).fill(0.2));
      expect(r.quality).toBe("absent");
      expect(r.absenceReason).toBe("insufficient-history");
    });

    test("closes ≥ 60 → valid", () => {
      const r = assessIvRank(Array(120).fill(0.2));
      expect(r.quality).toBe("valid");
    });

    test("closes null → absent + not-provided-by-source", () => {
      const r = assessIvRank(null);
      expect(r.quality).toBe("absent");
      expect(r.absenceReason).toBe("not-provided-by-source");
    });
  });

  describe("assessImpliedVolatility", () => {
    test("iv null → absent", () => {
      const r = assessImpliedVolatility(null);
      expect(r.quality).toBe("absent");
    });

    test("iv 0 → valid", () => {
      const r = assessImpliedVolatility(0);
      expect(r.quality).toBe("valid");
    });

    test("iv > 5 → invalid", () => {
      const r = assessImpliedVolatility(6);
      expect(r.quality).toBe("invalid");
    });

    test("iv negativo → invalid", () => {
      const r = assessImpliedVolatility(-0.1);
      expect(r.quality).toBe("invalid");
    });
  });

  describe("schemaErrorAssessment", () => {
    test("produz invalid + schema-error", () => {
      const r = schemaErrorAssessment(["price inválido"]);
      expect(r.quality).toBe("invalid");
      expect(r.absenceReason).toBe("schema-error");
      expect(r.reasons).toContain("price inválido");
    });
  });

  describe("combineAssessments", () => {
    test("qualquer invalid vence", () => {
      const r = combineAssessments([
        { quality: "valid", reasons: [] },
        { quality: "invalid", reasons: ["crossed-book"] },
        { quality: "absent", reasons: [] },
      ]);
      expect(r.quality).toBe("invalid");
      expect(r.reasons).toContain("crossed-book");
    });

    test("suspicious na ausência de invalid", () => {
      const r = combineAssessments([
        { quality: "valid", reasons: [] },
        { quality: "suspicious", reasons: ["spread > 50%"] },
      ]);
      expect(r.quality).toBe("suspicious");
      expect(r.reasons).toContain("spread > 50%");
    });

    test("todas valid → valid", () => {
      const r = combineAssessments([
        { quality: "valid", reasons: [] },
        { quality: "valid", reasons: [] },
      ]);
      expect(r.quality).toBe("valid");
    });

    test("todas absent → absent", () => {
      const r = combineAssessments([
        { quality: "absent", reasons: [], absenceReason: "not-provided-by-source" },
        { quality: "absent", reasons: [], absenceReason: "insufficient-history" },
      ]);
      expect(r.quality).toBe("absent");
      // Pega o primeiro motivo de ausência não-nulo
      expect(r.absenceReason).toBe("not-provided-by-source");
    });
  });
});
