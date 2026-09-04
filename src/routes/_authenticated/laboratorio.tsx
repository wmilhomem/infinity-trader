import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FlaskConical, Scale, BookOpen, History, BookMarked } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useCaminho } from "@/lib/use-caminho";
import { HipoteseMap, type FiltroHipotese } from "@/components/laboratorio/HipoteseMap";
import { FichaCard } from "@/components/laboratorio/FichaCard";
import { FichaDetalhe } from "@/components/laboratorio/FichaDetalhe";
import { CompararFichas } from "@/components/laboratorio/CompararFichas";
import {
  FICHAS_ESTRATEGIAS,
  FLOW_LAB_KEY,
  getFicha,
  montarOrigem,
  selecionarFichas,
} from "@/lib/fichas-estrategias";
import { fichasPorHipotese } from "@/lib/fichas-estrategias";
import { PRESETS_ESTRATEGIA } from "@/lib/presets-estrategias";
import { summary } from "@/lib/payoff";
import { OptionsChainReader } from "@/components/options/OptionsChainReader";
import { ReplayView } from "@/components/options/ReplayView";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { buildMarketContext } from "@/lib/market-context-builder";
import { createFrozenContext } from "@/lib/practice-session";

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
  validateSearch: z.object({ ficha: z.string().optional() }),
  component: Laboratorio,
});

