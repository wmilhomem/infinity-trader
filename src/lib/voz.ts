export function limparTextoParaVoz(texto: string): string {
  return texto
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/R\$\s*([\d.,]+)/g, "$1 reais")
    .replace(/^[-*+]\s+/gm, " ")
    .replace(/[#*_>~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
