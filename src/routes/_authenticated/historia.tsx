import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { historiaDeEvolucao } from "@/engines/marcos";
import { linhaDoTempo, evolucaoInvestidor } from "@/engines/timeline";
import type { DiaryEntry } from "@/engines/types";
import { ArrowRight, ArrowDownRight, ArrowUpRight, Minus, Sprout } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historia")({
  head: () => ({
    meta: [
      { title: "A sua história · Zero ao Trade" },
      {
        name: "description",
        content:
          "Os marcos da sua evolução: primeira decisão registrada, primeira semana sem furar a regra, viradas de hábito — e a evolução mês a mês.",
      },
      { property: "og:title", content: "A sua história · Zero ao Trade" },
      {
        property: "og:description",
        content: "Sua jornada de quem decide por impulso para quem decide com processo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Historia,
});

function Historia() {
  const diary = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as DiaryEntry[];
    },
  });

  const sims = useQuery({
    queryKey: ["sims"],
    queryFn: async () =>
      (await supabase.from("simulations").select("created_at").order("created_at")).data ?? [],
  });

  const rules = useQuery({
    queryKey: ["rules"],
    queryFn: async () =>
      (await supabase.from("personal_rules").select("created_at").order("created_at")).data ?? [],
  });

  const licoes = useQuery({
    queryKey: ["progress"],
    queryFn: async () =>
      (
        await supabase
          .from("lessons_progress")
          .select("completed_at")
          .not("completed_at", "is", null)
          .order("completed_at")
      ).data ?? [],
  });

  const revisoes = useQuery({
    queryKey: ["reviews-all"],
    queryFn: async () => {
      const [semana, mes] = await Promise.all([
        supabase.from("weekly_reviews").select("created_at, period_start"),
        supabase.from("monthly_reviews").select("created_at, period_start"),
      ]);
      return [...(semana.data ?? []), ...(mes.data ?? [])].map((r) => ({
        data: (r.created_at ?? r.period_start) as string,
      }));
    },
  });

  const marcos = useMemo(
    () =>
      historiaDeEvolucao({
        diary: (diary.data ?? []) as DiaryEntry[],
        sims: (sims.data ?? []) as { created_at: string }[],
        rules: (rules.data ?? []) as { created_at: string }[],
        licoes: (licoes.data ?? []) as { completed_at: string }[],
        revisoes: revisoes.data ?? [],
      }),
    [diary.data, sims.data, rules.data, licoes.data, revisoes.data],
  );

  const meses = useMemo(() => linhaDoTempo((diary.data ?? []) as DiaryEntry[]), [diary.data]);
  const habitos = useMemo(
    () => evolucaoInvestidor((diary.data ?? []) as DiaryEntry[]),
    [diary.data],
  );

  const fmtData = (iso: string) => format(new Date(iso), "d MMM", { locale: ptBR });

  return (
    <AppShell title="A sua história">
      {/* História — marcos */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
          <Sprout size={13} /> Os marcos da sua evolução
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Não é uma lista de números. É a história de quem decidiu virar sistemático — contada pelos
          marcos que você mesmo registrou.
        </p>

        {marcos.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sua história começa quando você registra a primeira decisão no diário.
            </p>
            <Link
              to="/diario"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Escrever minha primeira decisão <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <ol className="mt-6">
            {marcos.map((m, i) => (
              <li key={m.chave} className="relative">
                {i < marcos.length - 1 && (
                  <div className="absolute left-[0.55rem] top-8 h-full w-px bg-border" />
                )}
                <div className="relative flex gap-4 pb-7">
                  <span className="mt-1 grid size-[1.15rem] shrink-0 place-items-center rounded-full border border-primary/50 bg-background">
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      {fmtData(m.data)}
                    </div>
                    <div className="mt-1 font-semibold leading-snug">{m.titulo}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.texto}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Evolução mês a mês */}
      {meses.length > 0 && (
        <section className="mt-4 rounded-xl border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Como você evoluiu mês a mês
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Mês</th>
                  <th className="pb-2 pr-4 font-medium">Decisões</th>
                  <th className="pb-2 pr-4 font-medium">Seguiu a regra</th>
                  <th className="pb-2 pr-4 font-medium">Tese escrita</th>
                  <th className="pb-2 pr-4 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr key={m.chave} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{m.rotulo}</td>
                    <td className="py-2.5 pr-4 font-mono text-muted-foreground">{m.decisoes}</td>
                    <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                      {m.disciplina === null ? "—" : `${m.disciplina}%`}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                      {m.pctTese === null ? "—" : `${m.pctTese}%`}
                    </td>
                    <td
                      className={`py-2.5 font-mono ${
                        m.resultado > 0 ? "text-success" : m.resultado < 0 ? "text-loss" : ""
                      }`}
                    >
                      {m.resultado === 0 && m.encerradas === 0 ? "—" : `R$ ${m.resultado}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Hábitos que mudaram */}
      {habitos.length > 0 && (
        <section className="mt-4 rounded-xl border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Hábitos que o sistema detectou
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {habitos.map((h) => (
              <div key={h.chave} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{h.rotulo}</div>
                  {h.mudou ? (
                    <ArrowUpRight size={14} className="shrink-0 text-success" />
                  ) : (
                    <Minus size={14} className="shrink-0 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-2 font-mono text-sm">
                  <span className="text-muted-foreground line-through decoration-1">{h.antes}</span>
                  <span className={h.mudou ? "font-bold text-success" : "font-bold"}>
                    {h.agora}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {h.descricao}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Revisão cognitiva — continua a 1 clique */}
      <Link
        to="/revisao"
        className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5 transition hover:bg-primary/10"
      >
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
            {habitos.some((h) => h.mudou) ? (
              <ArrowDownRight size={13} />
            ) : (
              <ArrowUpRight size={13} />
            )}
            Revisão do período
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Leitura da semana ou do mês: disciplina, padrões e o foco do próximo período.
          </p>
        </div>
        <ArrowRight size={16} className="shrink-0 text-primary" />
      </Link>
    </AppShell>
  );
}
