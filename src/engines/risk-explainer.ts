import type { Perna } from "@/lib/payoff";
import { payoffAtPrice } from "@/lib/payoff";
import type { Interpretacao } from "./simulation-interpreter";

export type RiscoItem = { cenario: string; consequencia: string; tom: "ruim" | "neutro" | "bom" };

function brl(v: number) {
  return `R$ ${Math.abs(v).toFixed(2)}`;
}

/** Traduz o payoff em cenários de linguagem simples: "o que pode dar errado?" */
export function explicarRiscos(
  pernas: Perna[],
  centro: number,
  ativo: string,
  i: Interpretacao,
): RiscoItem[] {
  const itens: RiscoItem[] = [];
  const queda = centro * 0.85;
  const alta = centro * 1.15;
  const rQueda = payoffAtPrice(queda, pernas);
  const rAlta = payoffAtPrice(alta, pernas);
  const rParado = payoffAtPrice(centro, pernas);

  itens.push({
    cenario: `Se ${ativo} cair para cerca de R$ ${queda.toFixed(2)} (-15%)`,
    consequencia:
      rQueda < 0
        ? `você perderia aproximadamente ${brl(rQueda)} no vencimento.`
        : `você ainda teria um resultado positivo de cerca de ${brl(rQueda)}.`,
    tom: rQueda < 0 ? "ruim" : "bom",
  });

  itens.push({
    cenario: `Se ${ativo} subir para cerca de R$ ${alta.toFixed(2)} (+15%)`,
    consequencia:
      rAlta < 0
        ? `você perderia aproximadamente ${brl(rAlta)} — esta estrutura sofre com a alta.`
        : i.lucroLimitado
          ? `seu ganho seria de cerca de ${brl(rAlta)}, e não passa de ${brl(Math.max(0, i.lucroMax))} porque você vendeu uma perna que limita a alta.`
          : `seu ganho seria de cerca de ${brl(rAlta)} e continua crescendo se o preço subir mais.`,
    tom: rAlta < 0 ? "ruim" : "bom",
  });

  itens.push({
    cenario: `Se ${ativo} ficar parado perto de R$ ${centro.toFixed(2)} até o vencimento`,
    consequencia:
      rParado < 0
        ? `você perderia cerca de ${brl(rParado)}: o tempo passa e o valor das opções compradas derrete.`
        : `você ficaria com cerca de ${brl(rParado)} — o tempo joga a favor desta estrutura.`,
    tom: rParado < 0 ? "ruim" : "bom",
  });

  if (i.breakevens.length) {
    itens.push({
      cenario: `Ponto de equilíbrio em R$ ${i.breakevens.map((b) => b.toFixed(2)).join(" e R$ ")}`,
      consequencia: `abaixo (ou fora) desse nível no vencimento você não recupera o que pagou.`,
      tom: "neutro",
    });
  }

  if (!i.perdaLimitada) {
    itens.push({
      cenario: "Se o mercado se mover muito contra você",
      consequencia:
        "esta estrutura tem perna vendida sem proteção: a perda não tem teto e a corretora pode exigir margem adicional.",
      tom: "ruim",
    });
  }

  itens.push({
    cenario: "Se a liquidez da série secar",
    consequencia: "pode ser difícil encerrar antes do vencimento pelo preço que você espera.",
    tom: "neutro",
  });

  return itens;
}
