import { delta, gamma, theta, vega, rho, blackScholes } from "@/pricing";
import type { Perna } from "@/lib/payoff";
import { interpretar, type Interpretacao } from "./simulation-interpreter";
import { buildThetaCognitiveOverlay } from "./cognitive-overlay";
import { orchestrateStrategy } from "./strategy-intelligence";
import { detectarPadroes } from "./behavior-engine";
import type { Padrao } from "./behavior-engine";
import type { Alerta } from "./rule-engine";
import type { DiaryEntry } from "./types";
import type { VolatilityLanguage, SkewState } from "../volatility/types";
import type { ScoreInput } from "./decision-engine";

// Taxa livre de risco usada nos cálculos didáticos (10% a.a. — cenário B3).
const R_ANUAL = 0.1;

export type LegGreeks = {
  tipo: "call" | "put";
  acao: "compra" | "venda";
  strike: number;
  premio: number;
  delta: number; // contratos-equivalentes (sinal pela posição)
  gamma: number;
  thetaPorDia: number; // R$ por dia (posição inteira)
  vegaPorPonto: number; // R$ por 1 ponto de IV (posição inteira)
  rhoPorPonto: number;
};

export type PositionIntelligence = {
  dias: number;
  iv: number;
  legs: LegGreeks[];
  netDeltaContratos: number;
  netGammaContratos: number;
  netThetaPorDia: number;
  netVegaPorPonto: number;
  netRhoPorPonto: number;
  // As 5 perguntas — resposta em linguagem primeiro, número como suporte.
  tempo: ReturnType<typeof buildThetaCognitiveOverlay>;
  direcao: { pergunta: string; resposta: string; numerico: string };
  gamma: { pergunta: string; resposta: string; numerico: string };
  volatilidade: { pergunta: string; resposta: string; numerico: string };
  juros: { pergunta: string; resposta: string; numerico: string };
  probabilidade: { pergunta: string; resposta: string; expectedMoveBrl: number; pop: number };
  regime: string;
  synthesis: string;
};

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function contratos(p: Perna) {
  return p.quantidade / 100;
}

/**
 * Position Intelligence — o "cérebro" do simulador.
 * Injeta as gregas de cada perna (Black-Scholes), soma as exposições da
 * estrutura e responde as 5 perguntas de decisão ANTES de mostrar números.
 * Também roda o orquestrador completo (PoP, expected move, síntese).
 */
