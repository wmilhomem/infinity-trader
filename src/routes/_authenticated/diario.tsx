import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({ meta: [{ title: "Diário · Zero ao Trade" }] }),
  validateSearch: z.object({ sim: z.string().optional() }),
  component: Diario,
});

function Diario() {
  const { sim } = Route.useSearch();
  const qc = useQueryClient();

  const entries = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("*, personal_rules(texto,categoria)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const rules = useQuery({
    queryKey: ["rules-active"],
    queryFn: async () => {
      const { data } = await supabase.from("personal_rules").select("*").eq("ativa", true);
      return data ?? [];
    },
  });
  const preSim = useQuery({
    queryKey: ["pre-sim", sim],
    enabled: !!sim,
    queryFn: async () => {
      const { data } = await supabase.from("simulations").select("*").eq("id", sim!).maybeSingle();
      return data;
    },
  });

  const [ativo, setAtivo] = useState("");
  const [estrutura, setEstrutura] = useState("");
  const [motivo, setMotivo] = useState("");
  const [ruleId, setRuleId] = useState<string>("");
  const [seguiu, setSeguiu] = useState<boolean | null>(null);
  const [resultado, setResultado] = useState<string>("");
  const [status, setStatus] = useState<"aberta" | "encerrada">("aberta");

  useEffect(() => {
    if (preSim.data) {
      setAtivo(preSim.data.ativo ?? "");
      setEstrutura(preSim.data.tipo_estrategia ?? "");
    }
  }, [preSim.data]);

  async function save() {
    if (!ativo || !estrutura) return toast.error("Preencha ativo e estrutura");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("diary_entries").insert({
      user_id: u.user.id,
      simulation_id: sim ?? null,
      ativo,
      estrutura,
      motivo,
      rule_id: ruleId || null,
      seguiu_regra: seguiu,
      resultado: resultado ? +resultado : null,
      status,
    });
    if (error) return toast.error(error.message);
    toast.success("Decisão registrada!");
    setAtivo(""); setEstrutura(""); setMotivo(""); setRuleId(""); setSeguiu(null); setResultado(""); setStatus("aberta");
    qc.invalidateQueries();
  }

  return (
    <AppShell title="Diário de decisões">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground mb-3">Nova entrada</div>
          {sim && (
            <div className="mb-3 rounded-md border border-primary/40 bg-primary/10 p-2 text-xs">
              Puxando da simulação #{sim.slice(0, 8)}
            </div>
          )}
          <div className="space-y-3">
            <input
              placeholder="Ativo (ex: PETR4)"
              value={ativo}
              onChange={(e) => setAtivo(e.target.value.toUpperCase())}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm font-mono"
            />
            <input
              placeholder="Estrutura (ex: trava-alta 38/40)"
              value={estrutura}
              onChange={(e) => setEstrutura(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Por quê? (sua tese)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            />
            <select
              value={ruleId}
              onChange={(e) => setRuleId(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="">— Qual regra aplicou? —</option>
              {(rules.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.categoria}] {r.texto}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setSeguiu(true)}
                className={`flex-1 rounded-md border px-3 py-2 text-xs ${seguiu === true ? "border-success bg-success/10 text-success" : "border-border"}`}
              >
                <Check size={12} className="inline mr-1" /> Segui a regra
              </button>
              <button
                onClick={() => setSeguiu(false)}
                className={`flex-1 rounded-md border px-3 py-2 text-xs ${seguiu === false ? "border-loss bg-loss/10 text-loss" : "border-border"}`}
              >
                <X size={12} className="inline mr-1" /> Furei a regra
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="aberta">Aberta</option>
                <option value="encerrada">Encerrada</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Resultado R$ (opcional)"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm font-mono"
              />
            </div>
            <button
              onClick={save}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Registrar decisão
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase text-muted-foreground mb-1">Histórico</div>
          {(entries.data ?? []).map((e: any) => (
            <div key={e.id} className="rounded-md border border-border bg-card p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-mono font-semibold">{e.ativo} · {e.estrutura}</div>
                <div className={`text-xs ${e.status === "encerrada" ? "text-muted-foreground" : "text-primary"}`}>
                  {e.status}
                </div>
              </div>
              {e.motivo && <div className="mt-1 text-xs text-muted-foreground">{e.motivo}</div>}
              {e.personal_rules && (
                <div className="mt-2 text-xs text-primary">
                  [{e.personal_rules.categoria}] {e.personal_rules.texto}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={e.seguiu_regra ? "text-success" : e.seguiu_regra === false ? "text-loss" : "text-muted-foreground"}>
                  {e.seguiu_regra === true ? "✓ Seguiu" : e.seguiu_regra === false ? "✗ Furou" : "—"}
                </span>
                {e.resultado !== null && (
                  <span className={`font-mono font-semibold ${e.resultado >= 0 ? "text-success" : "text-loss"}`}>
                    R$ {Number(e.resultado).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(entries.data ?? []).length === 0 && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma decisão registrada ainda.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
