import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  avaliarEstadoMental,
  avaliarIntencao,
  type EstadoMental,
  type MotivoIntencao,
} from "@/engines/intencao";
import type { Json } from "@/integrations/supabase/types";

const ESTADOS: { valor: EstadoMental; label: string }[] = [
  { valor: "tranquilo", label: "Tranquilo" },
  { valor: "cansado", label: "Cansado" },
  { valor: "ansioso", label: "Ansioso" },
  { valor: "frustrado", label: "Frustrado" },
  { valor: "eufórico", label: "Eufórico" },
];

const MOTIVOS: { valor: MotivoIntencao; label: string }[] = [
  { valor: "oportunidade", label: "Vi uma oportunidade" },
  { valor: "rotina", label: "É minha rotina operar" },
  { valor: "recuperar", label: "Quero recuperar uma perda" },
  { valor: "tedio", label: "Estou entediado" },
  { valor: "fomo", label: "Todo mundo está comprando" },
  { valor: "outro", label: "Outro motivo" },
];

const PASSOS = ["Seu estado", "Seu motivo", "Sua regra"];

export function CheckCognitivoModal({
  aberto,
  rules,
  onClose,
}: {
  aberto: boolean;
  rules: { id: string; texto: string }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [passo, setPasso] = useState(0);
  const [emocao, setEmocao] = useState<EstadoMental | null>(null);
  const [motivo, setMotivo] = useState<MotivoIntencao | null>(null);
  const [regraId, setRegraId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!aberto) return null;

  function fechar() {
    setPasso(0);
    setEmocao(null);
    setMotivo(null);
    setRegraId(null);
    onClose();
  }

  async function concluir() {
    if (!emocao || !motivo) return;
    setSalvando(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const sinal = {
        estado: avaliarEstadoMental(emocao),
        intencao: avaliarIntencao(motivo),
      } as Json;
      const { error } = await supabase.from("cheques_cognitivos").insert({
        user_id: u.user.id,
        emocao,
        motivo,
        regra_id: regraId || null,
        sinal,
      });
      if (error) throw error;
      toast.success("Check de 60 segundos concluído.");
      qc.invalidateQueries({ queryKey: ["checks-today"] });
      fechar();
    } catch {
      toast.error("Não consegui registrar o seu check.");
    } finally {
      setSalvando(false);
    }
  }

  const sinalEstado = emocao ? avaliarEstadoMental(emocao) : null;
  const sinalIntencao = motivo ? avaliarIntencao(motivo) : null;
  const pergunta =
    passo === 0
      ? "Como você está chegando no mercado hoje?"
      : passo === 1
        ? "Por que você quer operar hoje?"
        : "Qual regra você não pode quebrar hoje?";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">
            Check · {PASSOS[passo]} ({passo + 1} de {PASSOS.length})
          </div>
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">{pergunta}</h2>

        <div className="mt-5 space-y-2">
          {passo === 0 &&
            ESTADOS.map((o) => (
              <button
                key={o.valor}
                onClick={() => setEmocao(o.valor)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  emocao === o.valor
                    ? "border-primary bg-primary/15 font-medium"
                    : "border-border hover:bg-accent"
                }`}
              >
                {o.label}
              </button>
            ))}

          {passo === 1 &&
            MOTIVOS.map((o) => (
              <button
                key={o.valor}
                onClick={() => setMotivo(o.valor)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  motivo === o.valor
                    ? "border-primary bg-primary/15 font-medium"
                    : "border-border hover:bg-accent"
                }`}
              >
                {o.label}
              </button>
            ))}

          {passo === 2 && (
            <>
              {rules.length === 0 ? (
                <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  Você ainda não tem regras escritas. Escreva a primeira antes de operar — é a única
                  forma de saber se se respeitou ou não.
                </p>
              ) : (
                rules.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRegraId(regraId === r.id ? null : r.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      regraId === r.id
                        ? "border-primary bg-primary/15 font-medium"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {r.texto}
                  </button>
                ))
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          {passo > 0 && (
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
              disabled={passo === 0 ? !emocao : !motivo}
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
              {salvando ? "Registrando…" : "Concluir meu check"}
            </button>
          )}
        </div>

        {(sinalEstado || sinalIntencao) && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {sinalEstado && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{sinalEstado.rotulo}:</span>{" "}
                {sinalEstado.mensagem}
              </p>
            )}
            {sinalIntencao && (
              <p
                className={`text-xs leading-relaxed ${
                  sinalIntencao.severidade === "alerta"
                    ? "text-loss"
                    : sinalIntencao.severidade === "aviso"
                      ? "text-amber-400"
                      : "text-muted-foreground"
                }`}
              >
                <span className="font-semibold">{sinalIntencao.rotulo}:</span>{" "}
                {sinalIntencao.mensagem}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
