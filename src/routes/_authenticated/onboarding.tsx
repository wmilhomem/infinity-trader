import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RULE_TEMPLATES, STRUCTURED_TEMPLATES } from "@/lib/rule-templates";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [{ title: "Boas-vindas · Zero ao Trade" }],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [jaOperou, setJaOperou] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 2, 3]));
  const [selectedStruct, setSelectedStruct] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("no user");
      await supabase
        .from("profiles")
        .update({ ja_operou: !!jaOperou, onboarded: true, nivel_atual: jaOperou ? 4 : 1 })
        .eq("id", u.user.id);

      const rows: Array<Record<string, unknown>> = [];
      for (const i of selected) {
        rows.push({
          user_id: u.user.id,
          texto: RULE_TEMPLATES[i].texto,
          categoria: RULE_TEMPLATES[i].categoria,
          tipo: "texto",
        });
      }
      if (jaOperou) {
        for (const i of selectedStruct) {
          const t = STRUCTURED_TEMPLATES[i];
          rows.push({
            user_id: u.user.id,
            tipo: t.tipo,
            nome: t.nome,
            categoria: t.categoria,
            texto:
              t.tipo === "indicador_tecnico"
                ? `${t.nome}${t.parametros.periodo ? ` · período ${t.parametros.periodo}` : ""}${t.parametros.timeframe ? ` · ${t.parametros.timeframe}` : ""}`
                : (t.parametros.descricao ?? t.parametros.condicao),
            parametros_json: t.parametros,
          });
        }
      }
      if (rows.length > 0) {
        await supabase.from("personal_rules").insert(rows as never);
      }
      toast.success("Tudo pronto. Bora começar!");
      navigate({ to: "/home", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold">Você já operou opções?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso muda por onde a gente começa. Você pode navegar em qualquer lição depois.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setJaOperou(false)}
                className={`rounded-md border p-4 text-left transition ${jaOperou === false ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">Nunca operei</div>
                <div className="text-sm text-muted-foreground">Começo pelo básico (Nível 1).</div>
              </button>
              <button
                onClick={() => setJaOperou(true)}
                className={`rounded-md border p-4 text-left transition ${jaOperou === true ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">Já compro call/put</div>
                <div className="text-sm text-muted-foreground">Vou direto pro Nível 4 (rolagem e travas).</div>
              </button>
            </div>
            <button
              disabled={jaOperou === null}
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Continuar
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold">Suas primeiras regras</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha regras iniciais. Você pode editar, remover ou criar novas depois — as regras
              são <span className="text-primary">suas</span>, o copilot só te lembra delas.
            </p>
            <div className="mt-4 grid gap-2 max-h-80 overflow-auto pr-1">
              {RULE_TEMPLATES.map((r, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer ${selected.has(i) ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={(e) => {
                      const s = new Set(selected);
                      if (e.target.checked) s.add(i);
                      else s.delete(i);
                      setSelected(s);
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs uppercase text-primary">{r.categoria}</div>
                    <div className="text-sm">{r.texto}</div>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={finish}
              disabled={loading}
              className="mt-6 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {loading ? "Salvando…" : "Começar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
