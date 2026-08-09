import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Headphones, Mic, Send, Volume2, VolumeX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useSpeechOutput } from "@/hooks/useSpeechOutput";

export const Route = createFileRoute("/_authenticated/copilot/$threadId")({
  head: () => ({ meta: [{ title: "Conversa · Zero ao Trade" }] }),
  component: ChatThread,
});

type Msg = { id?: string; role: "user" | "assistant"; content: string };

function ChatThread() {
  const { threadId } = Route.useParams();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [vozAtiva, setVozAtiva] = useState(false);
  const [lendoId, setLendoId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const baseFalaRef = useRef("");
  const vozAtivaRef = useRef(false);

  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profileQ.data?.voz_ativa) {
      setVozAtiva(true);
      vozAtivaRef.current = true;
    }
  }, [profileQ.data]);

  const thread = useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("id", threadId)
        .maybeSingle();
      return data;
    },
  });

  const {
    disponivel: vozDisponivel,
    gravando: gravandoVoz,
    erro: erroVoz,
    iniciar,
    parar,
  } = useSpeechInput({
    onInterim: (t) => setInput(baseFalaRef.current ? `${baseFalaRef.current} ${t}` : t),
    onFinal: (t) => {
      const texto = (baseFalaRef.current ? `${baseFalaRef.current} ${t}` : t).trim();
      setInput(texto);
      if (texto && vozAtivaRef.current) void send(texto);
    },
  });
  const speechOut = useSpeechOutput();

  useEffect(() => {
    if (!speechOut.falando) setLendoId(null);
  }, [speechOut.falando]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("thread_id", threadId)
        .order("created_at");
      if (data) setMessages(data as Msg[]);
    })();
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    const alvoTexto = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      return t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
    };
    const onDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || !vozDisponivel) return;
      if (alvoTexto(e.target)) return;
      e.preventDefault();
      baseFalaRef.current = input;
      iniciar();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      parar();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [vozDisponivel, iniciar, parar, input]);

  async function send(texto?: string) {
    const text = (texto ?? input).trim();
    if (!text || loading) return;
    speechOut.parar();
    setInput("");
    baseFalaRef.current = "";
    const userMsg: Msg = { role: "user", content: text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          threadId,
          messages: nextMsgs.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { text: reply } = (await res.json()) as { text: string };
      const comResposta: Msg[] = [...nextMsgs, { role: "assistant", content: reply }];
      setMessages(comResposta);
      if (vozAtivaRef.current) speechOut.falar(reply);
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao consultar copilot");
      setMessages(nextMsgs);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function toggleVoz() {
    const nova = !vozAtiva;
    setVozAtiva(nova);
    vozAtivaRef.current = nova;
    if (!nova) speechOut.parar();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase
      .from("profiles")
      .update({ voz_ativa: nova, updated_at: new Date().toISOString() })
      .eq("id", user.user.id);
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  function iniciarFala() {
    baseFalaRef.current = input;
    iniciar();
  }

  return (
    <AppShell title={thread.data?.titulo ?? "Conversa"}>
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Copilot · Mentor de decisões
          </div>
          {speechOut.disponivel && (
            <button
              onClick={toggleVoz}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                vozAtiva
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
              title={
                vozAtiva
                  ? "Modo voz ativo: fale e a resposta é lida"
                  : "Ativar conversa por voz (fale, enviamos e lemos a resposta)"
              }
            >
              <Headphones size={13} /> Conversa por voz
            </button>
          )}
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-4">
          {messages.length === 0 && !loading && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Pergunte sobre uma lição, uma simulação ou uma decisão do seu diário.
              {vozDisponivel && " Você também pode falar: segure o microfone ou a tecla Espaço."}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={m.id ?? i} className={m.role === "user" ? "flex justify-end" : "flex gap-2"}>
              {m.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <>
                  <div className="max-w-[80%] text-sm prose prose-invert prose-sm prose-p:my-2 prose-headings:font-semibold prose-strong:text-primary">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  {speechOut.disponivel && (
                    <button
                      onClick={() => {
                        if (lendoId === i) speechOut.parar();
                        else {
                          setLendoId(i);
                          speechOut.falar(m.content);
                        }
                      }}
                      className="mt-1 h-fit shrink-0 rounded-md p-1.5 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
                      title={lendoId === i ? "Parar leitura" : "Ouvir resposta"}
                    >
                      {lendoId === i ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground italic">Pensando…</div>}
        </div>
        {erroVoz && <div className="pb-2 text-xs text-loss">{erroVoz}</div>}
        <div className="border-t border-border pt-3 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Pergunte alguma coisa…"
            rows={2}
            className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm resize-none"
          />
          {vozDisponivel && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                iniciarFala();
              }}
              onMouseUp={parar}
              onMouseLeave={parar}
              onTouchStart={(e) => {
                e.preventDefault();
                iniciarFala();
              }}
              onTouchEnd={parar}
              title="Segure para falar (ou segure Espaço)"
              className={`rounded-md p-3 transition-colors ${
                gravandoVoz
                  ? "bg-loss/20 text-loss animate-pulse"
                  : "bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic size={16} />
            </button>
          )}
          <button
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            className="rounded-md bg-primary p-3 text-primary-foreground disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
