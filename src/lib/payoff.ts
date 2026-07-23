export type Perna = {
  tipo: "call" | "put";
  acao: "compra" | "venda";
  strike: number;
  premio: number;
  quantidade: number;
};

export function payoffAtPrice(precoAtivo: number, pernas: Perna[]): number {
  let total = 0;
  for (const p of pernas) {
    const intr =
      p.tipo === "call" ? Math.max(0, precoAtivo - p.strike) : Math.max(0, p.strike - precoAtivo);
    const perLot = p.acao === "compra" ? intr - p.premio : p.premio - intr;
    total += perLot * p.quantidade;
  }
  return total;
}

export function payoffCurve(pernas: Perna[], centro: number, largura = 0.3, steps = 61) {
  const min = centro * (1 - largura);
  const max = centro * (1 + largura);
  const step = (max - min) / (steps - 1);
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const preco = +(min + i * step).toFixed(2);
    pts.push({ preco, resultado: +payoffAtPrice(preco, pernas).toFixed(2) });
  }
  return pts;
}

export function summary(pernas: Perna[], centro: number) {
  const curve = payoffCurve(pernas, centro, 0.5, 501);
  let max = -Infinity;
  let min = Infinity;
  const breakevens: number[] = [];
  for (let i = 0; i < curve.length; i++) {
    const p = curve[i];
    if (p.resultado > max) max = p.resultado;
    if (p.resultado < min) min = p.resultado;
    if (i > 0 && Math.sign(curve[i - 1].resultado) !== Math.sign(p.resultado)) {
      breakevens.push(+((curve[i - 1].preco + p.preco) / 2).toFixed(2));
    }
  }
  return { lucroMax: max, perdaMax: min, breakevens };
}
