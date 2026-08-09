import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { MessageCircle, Mic, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { moduloAtual, SUGESTOES_GLOBAIS } from "@/lib/modulos-copilot";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type Msg = { id?: string; role: "user" | "assistant"; content: string };

export function CopilotBubble() {
  const { pathname } = useLocation();
  const qc = useQueryClient();
  const modulo = moduloAtual(pathname);
  const moduloId = modulo?.id;
  const oculto = !modulo || modulo.ocultarBubble;

  const [aberto, setAberto] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const moduloIdRef = useRef<string | null>(null);

  const speechIn = useSpeechInput({
    onFinal: (t) => void enviar(t),
  });

  useEffect(() => {
    if (!moduloId) return;
    moduloIdRef.current = moduloId;
    const idSalvo = localStorage.getItem(`zt-bubble-${moduloId}`);
    setThreadId(idSalvo);
    if (idSalvo) {
      supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("thread_id", idSalvo)
        .order("created_at")
        .then(({ data }) => setMessages((data ?? []) as Msg[]));
    } else {
      setMessages([]);
    }
  }, [moduloId]);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (oculto) return null;

  async function enviar(textoOverride?: string) {
    const text = (textoOverride ?? input).trim();
    if (!text || loading || !modulo) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    const proximas = [...messages, userMsg];
    setMessages(proximas);
    setLoading(true);

    try {
      let tid = threadId;
      if (!tid) {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const { data, error } = await supabase
          .from("chat_threads")
          .insert({
            user_id: u.user.id,
            context_type: modulo.id,
            context_ref: pathname,
            titulo: `${modulo.rotulo} · Dúvida da plataforma`,
            contexto: { origem: "bubble", modulo: modulo.id, rota: pathname },
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        tid = data.id;
        setThreadId(tid);
        localStorage.setItem(`zt-bubble-${modulo.id}`, tid);
      }
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          threadId: tid,
          messages: proximas.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { text: reply } = (await res.json()) as { text: string };
      setMessages([...proximas, { role: "assistant", content: reply }]);
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao consultar copilot");
      setMessages(proximas);
    } finally {
      setLoading(false);
    }
  }

  const sugestoes = modulo?.sugestoes.length ? modulo.sugestoes : SUGESTOES_GLOBAIS;

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label="Perguntar ao copilot"
        className="fixed bottom-20 right-4 z-50 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <MessageCircle size={22} />
      </button>
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-sm">
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="text-base">Copilot · {modulo?.rotulo}</SheetTitle>
            <SheetDescription className="text-xs">
              Pergunte sobre a plataforma, uma lição, uma simulação ou suas regras.
            </SheetDescription>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Sugestões para este módulo — toque para perguntar:
                </p>
                {sugestoes.map((s) => (
                  <button
                    key={s}
                    onClick={() => void enviar(s)}
                    disabled={loading}
                    className="block w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={m.id ?? i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div
                  key={m.id ?? i}
                  className="max-w-[92%] text-xs prose prose-invert prose-sm prose-p:my-1.5 prose-strong:text-primary"
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ),
            )}
            {loading && <div className="text-xs italic text-muted-foreground">Pensando…</div>}
          </div>

          {speechIn.erro && <div className="px-4 pb-1 text-[11px] text-loss">{speechIn.erro}</div>}

          {speechIn.gravando ? (
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <button
                onClick={speechIn.cancelar}
                title="Cancelar gravação"
                className="rounded-md bg-accent p-2.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={15} />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-loss/40 bg-loss/10 px-3 py-2 text-xs text-foreground">
                <Mic size={13} className="shrink-0 animate-pulse text-loss" />
                <span className="truncate">
                  {speechIn.interim ? `Ouvindo: ${speechIn.interim}` : "Ouvindo…"}
                </span>
              </div>
              <button
                onClick={speechIn.parar}
                title="Parar e enviar"
                className="rounded-md bg-primary p-2.5 text-primary-foreground"
              >
                <Send size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2 border-t border-border px-4 py-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void enviar();
                  }
                }}
                placeholder="Pergunte…"
                rows={1}
                className="flex-1 resize-none rounded-md border border-border bg-input px-3 py-2 text-xs"
              />
              {speechIn.disponivel && (
                <button
                  onClick={speechIn.iniciar}
                  title="Falar"
                  className="rounded-md bg-accent p-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mic size={15} />
                </button>
              )}
              <button
                onClick={() => void enviar()}
                disabled={loading || !input.trim()}
                className="rounded-md bg-primary p-2.5 text-primary-foreground disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
          )}

          {threadId && (
            <div className="border-t border-border px-4 py-2.5">
              <Link
                to="/copilot/$threadId"
                params={{ threadId }}
                onClick={() => setAberto(false)}
                className="text-xs text-primary hover:underline"
              >
                Abrir conversa completa no Copilot →
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
