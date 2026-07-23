import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/copilot")({
  head: () => ({ meta: [{ title: "Copilot · Zero ao Trade" }] }),
  component: CopilotIndex,
});

function CopilotIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_threads")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  async function newThread(context: string, ref?: string, titulo?: string) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: u.user.id,
        context_type: context,
        context_ref: ref ?? null,
        titulo: titulo ?? "Nova conversa",
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/copilot/$threadId", params: { threadId: data.id } });
  }

  return (
    <AppShell title="Copilot">
      <p className="mb-6 text-sm text-muted-foreground">
        Uma conversa por contexto: dúvidas de lição, análise de simulação, revisão do diário. O
        copilot só responde com base no que foi ensinado, nas suas regras e no seu histórico —
        nunca opina sobre uma posição real.
      </p>

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <button
          onClick={() => newThread("licao", undefined, "Dúvidas de lição")}
          className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary/60"
        >
          <MessageCircle className="text-primary" size={18} />
          <div className="mt-2 font-semibold">Dúvidas de lição</div>
          <div className="text-xs text-muted-foreground mt-1">Conceito, analogia, exemplo.</div>
        </button>
        <button
          onClick={() => newThread("simulacao", undefined, "Análise de simulação")}
          className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary/60"
        >
          <MessageCircle className="text-primary" size={18} />
          <div className="mt-2 font-semibold">Analisar simulação</div>
          <div className="text-xs text-muted-foreground mt-1">Por que meu lucro máximo é X?</div>
        </button>
        <button
          onClick={() => newThread("diario", undefined, "Revisar decisões")}
          className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary/60"
        >
          <MessageCircle className="text-primary" size={18} />
          <div className="mt-2 font-semibold">Revisar diário</div>
          <div className="text-xs text-muted-foreground mt-1">Padrões do seu próprio histórico.</div>
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase text-muted-foreground">Conversas</div>
        <button
          onClick={() => newThread("geral")}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus size={12} /> Nova
        </button>
      </div>
      <div className="space-y-2">
        {(threads.data ?? []).map((t) => (
          <Link
            key={t.id}
            to="/copilot/$threadId"
            params={{ threadId: t.id }}
            className="block rounded-md border border-border bg-card p-3 hover:border-primary/60"
          >
            <div className="text-sm font-medium">{t.titulo}</div>
            <div className="text-xs text-muted-foreground">
              [{t.context_type}] · {new Date(t.updated_at).toLocaleString("pt-BR")}
            </div>
          </Link>
        ))}
        {(threads.data ?? []).length === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma conversa. Abra uma acima.
          </div>
        )}
      </div>
    </AppShell>
  );
}
