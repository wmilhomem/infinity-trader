import type { DecisionContext } from "@/engines/decision-context";
import type { Alerta } from "@/engines/rule-engine";
import { AlarmClock, ArrowLeftRight, Gauge, Percent, Scale, TrendingUp } from "lucide-react";

/**
 * OS Cards — Cartões de Decisão do Simulador.
 * A tese da plataforma: cada grega responde uma pergunta concreta; o número
 * aparece SÓ depois da resposta, como suporte — nunca como cardápio.
 * Renderizam o DecisionContext (a moeda do sistema) — a UI nunca recalcula.
 */

type CardDef = {
  icone: typeof Gauge;
  titulo: string;
  pergunta: string;
  resposta: string;
  numerico: string;
  tom: "neutro" | "bom" | "ruim" | "alerta";
};

function Card({ def }: { def: CardDef }) {
  const Icon = def.icone;
  const tomClasse =
    def.tom === "bom"
      ? "border-success/40 bg-success/5"
      : def.tom === "ruim"
        ? "border-loss/40 bg-loss/5"
        : def.tom === "alerta"
          ? "border-primary/50 bg-primary/10"
          : "border-border bg-card";

  return (
    <div className={`rounded-2xl border p-5 ${tomClasse}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon size={14} className="text-primary" /> {def.titulo}
      </div>
      <p className="mt-3 text-sm font-medium leading-snug text-foreground">{def.pergunta}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{def.resposta}</p>
      <p className="mt-3 font-mono text-xs text-muted-foreground/80">{def.numerico}</p>
    </div>
  );
}

function tomTempo(status: string): CardDef["tom"] {
  if (status.includes("Crítico")) return "ruim";
  if (status.includes("Acelerando")) return "alerta";
  return "neutro";
}

function tomAlerta(alerta: Alerta | undefined): CardDef["tom"] {
  if (!alerta) return "neutro";
  return alerta.severidade === "critico" ? "ruim" : "alerta";
}

export function DecisionCards({
  contexto,
  alertas,
}: {
  contexto: DecisionContext;
  alertas: Alerta[];
}) {
  const g = contexto.technical.greeks;
  const critico = alertas.find((a) => a.severidade === "critico");
  const aviso = alertas.find((a) => a.severidade === "aviso");

  const cards: CardDef[] = [
    {
      icone: AlarmClock,
      titulo: "Tempo",
      pergunta: "Theta — o tempo trabalha a favor ou contra mim?",
      resposta:
        `${g.tempo.mecanica} ${g.tempo.timeContext} ${g.tempo.ruleAlert ? `(${g.tempo.ruleAlert})` : ""}`.trim(),
      numerico: `Status: ${g.tempo.status} · Θ ${g.netTheta.toFixed(2)}/dia`,
      tom: tomTempo(g.tempo.status),
    },
    {
      icone: TrendingUp,
      titulo: "Direção",
      pergunta: g.perguntas.direcao.pergunta,
      resposta: g.perguntas.direcao.resposta,
      numerico: g.perguntas.direcao.numerico,
      tom: "neutro",
    },
    {
      icone: Gauge,
      titulo: "Sensibilidade",
      pergunta: g.perguntas.gamma.pergunta,
      resposta: g.perguntas.gamma.resposta,
      numerico: g.perguntas.gamma.numerico,
      tom: "neutro",
    },
    {
      icone: Percent,
      titulo: "Volatilidade",
      pergunta: g.perguntas.volatilidade.pergunta,
      resposta: g.perguntas.volatilidade.resposta,
      numerico: g.perguntas.volatilidade.numerico,
      tom: "neutro",
    },
    {
      icone: Scale,
      titulo: "Juros",
      pergunta: g.perguntas.juros.pergunta,
      resposta: g.perguntas.juros.resposta,
      numerico: g.perguntas.juros.numerico,
      tom: "neutro",
    },
    {
      icone: ArrowLeftRight,
      titulo: "Movimento esperado",
      pergunta: g.perguntas.probabilidade.pergunta,
      resposta: g.perguntas.probabilidade.resposta,
      numerico: g.perguntas.probabilidade.numerico,
      tom: "neutro",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Gauge size={14} className="text-primary" /> Cartões de decisão
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Antes de qualquer número, as perguntas que importam. Cada cartão responde uma — o valor
        aparece só como apoio.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.titulo} def={c} />
        ))}
      </div>
      {critico || aviso ? (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            critico ? "border-loss/40 bg-loss/5" : "border-primary/40 bg-primary/10"
          }`}
        >
          <div className="font-semibold text-foreground">
            {critico ? "Alerta crítico de regra" : "Alerta de regra"}
          </div>
          <p className="mt-1 text-muted-foreground">
            {critico ? critico.regra : aviso?.regra} — {critico ? critico.motivo : aviso?.motivo}
          </p>
        </div>
      ) : null}
    </div>
  );
}