function Laboratorio() {
  const navigate = useNavigate();
  const { caminho } = useCaminho();
  const { ficha: fichaParam } = Route.useSearch();
  const [filtro, setFiltro] = useState<FiltroHipotese>("todas");
  const [fichaAberta, setFichaAberta] = useState<string | null>(fichaParam ?? null);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [comparando, setComparando] = useState(false);
  const [labSection, setLabSection] = useState<"estrategias" | "ler-cadeia" | "replay" | "pratica">(
    "estrategias",
  );
  const [practiceSessionActive, setPracticeSessionActive] = useState(false);

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
  const fichasComparadas = useMemo(() => selecionarFichas(selecionadas), [selecionadas]);

  const lerCadeiaContext = useMemo(() => {
    const NOW = new Date().toISOString();
    return buildMarketContext({
      symbol: "PETR4",
      quote: { last: 38.47 },
      timestamp: NOW,
      provenance: { source: "live", provider: "yahoo-finance", observedAt: NOW },
      optionsChain: {
        expirationDate: "2026-09-18",
        daysToExpiration: 17,
        atm: {
          strike: 38.5,
          spotUsed: 38.47,
          determinedAt: NOW,
          method: "nearest-strike",
        },
        impliedVolatilityAtm: {
          value: 0.287,
          provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
          atmStrikeUsed: 38.5,
        },
        skew: {
          putIvOtm: 0.342,
          callIvOtm: 0.278,
          slope: 0.064,
          provenance: { origin: "calculated", method: "put-call-iv-spread", calculatedAt: NOW },
          putStrikeUsed: 36.0,
          callStrikeUsed: 41.0,
          otmDistanceUsed: 0.065,
        },
        expectedMove: {
          sigma1Brl: 1.83,
          lowerBound1Sigma: 36.64,
          upperBound1Sigma: 40.3,
          provenance: { origin: "calculated", method: "spot-iv-sqrt-t", calculatedAt: NOW },
          ivUsed: 0.287,
          spotUsed: 38.47,
          dteUsed: 17,
          dteBase: "calendar",
          formula: "Spot × IV × √(T/252)",
        },
        contracts: [
          {
            symbol: "PETR4",
            strike: 36.0,
            type: "put",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            bid: 0.42,
            ask: 0.45,
            volume: 1240,
            openInterest: 8920,
            impliedVolatility: {
              value: 0.342,
              provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            },
            delta: {
              value: -0.234,
              provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
            },
          },
          {
            symbol: "PETR4",
            strike: 37.0,
            type: "put",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            bid: 0.72,
            ask: 0.75,
            volume: 2100,
            openInterest: 12400,
            impliedVolatility: {
              value: 0.321,
              provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            },
            delta: {
              value: -0.318,
              provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
            },
          },
          {
            symbol: "PETR4",
            strike: 38.5,
            type: "call",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            bid: 1.15,
            ask: 1.2,
            volume: 3420,
            openInterest: 12400,
            impliedVolatility: {
              value: 0.287,
              provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            },
            delta: {
              value: 0.512,
              provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
            },
          },
          {
            symbol: "PETR4",
            strike: 40.0,
            type: "call",
            expiration: "2026-09-18",
            daysToExpiration: 17,
            bid: 0.38,
            ask: 0.4,
            volume: 980,
            openInterest: 7800,
            impliedVolatility: {
              value: 0.294,
              provenance: { origin: "observed", source: "yahoo-finance", calculatedAt: NOW },
            },
            delta: {
              value: 0.201,
              provenance: { origin: "calculated", method: "black-scholes-bsm", calculatedAt: NOW },
            },
          },
        ],
      },
    });
  }, []);

  function abrirFicha(id: string) {
    setFichaAberta(id);
    navigate({ to: "/laboratorio", search: { ficha: id }, replace: true });
  }

  function fecharFicha() {
    setFichaAberta(null);
    navigate({ to: "/laboratorio", search: {}, replace: true });
  }

  function toggleSelecao(id: string) {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  }

  function simular(id: string) {
    const f = getFicha(id);
    if (!f) return;
    const origem = montarOrigem(id);
    try {
      sessionStorage.setItem(
        FLOW_LAB_KEY,
        JSON.stringify({
          preset: f.preset,
          tese: `Laboratório: hipótese de ${f.hipotese}. Ficha "${f.nome}" — ${f.expressa}`,
          fichaId: origem?.fichaId,
          fichaNome: origem?.fichaNome,
          hipotese: origem?.hipotese,
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
      {caminho === "futuros" && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <FlaskConical size={13} /> Opções · outro mercado
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Este laboratório pertence ao mundo das <span className="text-foreground">opções</span> —
            calls e puts, com gregas e payoff. Seu caminho é o day trade (WIN/WDO): o que importa
            para você está no simulador de futuros (dimensionamento, stop, margem e ajuste diário).
            O conteúdo abaixo fica disponível se quiser explorar o outro mercado.
          </p>
          <Link
            to="/simulador"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ir para o simulador de futuros →
          </Link>
        </div>
      )}

      {caminho !== "futuros" && (
        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          <button
            onClick={() => setLabSection("estrategias")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              labSection === "estrategias"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Scale size={14} />
            Estratégias
          </button>
          <button
            onClick={() => setLabSection("ler-cadeia")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              labSection === "ler-cadeia"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <BookOpen size={14} />
            Ler Cadeia
          </button>
          <button
            onClick={() => {
              setLabSection("replay");
              setPracticeSessionActive(false);
            }}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              labSection === "replay"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <History size={14} />
            Replay
          </button>
          <button
            onClick={() => {
              setLabSection("pratica");
              setPracticeSessionActive(true);
            }}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              labSection === "pratica"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <BookMarked size={14} />
            Prática
          </button>
        </div>
      )}

      {labSection === "pratica" && practiceSessionActive ? (
        <PracticeSession
          frozenContext={createFrozenContext(lerCadeiaContext, "laboratory")}
          onSessionComplete={(session) => {
            console.info("Practice session complete:", session.id, session.choice);
            setPracticeSessionActive(false);
          }}
          onCancel={() => setPracticeSessionActive(false)}
        />
      ) : labSection === "ler-cadeia" ? (
        <OptionsChainReader context={lerCadeiaContext} />
      ) : labSection === "replay" ? (
        <ReplayView readings={[]} />
      ) : (
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
              prazo? O laboratório organiza as estruturas que <strong>expressam</strong> cada
              hipótese — com risco, retorno e breakevens na mesa. Selecione 2 ou 3 fichas para
              compará-las lado a lado antes de levar ao simulador. Nenhuma ficha é recomendação
              pessoal: o mapa é seu, a decisão também.
            </p>
          </section>

          <HipoteseMap selecionada={filtro} contagens={contagens} onChange={setFiltro} />

          {selecionadas.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Scale size={15} className="text-primary" />
                <span>
                  Comparação: <b>{selecionadas.length}</b> de 3 fichas
                </span>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setSelecionadas([])}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setComparando(true)}
                  disabled={selecionadas.length < 2}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  Comparar lado a lado
                </button>
              </div>
            </div>
          )}

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
                Valores de exemplo com lote de 100 · {PRESETS_ESTRATEGIA["trava-alta"].ativo} R$
                38,00
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {fichas.map((f) => (
                <FichaCard
                  key={f.id}
                  ficha={f}
                  stats={statsPorFicha[f.id]}
                  selecionada={selecionadas.includes(f.id)}
                  onToggleSelecao={() => toggleSelecao(f.id)}
                  onAbrir={() => abrirFicha(f.id)}
                  onSimular={() => simular(f.id)}
                />
              ))}
            </div>
          </section>

          <FichaDetalhe
            ficha={ficha}
            aberta={!!ficha}
            onFechar={fecharFicha}
            onSimular={() => ficha && simular(ficha.id)}
          />

          <CompararFichas
            fichas={fichasComparadas}
            stats={statsPorFicha}
            aberta={comparando}
            onFechar={() => setComparando(false)}
            onAbrirFicha={(id) => {
              setComparando(false);
              abrirFicha(id);
            }}
            onSimular={(id) => {
              setComparando(false);
              simular(id);
            }}
          />
        </div>
      )}
    </AppShell>
  );
}
