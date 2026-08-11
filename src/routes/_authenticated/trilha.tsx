import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { TemaAccordion } from "@/components/lessons/TemaAccordion";
import { liçõesDeFoco, liçõesPorTema, TEMAS, temaDeLição } from "@/lib/lessons";
import { getLessonMeta } from "@/lib/lesson-meta";
import { useCaminho } from "@/lib/use-caminho";
import { useFoco, useAtualizarFoco } from "@/lib/use-foco";
import { FOCOS_FUTUROS, FOCO_INFO } from "@/lib/foco";
import { ArrowRight, Check, Clock, Lock, Play } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trilha")({
  head: () => ({ meta: [{ title: "Trilha · Zero ao Trade" }] }),
  component: Trilha,
});

function Trilha() {
  const { caminho } = useCaminho();
  const { foco } = useFoco();
  const atualizarFoco = useAtualizarFoco();
  const q = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons_progress").select("*");
      return data ?? [];
    },
  });

  const done = new Set((q.data ?? []).filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const trilha = liçõesDeFoco(caminho, caminho === "futuros" ? foco : undefined);
  const temas = liçõesPorTema(trilha);
  const proxima = trilha.find((l) => !done.has(l.slug));
  const proximaMeta = proxima ? getLessonMeta(proxima.slug) : null;
  const temaDaProxima = proxima ? temaDeLição(proxima.slug) : undefined;

  const futuros = caminho === "futuros";

  return (
    <AppShell title="Trilha">
      {futuros ? (
        <div className="mb-8 rounded-2xl border-2 border-primary/50 bg-primary/10 p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <Play size={14} /> Sua trilha · Day trade (WIN/WDO)
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            {trilha.length} lições para dominar o mini índice e o mini dólar.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Da mecânica do contrato futuro ao DARF de day trade — com quiz, missões e simulador.
            Estruturas expressam hipóteses — nunca recomendações. 80% no quiz destrava a próxima
            etapa do ciclo de decisão.
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
            Tributação: day trade em futuros usa o código 6015 e alíquota de 20% sobre o lucro
            líquido mensal — sem isenção de R$ 20 mil (lições 13 e 14).
          </div>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          {trilha.length} lições. Estruturas expressam hipóteses — nunca recomendações. 80% no quiz
          destrava a próxima etapa do ciclo de decisão.
        </p>
      )}

      {futuros && (
        <div className="mb-8">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Qual contrato você quer aprofundar?
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {FOCOS_FUTUROS.map((f) => {
              const ativo = foco === f;
              return (
                <button
                  key={f}
                  onClick={() => atualizarFoco(f)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    ativo
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{FOCO_INFO[f].label}</div>
                    <div className="text-xs text-muted-foreground">{FOCO_INFO[f].desc}</div>
                  </div>
                  <div
                    className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                      ativo ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {ativo && <Check size={13} />}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            As lições de mecânica valem para os dois contratos; a lição de aprofundamento é
            específica do escolhido. Você pode trocar quando quiser.
          </p>
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {done.size} de {trilha.length} lições concluídas
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {Math.round((done.size / trilha.length) * 100)}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(done.size / trilha.length) * 100}%` }}
          />
        </div>
      </div>

      {proxima && proximaMeta && (
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

      {temas.map(({ tema, lições }, i) => {
        const info = TEMAS[tema] ?? TEMAS.outros;
        const nome =
          tema === "aprofundamento" && caminho === "futuros"
            ? `Aprofundamento · ${FOCO_INFO[foco].curto}`
            : info.nome;
        return (
          <TemaAccordion
            key={tema}
            indice={i + 1}
            nome={nome}
            desc={info.desc}
            lições={lições}
            done={done}
            foco={caminho === "futuros" ? foco : undefined}
            abertoInicial={tema === temaDaProxima}
          />
        );
      })}
      <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        <Lock size={12} className="mr-1 inline" />
        {futuros
          ? "Mais conteúdo de futuros (agro, commodities, contratos cheios) chega nas próximas releases. O simulador de futuros já cobre dimensionamento, stop, margem e ajuste diário."
          : "Mais estruturas (Calendar Spread, venda a descoberto, diagonal) chegam nas próximas releases. O loop de decisão completo já funciona."}
      </div>
    </AppShell>
  );
}
