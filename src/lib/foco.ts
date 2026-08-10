export type FocoFuturos = "win" | "wdo";

export const FOCOS_FUTUROS: FocoFuturos[] = ["win", "wdo"];

export const FOCO_INFO: Record<FocoFuturos, { label: string; curto: string; desc: string }> = {
  win: {
    label: "Mini Índice (WIN)",
    curto: "WIN",
    desc: "Ibovespa em pontos — R$ 0,20 por ponto",
  },
  wdo: {
    label: "Mini Dólar (WDO)",
    curto: "WDO",
    desc: "Dólar americano — R$ 10 por ponto",
  },
};

export function padronizarFoco(valor: unknown): FocoFuturos {
  return valor === "wdo" ? "wdo" : "win";
}
