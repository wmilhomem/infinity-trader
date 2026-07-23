import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LESSONS, NIVEIS } from "@/lib/lessons";
import { Check, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trilha")({
  head: () => ({ meta: [{ title: "Trilha · Zero ao Trade" }] }),
  component: Trilha,
});

function Trilha() {
  const q = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons_progress").select("*");
      return data ?? [];
    },
  });

  const done = new Set((q.data ?? []).filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const byNivel = LESSONS.reduce<Record<number, typeof LESSONS>>((acc, l) => {
    (acc[l.nivel] ??= []).push(l);
    return acc;
  }, {});

  return (
    <AppShell title="Trilha">
      <p className="mb-6 text-sm text-muted-foreground">
        13 lições + módulo bônus. 80% no quiz destrava a próxima.
      </p>
      {Object.entries(byNivel).map(([nivel, lessons]) => (
        <section key={nivel} className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary/20 text-primary font-mono text-sm font-bold">
              {nivel}
            </div>
            <h2 className="font-semibold">{NIVEIS[Number(nivel) as keyof typeof NIVEIS]}</h2>
          </div>
          <div className="grid gap-2">
            {lessons.map((l) => {
              const isDone = done.has(l.slug);
              return (
                <Link
                  key={l.slug}
                  to="/licao/$slug"
                  params={{ slug: l.slug }}
                  className="flex items-center gap-3 rounded-md border border-border bg-card p-4 hover:border-primary/60"
                >
                  <div
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${isDone ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {isDone ? <Check size={16} /> : <span className="text-sm">{l.ordem}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{l.titulo}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.resumo}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        <Lock size={12} className="inline mr-1" /> Mais lições (Gregas, Iron Condor, Tributação) chegam nas
        próximas releases. Todo o loop de decisão já funciona.
      </div>
    </AppShell>
  );
}
