import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { lerReplay } from "@/engines/replay";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";
import { History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/replay/")({
  head: () => ({
    meta: [
      { title: "Decision Replay · Zero ao Trade" },
      {
        name: "description",
        content:
          "Volte exatamente para cada trade: tela, IV, payoff, emoção, contexto, regras e narrativa do instante da decisão.",
      },
      { property: "og:title", content: "Decision Replay · Zero ao Trade" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Replay,
});

function Replay() {
  const q = useQuery({
    queryKey: ["replay-list"],
    queryFn: async () => {
      const { data: entries } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: memorias } = await supabase
        .from("decision_memory")
        .select("diary_entry_id, contexto")
        .order("created_at", { ascending: false });
      return { entries: entries ?? [], memorias: memorias ?? [] };
    },
  });

  const replays = useMemo(() => {
    const mapa = new Map<string, Json | null>();
    for (const m of q.data?.memorias ?? []) {
      if (m.diary_entry_id && !mapa.has(m.diary_entry_id)) mapa.set(m.diary_entry_id, m.contexto);
    }
    return (q.data?.entries ?? [])
      .map((e) => lerReplay(e, mapa.get(e.id) ?? null))
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [q.data]);

  const dataPt = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AppShell title="Decision Replay">
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Voltar exatamente para um trade. Cada cartão reconstitui o instante da decisão: tela, IV,
        payoff, emoção, contexto, regras e narrativa — como estavam naquele dia.
      </p>

      {replays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhuma decisão com snapshot disponível ainda. Cada registro no diário cria um replay
          automaticamente.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {replays.map((r) => (
            <Link
              key={r.entryId}
              to="/replay/$id"
              params={{ id: r.entryId }}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-sm font-semibold">
                  {r.ativo} · {r.estrutura}
                </div>
                <History size={14} className="text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{dataPt(r.data)}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.score !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[11px]",
                      r.score >= 65
                        ? "bg-success/15 text-success"
                        : r.score >= 40
                          ? "bg-primary/20 text-primary"
                          : "bg-loss/15 text-loss",
                    )}
                  >
                    {r.score}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px]",
                    r.resultado === null
                      ? "bg-muted text-muted-foreground"
                      : r.resultado >= 0
                        ? "bg-success/15 text-success"
                        : "bg-loss/15 text-loss",
                  )}
                >
                  {r.resultado === null ? (r.status ?? "aberta") : `R$ ${r.resultado.toFixed(2)}`}
                </span>
                {r.ivRank !== null && (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    IV {r.ivRank}%
                  </span>
                )}
                {r.pernas && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {r.pernas.length} pernas
                  </span>
                )}
              </div>
              <div className="mt-3 text-xs text-muted-foreground group-hover:text-primary">
                Abrir replay →
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
