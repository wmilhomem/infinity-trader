export type Caminho = "opcoes" | "futuros" | "geral";

export const CAMINHOS: Caminho[] = ["opcoes", "futuros", "geral"];

export const CAMINHO_INFO: Record<Caminho, { label: string; curto: string; desc: string }> = {
  opcoes: { label: "Opções", curto: "Opções", desc: "calls e puts (opções da B3)" },
  futuros: { label: "Day trade", curto: "WIN/WDO", desc: "mini índice e mini dólar" },
  geral: { label: "Os dois", curto: "Geral", desc: "opções e day trade" },
};

export function padronizarCaminho(v: unknown): Caminho {
  return v === "opcoes" || v === "futuros" ? v : "geral";
}
