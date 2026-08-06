import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, X } from "lucide-react";
import { avaliarEstadoMental, type EstadoMental } from "@/engines/intencao";
import { fechamentoDoRitual } from "@/engines/reflexao";

const ESTADOS: { valor: EstadoMental; label: string }[] = [
  { valor: "tranquilo", label: "Tranquilo" },
  { valor: "cansado", label: "Cansado" },
  { valor: "ansioso", label: "Ansioso" },
  { valor: "frustrado", label: "Frustrado" },
  { valor: "eufórico", label: "Eufórico" },
];

const PASSOS = ["Seu fechamento", "Seu dia", "Sua reflexão"];

export function RitualModal({
  aberto,
  temDecisaoHoje,
  checkHoje,
  onClose,
}: {
  aberto: boolean;
  temDecisaoHoje: boolean;
  checkHoje: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [passo, setPasso] = useState(0);
  const [estado, setEstado] = useState<EstadoMental | null>(null);
  const [operou, setOperou] = useState<boolean | null>(null);
  const [conteudo, setConteudo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [fechamento, setFechamento] = useState<ReturnType<typeof fechamentoDoRitual> | null>(null);

  const operouSemRegistro = operou === true && !temDecisaoHoje;

  if (!aberto) return null;

  function fechar() {
    setPasso(0);
    setEstado(null);
    setOperou(null);
    setConteudo("");
    setFechamento(null);
    onClose();
  }

  async function concluir() {
    if (!estado) return;
    setSalvando(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const hoje = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("reflexoes_diarias").upsert(
        {
          user_id: u.user.id,
          data: hoje,
          estado,
          conteudo: conteudo.trim() || "Sem reflexão registrada.",
        },
        { onConflict: "user_id,data" },
      );
      if (error) throw error;
      const leitura = fechamentoDoRitual({
        estado,
        operouHoje: operou === true,
        registrouHoje: operou === true ? temDecisaoHoje : false,
        conteudo,
        checkHoje,
      });
      setFechamento(leitura);
      qc.invalidateQueries({ queryKey: ["reflexao-today"] });
    } catch {
      toast.error("Não consegui registrar o seu ritual.");
    } finally {
      setSalvando(false);
    }
  }

  const sinalEstado = estado ? avaliarEstadoMental(estado) : null;
  const pergunta =
    passo === 0
      ? "Como você está fechando o dia?"
      : passo === 1
        ? "Você operou hoje?"
        : "O que você levou do dia?";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">
            Ritual · {PASSOS[passo]} ({passo + 1} de {PASSOS.length})
          </div>
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {fechamento ? (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
              {fechamento.titulo}
            </h2>
            <p
              className={`mt-3 rounded-lg border p-4 text-sm leading-relaxed ${
                fechamento.tom === "verde"
                  ? "border-success/40 bg-success/5"
                  : fechamento.tom === "amarelo"
                    ? "border-amber-400/40 bg-amber-400/10"
                    : fechamento.tom === "vermelho"
                      ? "border-loss/40 bg-loss/5"
                      : "border-border bg-background"
              }`}
            >
              {fechamento.texto}
            </p>
            <button
              onClick={fechar}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Concluir
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">{pergunta}</h2>

            <div className="mt-5 space-y-2">
              {passo === 0 &&
                ESTADOS.map((o) => (
                  <button
                    key={o.valor}
                    onClick={() => setEstado(o.valor)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      estado === o.valor
                        ? "border-primary bg-primary/15 font-medium"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}

              {passo === 1 &&
                (operouSemRegistro ? (
                  <div className="rounded-lg border border-loss/40 bg-loss/5 p-4">
                    <p className="text-sm leading-relaxed">
                      Você operou hoje, mas a decisão ainda não está no diário. O ritual só fecha
                      quando a decisão tem nome.
                    </p>
                    <button
                      onClick={() => {
                        fechar();
                        navigate({ to: "/diario" });
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Ir para o diário <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => setOperou(null)}
                      className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent"
                    >
                      Voltar
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setOperou(true)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        operou === true
                          ? "border-primary bg-primary/15 font-medium"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Sim, operei
                    </button>
                    <button
                      onClick={() => setOperou(false)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        operou === false
                          ? "border-primary bg-primary/15 font-medium"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Não operei
                    </button>
                  </>
                ))}

              {passo === 2 && (
                <div className="space-y-3">
                  <textarea
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    rows={4}
                    placeholder="Ex.: Hoje vi meu ansioso pedir pra entrar no mercado, e eu não entrei."
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-primary"
                    autoFocus
                  />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Pode ser uma frase só. Se hoje não sobrou nada, também vale deixar em branco.
                  </p>
                </div>
              )}
            </div>

            {sinalEstado && (
              <p
                className={`mt-4 border-t border-border pt-3 text-xs leading-relaxed ${
                  sinalEstado.severidade === "alerta"
                    ? "text-loss"
                    : sinalEstado.severidade === "aviso"
                      ? "text-amber-400"
                      : "text-muted-foreground"
                }`}
              >
                <span className="font-semibold">{sinalEstado.rotulo}:</span> {sinalEstado.mensagem}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              {passo > 0 && !operouSemRegistro && (
                <button
                  onClick={() => setPasso((p) => p - 1)}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent"
                >
                  Voltar
                </button>
              )}
              {passo < 2 ? (
                <button
                  onClick={() => setPasso((p) => p + 1)}
                  disabled={passo === 0 ? !estado : operou === null}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  Continuar
                </button>
              ) : (
                <button
                  onClick={concluir}
                  disabled={salvando}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  {salvando ? "Fechando o dia…" : "Fechar o dia"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
