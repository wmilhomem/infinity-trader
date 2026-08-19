import { delta, rho, theta, vega } from "@/pricing";
import { CONTRATOS_FUTUROS } from "@/lib/futuros";
import type { ProviderQuote } from "@/market/providers";

/**
 * PORTFOLIO ENGINE (Rodada W) — exposição estimada da carteira no instante.
 * Domínio puro (sem React/Supabase). Regras de honestidade:
 * - Carteira é CONTEXTO da decisão, não um portfolio manager.
 * - Toda métrica é ESTIMADA pelo modelo (Black-Scholes) no momento — nunca
 *   apresentada como verdade absoluta ou valor oficial de corretora.
 * - Posição sem cotações ou sem vencimento não é valorada: entra em
 *   `posicoesIgnoradas` com o motivo. Nunca chute.
 * - Sem posições registradas → contexto null (não observado), nunca zeros.
 */

export type PosicaoCarteira = {
  id: string;
  ativo: string;
  lado: "comprado" | "vendido";
  /** Quantidade em CONTRATOS (1 = 1 contrato de 100 opções / 1 futuro). */
  quantidade: number;
  preco_entrada: number | null;
  tipo: "opcao" | "futuro";
  opcao_tipo: "call" | "put" | null;
  strike: number | null;
  vencimento: string | null; // ISO date
  created_at: string;
};

export type PortfolioContext = {
  source: "manual";
  valuationSource: "modelo";
  valuatedAt: string | null;
  netDelta: number | null; // contratos-equivalentes
  netTheta: number | null; // R$ por dia
  netVega: number | null; // R$ por 1 ponto de IV
  netRho: number | null; // R$ por 1 ponto de taxa
  marginUtilized: number | null; // R$ — estimada (mínima B3 futuros / 20% nocional opções vendidas)
  topAssets: string[];
  posicoesValoradas: number;
  posicoesIgnoradas: { ativo: string; motivo: string }[];
};

const R_ANUAL = 0.1;
const DIAS_PADRAO_OPCAO = 45;

function diasAteVencimento(vencimento: string, agora: Date): number | null {
  const alvo = new Date(`${vencimento}T00:00:00`);
  if (Number.isNaN(alvo.getTime())) return null;
  const dias = (alvo.getTime() - agora.getTime()) / 86_400_000;
  if (dias <= 0) return null; // vencida — não valora posição passada
  return dias;
}

type Valoracao = {
  delta: number;
  thetaPorDia: number;
  vegaPorPonto: number;
  rhoPorPonto: number;
  margem: number;
};

/**
 * Valora uma posição com o quote observado do ativo (ou null quando não
 * há como valorar honestamente). `quantidade` é em contratos.
 */
export function valorarPosicao(
  pos: PosicaoCarteira,
  quote: ProviderQuote | null,
  agora = new Date(),
): Valoracao | null {
  const sinal = pos.lado === "comprado" ? 1 : -1;

  if (pos.tipo === "futuro") {
    const chave = pos.ativo.toUpperCase();
    const c =
      chave in CONTRATOS_FUTUROS
        ? CONTRATOS_FUTUROS[chave as keyof typeof CONTRATOS_FUTUROS]
        : undefined;
    if (!c) return null;
    // Futuro é linear: delta = contratos, gregas temporais = 0 (honesto),
    // margem = mínima B3 por contrato (estimada).
    return {
      delta: sinal * pos.quantidade,
      thetaPorDia: 0,
      vegaPorPonto: 0,
      rhoPorPonto: 0,
      margem: c.margemMinima * pos.quantidade,
    };
  }

  if (pos.strike === null || pos.strike <= 0 || pos.vencimento === null) return null;
  if (!pos.opcao_tipo) return null;
  const dias = diasAteVencimento(pos.vencimento, agora);
  if (dias === null) return null;
  if (!quote || quote.spot <= 0 || quote.ivAtm === null || quote.ivAtm <= 0) return null;

  const tYears = dias / 252;
  const sigma = quote.ivAtm / 100;
  const unidades = pos.quantidade * 100; // contratos → opções
  const tipo = pos.opcao_tipo;

  const d = delta(tipo, quote.spot, pos.strike, tYears, R_ANUAL, sigma) * sinal * pos.quantidade;
  const th = (theta(tipo, quote.spot, pos.strike, tYears, R_ANUAL, sigma) * sinal * unidades) / 365;
  const v = vega(quote.spot, pos.strike, tYears, R_ANUAL, sigma) * sinal * unidades;
  const rh = rho(tipo, quote.spot, pos.strike, tYears, R_ANUAL, sigma) * sinal * unidades;
  const margem = pos.lado === "vendido" ? 0.2 * quote.spot * 100 * pos.quantidade : 0;

  return { delta: d, thetaPorDia: th, vegaPorPonto: v, rhoPorPonto: rh, margem };
}

export function buildPortfolioContext(
  posicoes: PosicaoCarteira[],
  quotesPorAtivo: Map<string, ProviderQuote | null>,
  agora = new Date(),
): PortfolioContext | null {
  if (!posicoes.length) return null;

  const ignoradas: PortfolioContext["posicoesIgnoradas"] = [];
  let delta = 0;
  let theta = 0;
  let vega = 0;
  let rho = 0;
  let margem = 0;
  let valoradas = 0;
  const riscoPorAtivo = new Map<string, number>();

  for (const pos of posicoes) {
    const quote = quotesPorAtivo.get(pos.ativo) ?? null;
    const v = valorarPosicao(pos, quote, agora);
    if (!v) {
      const motivo =
        pos.tipo === "opcao" && (!quote || quote.spot <= 0)
          ? "sem cotações do ativo no momento"
          : pos.tipo === "opcao" &&
              (!pos.vencimento || diasAteVencimento(pos.vencimento, agora) === null)
            ? "sem vencimento válido"
            : pos.tipo === "futuro" && !(pos.ativo.toUpperCase() in CONTRATOS_FUTUROS)
              ? "contrato não reconhecido"
              : "dados incompletos";
      ignoradas.push({ ativo: pos.ativo, motivo });
      continue;
    }
    valoradas++;
    delta += v.delta;
    theta += v.thetaPorDia;
    vega += v.vegaPorPonto;
    rho += v.rhoPorPonto;
    margem += v.margem;
    riscoPorAtivo.set(pos.ativo, (riscoPorAtivo.get(pos.ativo) ?? 0) + Math.abs(v.delta));
  }

  const topAssets = [...riscoPorAtivo.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([a]) => a);

  return {
    source: "manual",
    valuationSource: "modelo",
    valuatedAt: agora.toISOString(),
    netDelta: valoradas > 0 ? delta : null,
    netTheta: valoradas > 0 ? theta : null,
    netVega: valoradas > 0 ? vega : null,
    netRho: valoradas > 0 ? rho : null,
    marginUtilized: valoradas > 0 ? margem : null,
    topAssets,
    posicoesValoradas: valoradas,
    posicoesIgnoradas: ignoradas,
  };
}
