import type { DiaryEntry } from "./types";
import { obj, num } from "./decision-memory-reader";

/**
 * BEHAVIOR FORECAST — não prevê PETR4; prevê você.
 * Estimativa estatística do seu próprio histórico: a chance de você operar
 * maior do que o seu tamanho habitual hoje. Honesta por construção: o
 * modelo não enxerga o mercado — enxerga os seus padrões.
 */

export type FatorForecast = {
  rotulo: string;
  impacto: number;
};

export type Forecast = {
  probabilidade: number;
  rotulo: string;
  fatores: FatorForecast[];
  base: string;
};

const EMOCOES_IMPULSIVAS = new Set(["eufórico", "com pressa", "com medo"]);

export function tamanhoPosicao(e: DiaryEntry): number | null {
  const i = obj(e.interpretacao);
  return num(i?.capitalEmRisco);
}

function ordenadas(entries: DiaryEntry[]) {
  return [...entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function media(vals: number[]): number | null {
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function preverTamanhoPosicao(entries: DiaryEntry[], hoje = new Date()): Forecast | null {
  const comTamanho = ordenadas(entries).filter((e) => tamanhoPosicao(e) !== null);
  if (comTamanho.length < 5) return null;

  const tamanhos = comTamanho.map((e) => tamanhoPosicao(e) as number);
  const mGeral = media(tamanhos) as number;
  const limiar = mGeral * 1.15;

  const fatores: FatorForecast[] = [];
  let prob = 0;

  // 1) Base: com que frequência você opera acima da sua média?
  const acima = tamanhos.filter((t) => t > limiar).length;
  const basePct = (acima / tamanhos.length) * 100;
  const basePts = Math.round(basePct * 0.3);
  prob += basePts;
  if (basePts >= 5) {
    fatores.push({
      rotulo: `Base do seu histórico: ${acima} de ${tamanhos.length} operações foram maiores que a sua média.`,
      impacto: basePts,
    });
  }

  // 2) Tendência: a metade recente está operando maior?
  const meio = Math.ceil(comTamanho.length / 2);
  const mAntes = media(tamanhos.slice(0, meio));
  const mAgora = media(tamanhos.slice(meio));
  if (mAntes && mAgora && mAgora > mAntes * 1.25) {
    prob += 15;
    fatores.push({
      rotulo: `Tendência: suas últimas decisões operam ${Math.round((mAgora / mAntes - 1) * 100)}% maior que antes.`,
      impacto: 15,
    });
  }

  // 3) Hoje é o seu dia de risco? (padrão por dia da semana)
  const porDia = new Map<number, number[]>();
  for (const e of comTamanho) {
    const d = new Date(e.created_at).getDay();
    porDia.set(d, [...(porDia.get(d) ?? []), tamanhoPosicao(e) as number]);
  }
  const diaHoje = hoje.getDay();
  const mediaDiaHoje = media(porDia.get(diaHoje) ?? []);
  if (
    mediaDiaHoje !== null &&
    mediaDiaHoje > mGeral * 1.25 &&
    (porDia.get(diaHoje) ?? []).length >= 2
  ) {
    prob += 15;
    fatores.push({
      rotulo:
        "Hoje é o seu dia de risco: historicamente você opera maior às " +
        (["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"][diaHoje] ??
          "") +
        ".",
      impacto: 15,
    });
  }

  // 4) Tilt: perdas seguidas costumam preceder tamanho maior?
  const ultimasComResultado = [...comTamanho].reverse().filter((e) => e.resultado !== null);
  if (
    ultimasComResultado.length >= 2 &&
    ultimasComResultado[0].resultado! < 0 &&
    ultimasComResultado[1].resultado! < 0
  ) {
    prob += 12;
    fatores.push({
      rotulo: "Tilt: duas perdas seguidas em seu histórico aumentam o tamanho da próxima operação.",
      impacto: 12,
    });
  }

  // 5) Emoção: a última decisão foi tomada em estado impulsivo?
  const ultima = comTamanho[comTamanho.length - 1];
  if (ultima?.emocao && EMOCOES_IMPULSIVAS.has(ultima.emocao)) {
    prob += 10;
    fatores.push({
      rotulo: `Sua última decisão foi registrada em estado "${ultima.emocao}" — em seu histórico isso amplia o tamanho.`,
      impacto: 10,
    });
  }

  prob = Math.min(95, Math.round(prob));

  const rotulo =
    prob >= 60
      ? `Hoje existe ${prob}% de chance de você operar maior do que costuma operar.`
      : prob >= 40
        ? `Hoje existe ${prob}% de chance de você operar maior do que costuma operar. Nível de atenção.`
        : `Hoje existe ${prob}% de chance de você operar maior do que costuma operar. Cenário calmo.`;

  return {
    probabilidade: prob,
    rotulo,
    fatores,
    base: "Estimativa do seu próprio histórico — não do mercado. Quanto mais decisões você registra, mais precisa ela fica.",
  };
}
