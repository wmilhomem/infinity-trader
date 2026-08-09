import type { Perna } from "@/lib/payoff";

export type HipoteseEstrategia = "alta" | "baixa" | "lateral" | "volatilidade" | "gestao";

export type PresetEstrategia = {
  ativo: string;
  centro: number;
  pernas: Perna[];
  label: string;
  hipotese: HipoteseEstrategia;
  natureza: "debito" | "credito" | "mista";
};

export const PRESETS_ESTRATEGIA: Record<string, PresetEstrategia> = {
  "trava-alta": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 },
      { tipo: "call", acao: "venda", strike: 40, premio: 0.6, quantidade: 100 },
    ],
    label: "Trava de alta",
    hipotese: "alta",
    natureza: "debito",
  },
  "call-sozinha": {
    ativo: "PETR4",
    centro: 38,
    pernas: [{ tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 }],
    label: "Compra de call",
    hipotese: "alta",
    natureza: "debito",
  },
  "trava-baixa": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "put", acao: "compra", strike: 38, premio: 1.3, quantidade: 100 },
      { tipo: "put", acao: "venda", strike: 36, premio: 0.5, quantidade: 100 },
    ],
    label: "Trava de baixa",
    hipotese: "baixa",
    natureza: "debito",
  },
  "put-sozinha": {
    ativo: "PETR4",
    centro: 38,
    pernas: [{ tipo: "put", acao: "compra", strike: 38, premio: 1.3, quantidade: 100 }],
    label: "Compra de put",
    hipotese: "baixa",
    natureza: "debito",
  },
  "iron-condor": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "put", acao: "compra", strike: 34, premio: 0.2, quantidade: 100 },
      { tipo: "put", acao: "venda", strike: 36, premio: 0.5, quantidade: 100 },
      { tipo: "call", acao: "venda", strike: 40, premio: 0.6, quantidade: 100 },
      { tipo: "call", acao: "compra", strike: 42, premio: 0.2, quantidade: 100 },
    ],
    label: "Iron condor",
    hipotese: "lateral",
    natureza: "credito",
  },
  "venda-coberta": {
    ativo: "PETR4",
    centro: 38,
    pernas: [{ tipo: "call", acao: "venda", strike: 40, premio: 0.6, quantidade: 100 }],
    label: "Venda coberta",
    hipotese: "alta",
    natureza: "credito",
  },
  "protective-put": {
    ativo: "PETR4",
    centro: 38,
    pernas: [{ tipo: "put", acao: "compra", strike: 38, premio: 1.3, quantidade: 100 }],
    label: "Protective put",
    hipotese: "baixa",
    natureza: "debito",
  },
  straddle: {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 },
      { tipo: "put", acao: "compra", strike: 38, premio: 1.3, quantidade: 100 },
    ],
    label: "Straddle",
    hipotese: "volatilidade",
    natureza: "debito",
  },
  strangle: {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "call", acao: "compra", strike: 40, premio: 0.6, quantidade: 100 },
      { tipo: "put", acao: "compra", strike: 36, premio: 0.5, quantidade: 100 },
    ],
    label: "Strangle",
    hipotese: "volatilidade",
    natureza: "debito",
  },
};

export function getPreset(id: string): PresetEstrategia | undefined {
  return PRESETS_ESTRATEGIA[id];
}
