import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HipoteseMap, type FiltroHipotese } from "@/components/laboratorio/HipoteseMap";
import { FichaCard } from "@/components/laboratorio/FichaCard";
import { FichaDetalhe } from "@/components/laboratorio/FichaDetalhe";
import { FICHAS_ESTRATEGIAS, FLOW_LAB_KEY, getFicha } from "@/lib/fichas-estrategias";
import { fichasPorHipotese } from "@/lib/fichas-estrategias";
import { PRESETS_ESTRATEGIA } from "@/lib/presets-estrategias";
import { summary } from "@/lib/payoff";

export const Route = createFileRoute("/_authenticated/laboratorio")({
  head: () => ({
    meta: [
      { title: "Laboratório de Estratégias · Zero ao Trade" },
      {
        name: "description",
        content:
          "Escolha a sua hipótese de mercado e conheça as estruturas que a expressam — com risco, retorno e breakevens antes de qualquer decisão. Nenhuma ficha é recomendação.",
      },
      { property: "og:title", content: "Laboratório de Estratégias · Zero ao Trade" },
      {
        property: "og:description",
        content: "Estruturas expressam hipóteses. O laboratório organiza as fichas, você decide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Laboratorio,
});

function Laboratorio() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<FiltroHipotese>("todas");
  const [fichaAberta, setFichaAberta] = useState<string | null>(null);

  const contagens = useMemo(() => {
    const c: Record<string, number> = { todas: FICHAS_ESTRATEGIAS.length };
    for (const f of FICHAS_ESTRATEGIAS) c[f.hipotese] = (c[f.hipotese] ?? 0) + 1;
    return c;
  }, []);

  const fichas = useMemo(() => fichasPorHipotese(filtro), [filtro]);

  const statsPorFicha = useMemo(() => {
    const s: Record<string, ReturnType<typeof summary>> = {};
    for (const f of FICHAS_ESTRATEGIAS) {
      const preset = PRESETS_ESTRATEGIA[f.preset];
      if (preset) s[f.id] = summary(preset.pernas, preset.centro);
    }
    return s;
  }, []);

  const ficha = fichaAberta ? (getFicha(fichaAberta) ?? null) : null;

  function simular(id: string) {
    const f = getFicha(id);
    if (!f) return;
    try {
      sessionStorage.setItem(
        FLOW_LAB_KEY,
        JSON.stringify({
          preset: f.preset,
          tese: `Laboratório: hipótese de ${f.hipotese}. Ficha "${f.nome}" — ${f.expressa}`,
        }),
      );
    } catch {
      toast.error("Não foi possível preparar o simulador. Tente de novo.");
      return;
    }
    navigate({ to: "/simulador" });
  }

  return (
    <AppShell title="Laboratório de Estratégias">
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <FlaskConical size={13} /> Mapas de hipóteses → fichas de estruturas
          </div>
          <h1 className="mt-1 text-2xl font-bold">
            Estratégia é conhecimento; decisão é aplicação.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Comece pela sua hipótese: o que você acredita que o mercado vai fazer dentro do seu
            prazo? O laboratório organiza as estruturas que <strong>expressam</strong> cada hipótese
            — com risco, retorno e breakevens na mesa. Nenhuma ficha é recomendação pessoal: o mapa
            é seu, a decisão também. Se você ainda não tem hipótese, estude as fichas em "Todas".
          </p>
        </section>

        <HipoteseMap selecionada={filtro} contagens={contagens} onChange={setFiltro} />

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {filtro === "todas"
                ? "Todas as fichas"
                : `Fichas que expressam a hipótese de ${filtro}`}
              <span className="ml-2 rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {fichas.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Valores de exemplo com lote de 100 · {PRESETS_ESTRATEGIA["trava-alta"].ativo} R$ 38,00
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fichas.map((f) => (
              <FichaCard
                key={f.id}
                ficha={f}
                stats={statsPorFicha[f.id]}
                onAbrir={() => setFichaAberta(f.id)}
                onSimular={() => simular(f.id)}
              />
            ))}
          </div>
        </section>

        <FichaDetalhe
          ficha={ficha}
          aberta={!!ficha}
          onFechar={() => setFichaAberta(null)}
          onSimular={() => ficha && simular(ficha.id)}
        />
      </div>
    </AppShell>
  );
}
