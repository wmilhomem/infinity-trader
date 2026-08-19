import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, Plus, Trash2, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { HttpGateway } from "@/market/http-gateway";
import { LiveProvider, type ProviderQuote } from "@/market/providers";
import {
  buildPortfolioContext,
  valorarPosicao,
  type PosicaoCarteira,
} from "@/engines/portfolio-engine";

/**
 * Carteira — contexto de exposição para a decisão (Rodada W).
 * Não é um portfolio manager: registra posições manualmente e mostra a
 * exposição ESTIMADA pelo modelo (Black-Scholes) com as cotações do momento.
 * Toda métrica carrega a palavra "estimada" e a proveniência.
 */

export const Route = createFileRoute("/_authenticated/carteira")({
  head: () => ({ meta: [{ title: "Carteira · Zero ao Trade" }] }),
  component: Carteira,
});

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

function Carteira() {
  const qc = useQueryClient();

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

  // form
  const [ativo, setAtivo] = useState("");
  const [lado, setLado] = useState<"comprado" | "vendido">("comprado");
  const [quantidade, setQuantidade] = useState("");
  const [precoEntrada, setPrecoEntrada] = useState("");
  const [tipo, setTipo] = useState<"opcao" | "futuro">("opcao");
  const [opcaoTipo, setOpcaoTipo] = useState<"call" | "put">("call");
  const [strike, setStrike] = useState("");
  const [vencimento, setVencimento] = useState("");

  async function currentUserId() {
    const { data: u } = await supabase.auth.getUser();
    return u.user?.id ?? null;
  }

  async function addPosicao() {
    if (!ativo.trim() || !quantidade || Number(quantidade) <= 0) {
      return toast.error("Preencha ativo e quantidade (em contratos)");
    }
    const uid = await currentUserId();
    if (!uid) return;
    const payload = {
      user_id: uid,
      ativo: ativo.trim().toUpperCase(),
      lado,
      quantidade: Number(quantidade),
      preco_entrada: precoEntrada ? Number(precoEntrada) : null,
      tipo,
      opcao_tipo: tipo === "opcao" ? opcaoTipo : null,
      strike: tipo === "opcao" && strike ? Number(strike) : null,
      vencimento: tipo === "opcao" && vencimento ? vencimento : null,
    };
    const { error } = await supabase.from("portfolio_positions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Posição registrada");
    setAtivo("");
    setQuantidade("");
    setPrecoEntrada("");
    setStrike("");
    setVencimento("");
    qc.invalidateQueries({ queryKey: ["portfolio_positions"] });
  }

  async function remover(id: string) {
    const { error } = await supabase.from("portfolio_positions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["portfolio_positions"] });
  }

  const c = contexto;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Briefcase className="text-primary" /> Carteira
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suas posições dão{" "}
            <span className="font-medium text-foreground">contexto à decisão</span>: o snapshot do
            diário registra a exposição estimada no momento em que você decide.
          </p>
        </div>

        {c && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Exposição estimada (modelo Black-Scholes · não é valor de corretora)
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-background p-3">
                <dt className="text-[11px] text-muted-foreground">Delta líquido</dt>
                <dd className="font-mono font-semibold">
                  {c.netDelta !== null ? c.netDelta.toFixed(2) : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <dt className="text-[11px] text-muted-foreground">Theta / dia</dt>
                <dd className="font-mono font-semibold">
                  {c.netTheta !== null ? `R$ ${c.netTheta.toFixed(2)}` : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <dt className="text-[11px] text-muted-foreground">Vega</dt>
                <dd className="font-mono font-semibold">
                  {c.netVega !== null ? `R$ ${c.netVega.toFixed(2)}` : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <dt className="text-[11px] text-muted-foreground">Margem estimada</dt>
                <dd className="font-mono font-semibold">
                  {c.marginUtilized !== null ? `R$ ${c.marginUtilized.toFixed(0)}` : "—"}
                </dd>
              </div>
            </dl>
            {c.posicoesIgnoradas.length > 0 && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                <TriangleAlert size={13} className="mt-0.5 shrink-0 text-amber-500" />
                {c.posicoesIgnoradas.map((i) => `${i.ativo}: ${i.motivo}`).join(" · ")}
              </p>
            )}
            {c.topAssets.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Concentração: {c.topAssets.join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Nova posição (manual)
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input
              value={ativo}
              onChange={(e) => setAtivo(e.target.value)}
              placeholder="Ativo (ex.: PETR4)"
              className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <input
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Contratos"
              type="number"
              min={1}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "opcao" | "futuro")}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="opcao">Opção</option>
              <option value="futuro">Futuro (WIN/WDO)</option>
            </select>
            <select
              value={lado}
              onChange={(e) => setLado(e.target.value as "comprado" | "vendido")}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="comprado">Comprado</option>
              <option value="vendido">Vendido</option>
            </select>
            {tipo === "opcao" && (
              <>
                <select
                  value={opcaoTipo}
                  onChange={(e) => setOpcaoTipo(e.target.value as "call" | "put")}
                  className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
                <input
                  value={strike}
                  onChange={(e) => setStrike(e.target.value)}
                  placeholder="Strike"
                  type="number"
                  step="0.01"
                  className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  placeholder="Vencimento (aaaa-mm-dd)"
                  className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </>
            )}
            <input
              value={precoEntrada}
              onChange={(e) => setPrecoEntrada(e.target.value)}
              placeholder="Preço de entrada (opcional)"
              type="number"
              step="0.01"
              className="rounded-md border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={addPosicao}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={15} /> Registrar posição
          </button>
        </div>

        <div className="space-y-2">
          {(posicoes.data ?? []).map((p) => {
            const quote = quotes.data?.get(p.ativo) ?? null;
            const v = valorarPosicao(
              {
                id: p.id,
                ativo: p.ativo,
                lado: p.lado,
                quantidade: Number(p.quantidade),
                preco_entrada: p.preco_entrada !== null ? Number(p.preco_entrada) : null,
                tipo: p.tipo,
                opcao_tipo: p.opcao_tipo,
                strike: p.strike !== null ? Number(p.strike) : null,
                vencimento: p.vencimento,
                created_at: p.created_at,
              },
              quote,
            );
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{p.ativo}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {p.tipo === "opcao"
                        ? `${p.opcao_tipo?.toUpperCase()} ${p.strike} @ ${p.vencimento}`
                        : "futuro"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        p.lado === "comprado"
                          ? "bg-success/15 text-success"
                          : "bg-loss/15 text-loss"
                      }`}
                    >
                      {p.lado} · {p.quantidade} contrato(s)
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.preco_entrada !== null
                      ? `Entrada R$ ${p.preco_entrada}`
                      : "Sem preço de entrada"}
                    {v ? (
                      <span className="ml-2 font-mono">
                        Δ {v.delta.toFixed(2)} · Θ R$ {v.thetaPorDia.toFixed(2)}/dia · Vega R${" "}
                        {v.vegaPorPonto.toFixed(2)}
                      </span>
                    ) : (
                      <span className="ml-2 text-amber-500">sem cotações — não valorada</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => remover(p.id)}
                  className="text-muted-foreground hover:text-loss"
                  aria-label="Remover posição"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          {(posicoes.data ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma posição registrada. Sem posições, a decisão é registrada sem exposição (o
              snapshot guarda "não observado", nunca zeros).
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
