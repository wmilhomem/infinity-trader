import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RULE_TEMPLATES, STRUCTURED_TEMPLATES } from "@/lib/rule-templates";
import { CAMINHO_INFO, type Caminho } from "@/lib/caminho";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [{ title: "Boas-vindas · Zero ao Trade" }],
  }),
  component: Onboarding,
});

const PERGUNTA_CAMINHO: Record<
  Exclude<Caminho, "geral">,
  {
    titulo: string;
    rotuloNunca: string;
    descNunca: string;
    rotuloSim: string;
    descSim: string;
  }
> = {
  opcoes: {
    titulo: "Você já operou opções?",
    rotuloNunca: "Nunca operei",
    descNunca: "Começo pelo básico (Nível 1).",
    rotuloSim: "Já compro call/put",
    descSim: "Vou direto pro Nível 4 (rolagem e travas).",
  },
  futuros: {
    titulo: "Você já fez day trade?",
    rotuloNunca: "Nunca fiz day trade",
    descNunca: "Começo pelo básico (Nível 1).",
    rotuloSim: "Já opero WIN/WDO",
    descSim: "Vou direto pro Nível 4 — o simulador de futuros já está pronto.",
  },
};

function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [caminho, setCaminho] = useState<Caminho | null>(null);
  const [jaOperou, setJaOperou] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 2, 3]));
  const [selectedStruct, setSelectedStruct] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const pergunta = caminho === "futuros" ? PERGUNTA_CAMINHO.futuros : PERGUNTA_CAMINHO.opcoes;

  async function finish() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("no user");
      const perfil = {
        ja_operou: !!jaOperou,
        onboarded: true,
        nivel_atual: jaOperou ? 4 : 1,
        caminho: caminho ?? "geral",
      };
      const { data: atualizados, error: updateError } = await supabase
        .from("profiles")
        .update(perfil)
        .eq("id", u.user.id)
        .select("id");
      if (updateError) throw updateError;
      if (!atualizados || atualizados.length === 0) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: u.user.id, ...perfil });
        if (insertError) throw insertError;
      }

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
        const { error: rulesError } = await supabase.from("personal_rules").insert(rows as never);
        if (rulesError) throw rulesError;
      }
      qc.invalidateQueries({ queryKey: ["profile"] });
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
        {step === 0 && (
          <>
            <h1 className="text-2xl font-bold">O que você veio aprender e decidir aqui?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso ajusta por onde começamos. Você pode navegar em qualquer área depois.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setCaminho("opcoes")}
                className={`rounded-md border p-4 text-left transition ${caminho === "opcoes" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">Opções</div>
                <div className="text-sm text-muted-foreground">
                  {CAMINHO_INFO.opcoes.desc}. Estruturas, gregas, rolagem.
                </div>
              </button>
              <button
                onClick={() => setCaminho("futuros")}
                className={`rounded-md border p-4 text-left transition ${caminho === "futuros" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">Day trade (WIN/WDO)</div>
                <div className="text-sm text-muted-foreground">
                  {CAMINHO_INFO.futuros.desc}. Dimensionamento, stop, ajuste diário.
                </div>
              </button>
              <button
                onClick={() => setCaminho("geral")}
                className={`rounded-md border p-4 text-left transition ${caminho === "geral" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">Os dois / ainda decidindo</div>
                <div className="text-sm text-muted-foreground">
                  Mostro tudo e você escolhe por onde começa.
                </div>
              </button>
            </div>
            <button
              disabled={caminho === null}
              onClick={() => setStep(1)}
              className="mt-6 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Continuar
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold">{pergunta.titulo}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso muda por onde a gente começa. Você pode navegar em qualquer lição depois.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setJaOperou(false)}
                className={`rounded-md border p-4 text-left transition ${jaOperou === false ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">{pergunta.rotuloNunca}</div>
                <div className="text-sm text-muted-foreground">{pergunta.descNunca}</div>
              </button>
              <button
                onClick={() => setJaOperou(true)}
                className={`rounded-md border p-4 text-left transition ${jaOperou === true ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <div className="font-semibold">{pergunta.rotuloSim}</div>
                <div className="text-sm text-muted-foreground">{pergunta.descSim}</div>
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
            {jaOperou && (
              <div className="mt-6">
                <div className="text-sm font-semibold">Seu setup técnico (opcional)</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Como você já opera, pode já cadastrar indicadores e padrões que usa. O copilot vai
                  lembrar deles — quem decide o significado é você.
                </p>
                <div className="mt-3 grid gap-2 max-h-64 overflow-auto pr-1">
                  {STRUCTURED_TEMPLATES.map((t, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer ${selectedStruct.has(i) ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStruct.has(i)}
                        onChange={(e) => {
                          const s = new Set(selectedStruct);
                          if (e.target.checked) s.add(i);
                          else s.delete(i);
                          setSelectedStruct(s);
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-xs uppercase text-primary">
                          {t.tipo === "indicador_tecnico" ? "indicador" : "padrão"} · {t.categoria}
                        </div>
                        <div className="text-sm">{t.nome}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