export function computePositionIntelligence(params: {
  pernas: Perna[];
  centro: number;
  ativo: string;
  dias: number;
  iv: number; // em %
  entries: DiaryEntry[];
  alertas: Alerta[];
  userScoreInput: Omit<ScoreInput, "interpretacao">;
}): PositionIntelligence {
  const { pernas, centro, ativo, dias, iv, entries, alertas, userScoreInput } = params;
  const tYears = dias / 252;
  const sigma = iv / 100;

  const legs: LegGreeks[] = pernas.map((p) => {
    const sinal = p.acao === "compra" ? 1 : -1;
    const k = p.quantidade / 100; // contratos
    const d = delta(p.tipo, centro, p.strike, tYears, R_ANUAL, sigma) * sinal;
    const g = gamma(centro, p.strike, tYears, R_ANUAL, sigma) * sinal;
    const th = theta(p.tipo, centro, p.strike, tYears, R_ANUAL, sigma) * sinal * p.quantidade;
    const v = vega(centro, p.strike, tYears, R_ANUAL, sigma) * sinal * p.quantidade;
    const rh = rho(p.tipo, centro, p.strike, tYears, R_ANUAL, sigma) * sinal * p.quantidade;
    return {
      tipo: p.tipo,
      acao: p.acao,
      strike: p.strike,
      premio: p.premio,
      delta: d * k,
      gamma: g * k,
      thetaPorDia: th / 365,
      vegaPorPonto: v,
      rhoPorPonto: rh,
    };
  });

  const sum = (sel: (l: LegGreeks) => number) => legs.reduce((s, l) => s + sel(l), 0);
  const netDeltaContratos = sum((l) => l.delta);
  const netGammaContratos = sum((l) => l.gamma);
  const netThetaPorDia = sum((l) => l.thetaPorDia);
  const netVegaPorPonto = sum((l) => l.vegaPorPonto);
  const netRhoPorPonto = sum((l) => l.rhoPorPonto);

  const padroes: Padrao[] = detectarPadroes(entries.length >= 3 ? entries : []);

  const tempo = buildThetaCognitiveOverlay(netThetaPorDia, dias, padroes, alertas);

  const reagePorR1 = netDeltaContratos * 100;
  const direcao =
    Math.abs(reagePorR1) < 10
      ? {
          pergunta: "Delta — minha posição reage se o ativo subir ou cair?",
          resposta: "Quase não: esta estrutura é pouco sensível ao preço hoje.",
          numerico: `Δ ${reagePorR1.toFixed(0)} por R$ 1`,
        }
      : reagePorR1 > 0
        ? {
            pergunta: "Delta — minha posição reage se o ativo subir ou cair?",
            resposta: `Sim: se ${ativo} andar R$ 1, sua posição se move cerca de ${brl(reagePorR1)} no mesmo dia.`,
            numerico: `Δ ${reagePorR1.toFixed(0)} por R$ 1`,
          }
        : {
            pergunta: "Delta — minha posição reage se o ativo subir ou cair?",
            resposta: `Sim, ao contrário do preço: se ${ativo} cair R$ 1, sua posição ganha cerca de ${brl(-reagePorR1)}.`,
            numerico: `Δ ${reagePorR1.toFixed(0)} por R$ 1`,
          };

  const gammaReage = netGammaContratos * 100;
  const gammaRead =
    Math.abs(gammaReage) < 2
      ? {
          pergunta: "Gamma — essa sensibilidade está mudando rapidamente?",
          resposta:
            "Devagar: com esta janela de tempo, sua sensibilidade ao preço muda pouco a cada andada do ativo. A aceleração forte só aparece perto do vencimento.",
          numerico: `Γ ${gammaReage.toFixed(2)} por R$ 1`,
        }
      : gammaReage > 0
        ? {
            pergunta: "Gamma — essa sensibilidade está mudando rapidamente?",
            resposta:
              "Sim, a seu favor: cada andada do preço aumenta sua sensibilidade na direção do movimento — efeito de posição comprada em opções.",
            numerico: `Γ +${gammaReage.toFixed(2)} por R$ 1`,
          }
        : {
            pergunta: "Gamma — essa sensibilidade está mudando rapidamente?",
            resposta:
              "Sim, contra você: conforme o preço anda, sua sensibilidade cresce na direção oposta — efeito de posição vendida em opções.",
            numerico: `Γ ${gammaReage.toFixed(2)} por R$ 1`,
          };

  const vol5pts = netVegaPorPonto * 5;
  const volatilidade =
    Math.abs(vol5pts) < 5
      ? {
          pergunta: "Vega — estou dependente de mudanças na volatilidade?",
          resposta:
            "Pouco: sua posição quase não sente variações de volatilidade implícita neste cenário.",
          numerico: `Vega ${vol5pts.toFixed(2)} em +5pts`,
        }
      : vol5pts > 0
        ? {
            pergunta: "Vega — estou dependente de mudanças na volatilidade?",
            resposta: `Se a volatilidade subir 5 pontos, sua posição ganha cerca de ${brl(vol5pts)} — comprada em volatilidade.`,
            numerico: `Vega +${vol5pts.toFixed(2)} em +5pts`,
          }
        : {
            pergunta: "Vega — estou dependente de mudanças na volatilidade?",
            resposta: `Se a volatilidade subir 5 pontos, sua posição perde cerca de ${brl(-vol5pts)} — vendida em volatilidade.`,
            numerico: `Vega ${vol5pts.toFixed(2)} em +5pts`,
          };

  const rho5pts = netRhoPorPonto * 5;
  const juros =
    Math.abs(rho5pts) < 5
      ? {
          pergunta: "Rho — alterações na taxa de juros importam para esta posição?",
          resposta:
            "Não na prática: nesta janela de vencimento, o impacto dos juros é desprezível.",
          numerico: `Rho ${rho5pts.toFixed(2)} em +5pts`,
        }
      : {
          pergunta: "Rho — alterações na taxa de juros importam para esta posição?",
          resposta: `Marginalmente: uma alta de 5 pontos na taxa moveria sua posição em cerca de ${brl(rho5pts)}.`,
          numerico: `Rho ${rho5pts.toFixed(2)} em +5pts`,
        };

  // Idioma de volatilidade — honesto: sem histórico real, o que existe é o
  // cenário informado pelo usuário (preenchido com dados B3 no Eixo 3).
  const volLanguage: VolatilityLanguage = {
    resumo: `Cenário com volatilidade informada de ${iv.toFixed(0)}% a.a.`,
    acaoStatus: "neutro",
    detalheIVR: `Você definiu IV de ${iv.toFixed(0)}%. Sem histórico real de mercado, o sistema trata este número como hipótese — o Eixo 3 trará o percentil real.`,
    detalheSuperficie: "Sem superfície de volatilidade disponível nesta fase (dado B3).",
    detalheEvento: null,
  };
  const skew: SkewState = "balanced";

  const intel = orchestrateStrategy(
    pernas,
    centro,
    dias,
    iv,
    netThetaPorDia,
    volLanguage,
    skew,
    userScoreInput,
    ativo,
  );

  const probabilidade = {
    pergunta: "Quanto o mercado precifica de movimento até o vencimento?",
    resposta:
      intel.pop > 0 && intel.pop < 100 && intel.expectedMoveBrl > 0
        ? `O mercado projeta ~68% de chances de ${ativo} andar até ${brl(intel.expectedMoveBrl)} para qualquer lado, e sua estrutura tem PoP matemática de ${Math.round(intel.pop)}%.`
        : `Com IV de ${iv.toFixed(0)}% e ${dias} dias, o movimento esperado é de cerca de ${brl(intel.expectedMoveBrl)} — dentro disso, o tempo trabalha contra prêmios comprados.`,
    expectedMoveBrl: intel.expectedMoveBrl,
    pop: intel.pop,
  };

  return {
    dias,
    iv,
    legs,
    netDeltaContratos,
    netGammaContratos,
    netThetaPorDia,
    netVegaPorPonto,
    netRhoPorPonto,
    tempo,
    direcao,
    gamma: gammaRead,
    volatilidade,
    juros,
    probabilidade,
    regime: intel.riskRegime,
    synthesis: intel.synthesis,
  };
}

/** Prêmio teórico de uma perna hoje (Black-Scholes) para o slider de tempo. */
export function premioTeorico(p: Perna, centro: number, dias: number, iv: number): number {
  const tYears = dias / 252;
  return blackScholes(p.tipo, centro, p.strike, tYears, R_ANUAL, iv / 100);
}

/** Versão reprecificada das pernas com prêmios teóricos do cenário atual. */
export function repricarPernas(pernas: Perna[], centro: number, dias: number, iv: number): Perna[] {
  return pernas.map((p) => ({
    ...p,
    premio: premioTeorico(p, centro, dias, iv),
  }));
}
