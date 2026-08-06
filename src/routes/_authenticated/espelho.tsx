import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { quemVoceEstaSeTornando } from "@/engines/espelho";
import type { DiaryEntry } from "@/engines/types";
import { ArrowDownRight, ArrowUpRight, Minus, Network, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espelho")({
  head: () => ({
    meta: [
      { title: "Quem você está se tornando · Zero ao Trade" },
      {
        name: "description",
        content:
          "O espelho da sua evolução: o que mudou entre a primeira e a segunda metade das suas decisões, e o que ainda precisa de cuidado.",
      },
      { property: "og:title", content: "Quem você está se tornando · Zero ao Trade" },
      {
        property: "og:description",
        content: "Não é adivinhação: é a imagem do que você registrou.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Espelho,
});

function Espelho() {
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

  const rules = useQuery({
    queryKey: ["rules"],
    queryFn: async () => (await supabase.from("personal_rules").select("id, texto")).data ?? [],
  });

  const espelho = useMemo(
    () =>
      quemVoceEstaSeTornando({
        diary: (diary.data ?? []) as DiaryEntry[],
        rules: (rules.data ?? []) as { id: string; texto: string }[],
      }),
    [diary.data, rules.data],
  );

  const mudaram = espelho.eixos.filter((e) => e.mudou);
  const naoMudaram = espelho.eixos.filter((e) => !e.mudou);

  return (
    <AppShell title="Quem você está se tornando">
      {/* O espelho */}
      <section className="rounded-xl border border-primary/40 bg-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
          <ShieldCheck size={13} /> O espelho
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {espelho.registros === 0
            ? "Nenhuma decisão registrada ainda."
            : `${espelho.registros} decisões registradas · ${espelho.avaliados} avaliadas contra a própria regra.`}
        </p>
        <p className="mt-4 max-w-2xl text-xl font-medium leading-relaxed">{espelho.perfil}</p>
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            O que precisa de cuidado
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{espelho.foco}</p>
        </div>
      </section>

      {/* Eixos — antes → agora */}
      {espelho.eixos.length > 0 && (
        <section className="mt-4 rounded-xl border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Eixo a eixo: antes → agora
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {espelho.eixos.map((e) => (
              <div key={e.chave} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{e.rotulo}</div>
                  {e.mudou ? (
                    <ArrowUpRight size={14} className="shrink-0 text-success" />
                  ) : (
                    <Minus size={14} className="shrink-0 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-2 font-mono text-sm">
                  <span className="text-muted-foreground line-through decoration-1">{e.antes}</span>
                  <span className={e.mudou ? "font-bold text-success" : "font-bold"}>
                    {e.agora}
                  </span>
                </div>
                {e.frase && (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {e.frase}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* O que mudou / o que não mudou */}
      {mudaram.length > 0 && (
        <section className="mt-4 rounded-xl border border-success/40 bg-success/5 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-success">
            <ArrowUpRight size={13} /> O que já mudou
          </div>
          <ul className="mt-3 space-y-2">
            {mudaram.map((e) => (
              <li key={e.chave} className="flex gap-2 text-sm leading-snug">
                <span className="text-success">→</span>
                <span>{e.frase ?? e.rotulo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {naoMudaram.length > 0 && (
        <section className="mt-4 rounded-xl border border-loss/40 bg-loss/5 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-loss">
            <ArrowDownRight size={13} /> O que ainda precisa de constância
          </div>
          <ul className="mt-3 space-y-2">
            {naoMudaram.map((e) => (
              <li key={e.chave} className="flex gap-2 text-sm leading-snug">
                <span className="text-loss">→</span>
                <span>
                  {e.rotulo}: {e.agora}
                  {e.antes !== "—" && (
                    <span className="text-muted-foreground"> (antes {e.antes})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* O caminho que mais se repete */}
      {espelho.caminhoRepetido && (
        <section className="mt-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Network size={13} /> O caminho que mais se repete
          </div>
          <ol className="mt-4 space-y-1.5">
            {espelho.caminhoRepetido.map((n, i) => (
              <li key={`${n.rotulo}-${i}`} className="flex items-center gap-3">
                <span className="rounded-md border border-border bg-background px-2.5 py-1 text-sm">
                  {n.rotulo}
                </span>
                {i < espelho.caminhoRepetido!.length - 1 && (
                  <span className="text-[10px] uppercase text-muted-foreground">
                    ↓ relaciona-se com
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Honestidade */}
      <p className="mt-6 max-w-xl text-xs leading-relaxed text-muted-foreground">
        {espelho.fraseFinal}
      </p>
    </AppShell>
  );
}
