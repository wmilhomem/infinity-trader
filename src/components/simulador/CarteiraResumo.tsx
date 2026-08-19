import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Wallet, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HttpGateway } from "@/market/http-gateway";
import { LiveProvider, type ProviderQuote } from "@/market/providers";
import { buildPortfolioContext, type PosicaoCarteira } from "@/engines/portfolio-engine";

/**
 * CarteiraResumo — exposição estimada no momento da decisão (Rodada W).
 * Aparece no simulador antes da cadeia de evidência: o contexto de carteira
 * entra no snapshot da decisão. Nada aqui é valor de corretora: tudo é
 * estimado pelo modelo com as cotações do momento.
 */

type Row = {
  id: string;
  ativo: string;
  lado: "comprado" | "vendido";
  quantidade: number;
  preco_entrada: number | null;
  tipo: "opcao" | "futuro";
  opcao_tipo: "call" | "put" | null;
  strike: number | null;
  vencimento: string | null;
  created_at: string;
};

const live = new LiveProvider(new HttpGateway());

export function CarteiraResumo() {
  const posicoes = useQuery({
    queryKey: ["portfolio_positions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("portfolio_positions")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as unknown as Row[]) ?? [];
    },
  });

  const ativos = useMemo(
    () => [...new Set((posicoes.data ?? []).map((p) => p.ativo))],
    [posicoes.data],
  );

  const quotes = useQuery({
    queryKey: ["portfolio_quotes", ativos.join(",")],
    enabled: ativos.length > 0,
    queryFn: async () => {
      const entradas = await Promise.all(
        ativos.map(async (a) => [a, await live.fetchQuote(a)] as const),
      );
      return new Map<string, ProviderQuote | null>(entradas);
    },
  });

  const contexto = useMemo(() => {
    const pos: PosicaoCarteira[] = (posicoes.data ?? []).map((r) => ({
      ...r,
      quantidade: Number(r.quantidade),
      preco_entrada: r.preco_entrada !== null ? Number(r.preco_entrada) : null,
      strike: r.strike !== null ? Number(r.strike) : null,
    }));
    return buildPortfolioContext(pos, quotes.data ?? new Map());
  }, [posicoes.data, quotes.data]);

  const c = contexto;

  if (!c) {
    return (
      <p className="text-xs text-muted-foreground">
        Sem posições de carteira registradas — a decisão será registrada sem exposição.
        <Link to="/carteira" className="ml-1 font-medium text-primary hover:underline">
          Registrar na Carteira
        </Link>
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Wallet size={13} /> Exposição da carteira (estimada)
        </p>
        <Link to="/carteira" className="text-[11px] font-medium text-primary hover:underline">
          Carteira →
        </Link>
      </div>
      <dl className="mt-2 grid grid-cols-4 gap-2 text-center">
        <div>
          <dt className="text-[10px] text-muted-foreground">Δ líquido</dt>
          <dd className="font-mono text-sm font-semibold">
            {c.netDelta !== null ? c.netDelta.toFixed(2) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted-foreground">Θ/dia</dt>
          <dd className="font-mono text-sm font-semibold">
            {c.netTheta !== null ? c.netTheta.toFixed(2) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted-foreground">Vega</dt>
          <dd className="font-mono text-sm font-semibold">
            {c.netVega !== null ? c.netVega.toFixed(2) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted-foreground">Margem R$</dt>
          <dd className="font-mono text-sm font-semibold">
            {c.marginUtilized !== null ? c.marginUtilized.toFixed(0) : "—"}
          </dd>
        </div>
      </dl>
      {c.posicoesIgnoradas.length > 0 && (
        <p className="mt-2 flex items-start gap-1 text-[11px] text-muted-foreground">
          <TriangleAlert size={12} className="mt-0.5 shrink-0 text-amber-500" />
          {c.posicoesIgnoradas.map((i) => `${i.ativo} (${i.motivo})`).join(" · ")}
        </p>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground">
        Estimado pelo modelo (Black-Scholes) no momento — não é valor oficial de corretora.
      </p>
    </div>
  );
}
