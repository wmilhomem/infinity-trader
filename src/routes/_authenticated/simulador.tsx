import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BookOpen,
  Info,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import type { Perna } from "@/lib/payoff";
import { payoffCurve, summary } from "@/lib/payoff";
import { checarRegras, lerEstrategia, type RegraSimples } from "@/lib/strategy-read";

export const Route = createFileRoute("/_authenticated/simulador")({
  head: () => ({ meta: [{ title: "Simulador · Zero ao Trade" }] }),
  component: Simulador,
});

const PRESETS: Record<string, { ativo: string; centro: number; pernas: Perna[] }> = {
  "trava-alta": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 },
      { tipo: "call", acao: "venda", strike: 40, premio: 0.6, quantidade: 100 },
    ],
  },
  "call-sozinha": {
    ativo: "PETR4",
    centro: 38,
    pernas: [{ tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 }],
  },
  "trava-baixa": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "put", acao: "compra", strike: 38, premio: 1.3, quantidade: 100 },
      { tipo: "put", acao: "venda", strike: 36, premio: 0.5, quantidade: 100 },
    ],
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
  },
};

function Simulador() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [preset, setPreset] = useState<keyof typeof PRESETS>("trava-alta");
  const [ativo, setAtivo] = useState("PETR4");
  const [centro, setCentro] = useState(38);
  const [pernas, setPernas] = useState<Perna[]>(PRESETS["trava-alta"].pernas);

  function loadPreset(k: keyof typeof PRESETS) {
    setPreset(k);
    setAtivo(PRESETS[k].ativo);
    setCentro(PRESETS[k].centro);
    setPernas(PRESETS[k].pernas.map((p) => ({ ...p })));
  }

  function updatePerna(i: number, patch: Partial<Perna>) {
    setPernas(pernas.map((p, j) => (i === j ? { ...p, ...patch } : p)));
  }

  const curve = useMemo(() => payoffCurve(pernas, centro, 0.3, 61), [pernas, centro]);
  const stats = useMemo(() => summary(pernas, centro), [pernas, centro]);
  const leitura = useMemo(() => lerEstrategia(pernas, centro, ativo), [pernas, centro, ativo]);

  const regras = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await supabase.from("personal_rules").select("id, texto, nome, ativa, tipo");
      return (data as unknown as RegraSimples[]) ?? [];
    },
  });

  const alertas = useMemo(
    () => checarRegras(pernas, regras.data ?? [], leitura),
    [pernas, regras.data, leitura],
  );

  const [explicar, setExplicar] = useState(false);
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const checklist = [
    { k: "simulei", label: "Simulei esta estrutura" },
    { k: "perda", label: `Entendi a perda máxima (R$ ${leitura.capitalEmRisco.toFixed(2)})` },
    {
      k: "be",
      label: `Entendi o breakeven (${leitura.breakevens.length ? leitura.breakevens.map((b) => b.toFixed(2)).join(" / ") : "—"})`,
    },
    { k: "regra", label: "Minha regra permite esta operação" },
  ];
  const checkOk = checklist.every((c) => check[c.k]);

  async function perguntarCopilot() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: u.user.id,
        context_type: "simulacao",
        titulo: `${leitura.nome} · ${ativo}`,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/copilot/$threadId", params: { threadId: data.id } });
  }

  async function salvar() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("simulations")
      .insert({
        user_id: u.user.id,
        tipo_estrategia: preset,
        ativo,
        preco_atual: centro,
        pernas: pernas as any,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    toast.success("Decisão registrada — continue no diário.");
    qc.invalidateQueries();
    navigate({ to: "/diario", search: { sim: data.id } as any });
  }


  return (
    <AppShell title="Simulador de payoff">
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
          <button
            key={k}
            onClick={() => loadPreset(k)}
            className={`rounded-full border px-3 py-1 text-xs ${preset === k ? "border-primary bg-primary/20 text-primary" : "border-border hover:bg-accent"}`}
          >
            {k.replaceAll("-", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted-foreground">
              Ativo
              <input
                value={ativo}
                onChange={(e) => setAtivo(e.target.value.toUpperCase())}
                className="ml-2 w-24 rounded-md border border-border bg-input px-2 py-1 text-sm font-mono"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Preço atual
              <input
                type="number"
                step="0.1"
                value={centro}
                onChange={(e) => setCentro(+e.target.value || 0)}
                className="ml-2 w-24 rounded-md border border-border bg-input px-2 py-1 text-sm font-mono"
              />
            </label>
          </div>

          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={curve}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pl" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="oklch(0.63 0.24 27)" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="oklch(0.63 0.24 27)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="preco" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12 }}
                  formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Resultado"]}
                  labelFormatter={(l) => `Preço: R$ ${l}`}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
                <ReferenceLine x={centro} stroke="oklch(0.78 0.17 65)" strokeDasharray="4 4" label={{ value: "atual", position: "top", fill: "oklch(0.78 0.17 65)", fontSize: 10 }} />
                {stats.breakevens.map((b) => (
                  <ReferenceLine key={b} x={b} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 2" label={{ value: `BE ${b}`, position: "insideTopRight", fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                ))}
                <Area type="monotone" dataKey="resultado" stroke="oklch(0.72 0.18 155)" fill="url(#pg)" baseValue={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Lucro máximo</div>
              <div className="mt-1 font-mono font-bold text-success">R$ {stats.lucroMax.toFixed(2)}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Perda máxima</div>
              <div className="mt-1 font-mono font-bold text-loss">R$ {stats.perdaMax.toFixed(2)}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Breakeven(s)</div>
              <div className="mt-1 font-mono">
                {stats.breakevens.length ? stats.breakevens.map((b) => b.toFixed(2)).join(" / ") : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {pernas.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase text-muted-foreground">Perna {i + 1}</div>
                <button onClick={() => setPernas(pernas.filter((_, j) => j !== i))}>
                  <Trash2 size={14} className="text-muted-foreground hover:text-loss" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={p.acao}
                  onChange={(e) => updatePerna(i, { acao: e.target.value as any })}
                  className="rounded border border-border bg-input px-2 py-1"
                >
                  <option value="compra">Compra</option>
                  <option value="venda">Venda</option>
                </select>
                <select
                  value={p.tipo}
                  onChange={(e) => updatePerna(i, { tipo: e.target.value as any })}
                  className="rounded border border-border bg-input px-2 py-1"
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
                <label>
                  Strike
                  <input
                    type="number"
                    step="0.5"
                    value={p.strike}
                    onChange={(e) => updatePerna(i, { strike: +e.target.value || 0 })}
                    className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                  />
                </label>
                <label>
                  Prêmio
                  <input
                    type="number"
                    step="0.05"
                    value={p.premio}
                    onChange={(e) => updatePerna(i, { premio: +e.target.value || 0 })}
                    className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                  />
                </label>
                <label className="col-span-2">
                  Qtd
                  <input
                    type="number"
                    step="100"
                    value={p.quantidade}
                    onChange={(e) => updatePerna(i, { quantidade: +e.target.value || 0 })}
                    className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              pernas.length < 4 &&
              setPernas([...pernas, { tipo: "call", acao: "compra", strike: centro, premio: 1, quantidade: 100 }])
            }
            disabled={pernas.length >= 4}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-accent disabled:opacity-40"
          >
            <Plus size={14} /> Nova perna ({pernas.length}/4)
          </button>
          <button
            onClick={salvar}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Salvar → registrar no diário
          </button>
        </div>
      </div>
    </AppShell>
  );
}
