import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thread = useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      const { data } = await supabase.from("chat_threads").select("*").eq("id", threadId).maybeSingle();
      return data;
    },
  });

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

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
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
      const { text: reply } = await res.json();
      setMessages([...nextMsgs, { role: "assistant", content: reply }]);
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao consultar copilot");
      setMessages(nextMsgs);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <AppShell title={thread.data?.titulo ?? "Conversa"}>
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && !loading && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Pergunte sobre uma lição, uma simulação ou uma decisão do seu diário.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={m.id ?? i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[80%] text-sm prose prose-invert prose-sm prose-p:my-2 prose-headings:font-semibold prose-strong:text-primary">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-sm text-muted-foreground italic">Pensando…</div>
          )}
        </div>
        <div className="border-t border-border pt-3 flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Pergunte alguma coisa…"
            rows={2}
            className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm resize-none"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
