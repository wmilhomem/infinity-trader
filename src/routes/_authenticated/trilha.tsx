import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LESSONS, NIVEIS, NIVEIS_DESC, nivelLabel, type LessonNivel } from "@/lib/lessons";
import { getLessonMeta } from "@/lib/lesson-meta";
import { useCaminho } from "@/lib/use-caminho";
import { ArrowRight, Check, Clock, Lock, Play } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trilha")({
  head: () => ({ meta: [{ title: "Trilha · Zero ao Trade" }] }),
  component: Trilha,
});

function NivelBoxes({
  nivel,
  doneInNivel,
  totalInNivel,
}: {
  nivel: LessonNivel;
  doneInNivel: number;
  totalInNivel: number;
}) {
  const boxes = 10;
  const filled = totalInNivel === 0 ? 0 : Math.round((doneInNivel / totalInNivel) * boxes);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
        {nivelLabel(nivel)}
      </span>
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: boxes }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-1.5 rounded-[2px] ${i < filled ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        {doneInNivel}/{totalInNivel}
      </span>
    </div>
  );
}

function Trilha() {
  const { caminho } = useCaminho();
  const q = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons_progress").select("*");
      return data ?? [];
    },
  });

  const done = new Set((q.data ?? []).filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const byNivel = LESSONS.reduce<Record<LessonNivel, typeof LESSONS>>(
    (acc, l) => {
      (acc[l.nivel] ??= []).push(l);
      return acc;
    },
    { 1: [], 2: [], 3: [], 4: [], 5: [], pratica: [] },
  );
  const proxima = LESSONS.find((l) => !done.has(l.slug));
  const proximaMeta = proxima ? getLessonMeta(proxima.slug) : null;

  const futuros = caminho === "futuros";

  return (
    <AppShell title="Trilha">
      {futuros ? (
        <div className="mb-8 rounded-2xl border-2 border-primary/50 bg-primary/10 p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <Play size={14} /> Sua trilha · Day trade (WIN/WDO)
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Sua trilha está em construção.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            As lições completas de WIN/WDO chegam nas próximas releases. Enquanto isso, o essencial
            já funciona no simulador de futuros: dimensionamento por stop (contratos = risco ÷ (stop
            × valor do ponto)), margem, ajuste diário e pregão 9h–18h.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Margem mínima", "WIN ≈ R$ 100 · WDO ≈ R$ 150 por contrato"],
              ["Ajuste diário", "o resultado é consolidado todo fim de pregão"],
              ["Valor do ponto", "WIN R$ 0,20 · WDO R$ 10 por ponto"],
              ["Pregão", "9h às 18h (hora de Brasília)"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-semibold">{t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
          <Link
            to="/simulador"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Explorar o simulador de futuros <ArrowRight size={15} />
          </Link>
          <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            Tributação: day trade em futuros usa o mesmo código da declaração (6015) e a mesma
            alíquota de 20% sobre o lucro líquido mensal.
          </div>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          {LESSONS.length} lições. Estruturas expressam hipóteses — nunca recomendações. 80% no quiz
          destrava a próxima etapa do ciclo de decisão.
        </p>
      )}

      {!futuros && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              {done.size} de {LESSONS.length} lições concluídas
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round((done.size / LESSONS.length) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(done.size / LESSONS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!futuros && proxima && proximaMeta && (
        <Link
          to="/licao/$slug"
          params={{ slug: proxima.slug }}
          className="mb-8 block rounded-2xl border-2 border-primary/50 bg-primary/10 p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <Play size={14} /> Continue de onde parou
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold">{proxima.titulo}</div>
              <div className="mt-1 text-sm text-muted-foreground">{proxima.resumo}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <Clock size={12} /> {proximaMeta.tempoMin} min
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                Continuar <ArrowRight size={16} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {Object.entries(byNivel).map(([nivel, lessons]) => {
        const n = nivel as LessonNivel;
        const doneInNivel = lessons.filter((l) => done.has(l.slug)).length;
        const ehPratica = n === "pratica";
        return (
          <section key={n} className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="grid size-7 place-items-center rounded-md bg-primary/20 font-mono text-sm font-bold text-primary">
                {ehPratica ? "P" : n}
              </div>
              <div>
                <h2 className="font-semibold">{NIVEIS[n]}</h2>
                <p className="text-xs text-muted-foreground">{NIVEIS_DESC[n]}</p>
              </div>
              <div className="ml-auto">
                <NivelBoxes nivel={n} doneInNivel={doneInNivel} totalInNivel={lessons.length} />
              </div>
            </div>
            <div className="grid gap-2">
              {lessons.map((l) => {
                const isDone = done.has(l.slug);
                const meta = getLessonMeta(l.slug);
                return (
                  <Link
                    key={l.slug}
                    to="/licao/$slug"
                    params={{ slug: l.slug }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60"
                  >
                    <div
                      className={`grid size-8 shrink-0 place-items-center rounded-full ${isDone ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {isDone ? <Check size={16} /> : <span className="text-sm">{l.ordem}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{l.titulo}</div>
                      <div className="truncate text-xs text-muted-foreground">{l.resumo}</div>
                    </div>
                    <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                      <Clock size={12} /> {meta.tempoMin} min
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        <Lock size={12} className="mr-1 inline" />
        {futuros
          ? "As lições completas de day trade (WIN/WDO) chegam nas próximas releases. O simulador de futuros já cobre dimensionamento, stop, margem e ajuste diário. As estruturas de opções abaixo continuam disponíveis se você quiser explorar o outro mercado."
          : "Mais estruturas (Calendar Spread, venda a descoberto, diagonal) chegam nas próximas releases. O loop de decisão completo já funciona."}
      </div>
    </AppShell>
  );
}
