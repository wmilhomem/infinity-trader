import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/regras")({
  head: () => ({ meta: [{ title: "Regras · Zero ao Trade" }] }),
  component: Regras,
});

const CATEGORIAS = ["risco", "tempo", "rolagem", "disciplina", "trava", "geral"];

function Regras() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("personal_rules")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("risco");

  async function add() {
    if (!texto.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("personal_rules")
      .insert({ user_id: u.user.id, texto: texto.trim(), categoria });
    if (error) return toast.error(error.message);
    setTexto("");
    qc.invalidateQueries({ queryKey: ["rules"] });
    qc.invalidateQueries({ queryKey: ["rules-count"] });
    toast.success("Regra adicionada!");
  }

  async function toggle(id: string, ativa: boolean) {
    await supabase.from("personal_rules").update({ ativa: !ativa }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["rules"] });
  }
  async function remove(id: string) {
    await supabase.from("personal_rules").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["rules"] });
    qc.invalidateQueries({ queryKey: ["rules-count"] });
  }

  return (
    <AppShell title="Minhas regras">
      <p className="mb-6 text-sm text-muted-foreground">
        Suas regras são <span className="text-primary">suas</span>. O copilot vai lembrar delas
        quando você registrar uma decisão — nunca decidir por você.
      </p>

      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <div className="text-xs uppercase text-muted-foreground mb-2">Nova regra</div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex: Nunca aloco mais que 2% em uma estrutura."
          maxLength={280}
          rows={2}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
        />
        <div className="mt-2 flex gap-2">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-md border border-border bg-input px-3 py-2 text-sm"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={add}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {(q.data ?? []).map((r) => (
          <div
            key={r.id}
            className={`flex items-start gap-3 rounded-md border p-4 ${r.ativa ? "border-border bg-card" : "border-border bg-card/40 opacity-60"}`}
          >
            <input type="checkbox" checked={r.ativa} onChange={() => toggle(r.id, r.ativa)} className="mt-1" />
            <div className="flex-1">
              <div className="text-xs uppercase text-primary">{r.categoria}</div>
              <div className="text-sm mt-0.5">{r.texto}</div>
            </div>
            <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-loss">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {(q.data ?? []).length === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma regra ainda. Escreva a primeira acima.
          </div>
        )}
      </div>
    </AppShell>
  );
}
