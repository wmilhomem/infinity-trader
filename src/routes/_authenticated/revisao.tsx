import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/revisao")({
  head: () => ({ meta: [{ title: "Revisão · Zero ao Trade" }] }),
  component: Revisao,
});

function Revisao() {
  const q = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase.from("diary_entries").select("*");
      return data ?? [];
    },
  });

  const entries = q.data ?? [];
  const encerradas = entries.filter((e) => e.status === "encerrada" && e.resultado !== null);
  const seguiu = encerradas.filter((e) => e.seguiu_regra === true);
  const furou = encerradas.filter((e) => e.seguiu_regra === false);

  const avg = (arr: typeof encerradas) =>
    arr.length ? arr.reduce((s, e) => s + Number(e.resultado || 0), 0) / arr.length : 0;
  const winrate = (arr: typeof encerradas) =>
    arr.length ? (arr.filter((e) => Number(e.resultado || 0) > 0).length / arr.length) * 100 : 0;

  const porEstrategia = Object.entries(
    encerradas.reduce<Record<string, { total: number; ganhos: number; count: number }>>((acc, e) => {
      const k = e.estrutura || "outra";
      acc[k] ??= { total: 0, ganhos: 0, count: 0 };
      acc[k].total += Number(e.resultado || 0);
      acc[k].count++;
      if (Number(e.resultado || 0) > 0) acc[k].ganhos++;
      return acc;
    }, {}),
  ).map(([nome, v]) => ({ nome, resultado: +v.total.toFixed(2), taxa: +((v.ganhos / v.count) * 100).toFixed(0) }));

  return (
    <AppShell title="Revisão do meu histórico">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <KPI label="Total encerradas" value={encerradas.length} />
        <KPI label="Taxa de acerto" value={`${winrate(encerradas).toFixed(0)}%`} />
        <KPI label="Retorno médio" value={`R$ ${avg(encerradas).toFixed(2)}`} accent={avg(encerradas) >= 0 ? "success" : "loss"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-lg border border-success/40 bg-success/5 p-5">
          <div className="text-xs uppercase text-success">Segui a regra</div>
          <div className="mt-1 text-3xl font-bold font-mono">{seguiu.length}</div>
          <div className="mt-2 text-sm">Taxa de acerto: {winrate(seguiu).toFixed(0)}%</div>
          <div className="text-sm">Retorno médio: R$ {avg(seguiu).toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-loss/40 bg-loss/5 p-5">
          <div className="text-xs uppercase text-loss">Furei a regra</div>
          <div className="mt-1 text-3xl font-bold font-mono">{furou.length}</div>
          <div className="mt-2 text-sm">Taxa de acerto: {winrate(furou).toFixed(0)}%</div>
          <div className="text-sm">Retorno médio: R$ {avg(furou).toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-xs uppercase text-muted-foreground mb-3">Por estrutura</div>
        {porEstrategia.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Encerre operações no diário com resultado pra ver o painel.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={porEstrategia}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12 }} />
                <Bar dataKey="resultado">
                  {porEstrategia.map((d, i) => (
                    <Cell key={i} fill={d.resultado >= 0 ? "oklch(0.72 0.18 155)" : "oklch(0.63 0.24 27)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function KPI({ label, value, accent }: { label: string; value: string | number; accent?: "success" | "loss" }) {
  const color = accent === "success" ? "text-success" : accent === "loss" ? "text-loss" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
