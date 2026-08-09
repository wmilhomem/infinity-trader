import type { Interpretacao } from "@/engines/simulation-interpreter";

export type MercadoFuturo = "WIN" | "WDO";

export type DirecaoFuturo = "comprado" | "vendido";

export type ContratoFuturo = {
  mercado: MercadoFuturo;
  label: string;
  descricao: string;
  valorPonto: number; // R$ por ponto
  tick: number; // menor variação, em pontos
  valorTick: number; // R$ por tick
  margemMinima: number; // R$ por contrato (day trade, mínima B3)
  precoRef: number; // pontos — referência didática, sempre editável
};

export const CONTRATOS_FUTUROS: Record<MercadoFuturo, ContratoFuturo> = {
  WIN: {
    mercado: "WIN",
    label: "Mini índice",
    descricao: "Segue o Ibovespa em escala mini: cada ponto vale R$ 0,20.",
    valorPonto: 0.2,
    tick: 5,
    valorTick: 1,
    margemMinima: 100,
    precoRef: 144000,
  },
  WDO: {
    mercado: "WDO",
    label: "Mini dólar",
    descricao: "Segue o dólar à vista: cada ponto (0,001 de cotação) vale R$ 10.",
    valorPonto: 10,
    tick: 0.5,
    valorTick: 5,
    margemMinima: 150,
    precoRef: 5400,
  },
};

export type TradeFuturo = {
  mercado: MercadoFuturo;
  direcao: DirecaoFuturo;
  entrada: number; // preço de entrada, em pontos
  stop: number; // distância até o stop, em pontos
  contratos: number;
};

export function contrato(m: MercadoFuturo): ContratoFuturo {
  return CONTRATOS_FUTUROS[m];
}

/**
 * Fórmula mecânica: o risco define o tamanho, nunca o contrário.
 * contratos = risco máximo ÷ (stop em pontos × valor do ponto)
 */
export function calcularContratos(
  riscoMax: number,
  stopPontos: number,
  valorPonto: number,
): number {
  const riscoPorContrato = Math.max(0, stopPontos) * valorPonto;
  if (riscoMax <= 0 || riscoPorContrato <= 0) return 0;
  return Math.max(1, Math.floor(riscoMax / riscoPorContrato));
}

export function riscoPorContrato(stopPontos: number, valorPonto: number): number {
  return Math.max(0, stopPontos) * valorPonto;
}

export function riscoReal(t: TradeFuturo): number {
  return riscoPorContrato(t.stop, contrato(t.mercado).valorPonto) * Math.max(1, t.contratos);
}

export function margemEstimada(t: TradeFuturo): number {
  return Math.max(1, t.contratos) * contrato(t.mercado).margemMinima;
}

export function precoStop(t: TradeFuturo): number {
  const raw = t.direcao === "comprado" ? t.entrada - t.stop : t.entrada + t.stop;
  return +raw.toFixed(0);
}

export function lucroPorPonto(t: TradeFuturo): number {
  return contrato(t.mercado).valorPonto * Math.max(1, t.contratos);
}

export function resultadoFuturo(t: TradeFuturo, preco: number): number {
  const sinal = t.direcao === "comprado" ? 1 : -1;
  return sinal * (preco - t.entrada) * lucroPorPonto(t);
}

export function curvaFuturo(t: TradeFuturo, largura = 0.2, steps = 101) {
  const min = t.entrada * (1 - largura);
  const max = t.entrada * (1 + largura);
  const passo = (max - min) / (steps - 1);
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const preco = +(min + i * passo).toFixed(0);
    pts.push({ preco, resultado: +resultadoFuturo(t, preco).toFixed(2) });
  }
  return pts;
}

export function interpretarFuturo(t: TradeFuturo): Interpretacao {
  const c = contrato(t.mercado);
  const n = Math.max(1, t.contratos);
  const comprado = t.direcao === "comprado";
  const palavra = comprado ? "Compra" : "Venda";
  const nome = `${palavra} de ${t.mercado} (${c.label}) · ${n} ${n === 1 ? "contrato" : "contratos"}`;
  const objetivo = comprado ? "alta" : "baixa";
  const risco = riscoReal(t);
  const porPonto = lucroPorPonto(t);
  return {
    nome,
    perfil: "Direcional pura — especulativa e alavancada, sem teto de lucro",
    objetivo,
    objetivoLabel: comprado ? "Ganhar com alta" : "Ganhar com queda",
    complexidade: "iniciante",
    lucroLimitado: false,
    perdaLimitada: true,
    lucroMax: Infinity,
    perdaMax: -risco,
    capitalEmRisco: risco,
    capitalComprometido: margemEstimada(t),
    breakevens: [t.entrada],
    risco: "medio",
    resumo: `Você negocia a variação direta de ${t.mercado}: cada ponto a favor vale R$ ${porPonto.toFixed(2)} e o prejuízo máximo está definido pelo seu stop de ${t.stop} pontos (R$ ${riscoPorContrato(t.stop, c.valorPonto).toFixed(2)} por contrato).`,
    analogia: comprado
      ? "É como acompanhar um placar ao vivo: você compra a variação de cada ponto do índice, como se cada ponto fosse um centavo seu. Se o índice cair até o seu stop, você sai e a perda é o valor que você aceitou antes — nada de esperar 'recuperar' num dia ruim."
      : "É como vender a variação do placar: você ganha se o índice cair. Se ele subir até o seu stop, você sai na hora — o prejuízo é o limite que você definiu antes de entrar.",
    acompanhar: [
      "O preço do seu stop em pontos",
      "O ajuste diário no fim de cada pregão",
      "Notícias e horários do pregão (9h às 18h)",
    ],
  };
}

/** Valida um Json persistido como operação futura (pernas) e devolve o trade. */
export function lerFuturo(val: unknown): TradeFuturo | null {
  if (!val || typeof val !== "object") return null;
  const o = val as Record<string, unknown>;
  if (o.mercado !== "WIN" && o.mercado !== "WDO") return null;
  if (o.direcao !== "comprado" && o.direcao !== "vendido") return null;
  const entrada = typeof o.entrada === "number" && o.entrada > 0 ? o.entrada : null;
  const stop = typeof o.stop === "number" && o.stop > 0 ? o.stop : null;
  const contratos =
    typeof o.contratos === "number" && o.contratos >= 1 ? Math.floor(o.contratos) : null;
  if (entrada === null || stop === null || contratos === null) return null;
  return { mercado: o.mercado, direcao: o.direcao, entrada, stop, contratos };
}
