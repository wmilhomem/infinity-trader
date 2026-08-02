import { useState } from "react";
import type { LessonVisualKind } from "@/lib/lesson-meta";
import { ArrowDown, ArrowUp, CalendarDays, CheckCircle2, Clock, TrendingDown, TrendingUp } from "lucide-react";

function Card({
  tone,
  title,
  badge,
  items,
}: {
  tone: "success" | "primary" | "loss";
  title: string;
  badge: string;
  items: string[];
}) {
  const map = {
    success: "border-success/50 bg-success/10 text-success",
    primary: "border-primary/50 bg-primary/10 text-primary",
    loss: "border-loss/50 bg-loss/10 text-loss",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="font-mono text-lg font-bold">{title}</div>
        <span className="text-xs opacity-80">{badge}</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-foreground/90">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="opacity-60">·</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MoneynessRuler() {
  return (
    <div>
      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">PETR4 — preço atual</div>
        <div className="font-mono text-4xl font-bold">R$ 38</div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card tone="success" title="34" badge="ITM 🟢" items={["Maior chance", "Prêmio mais caro", "Menor alavancagem"]} />
        <Card tone="primary" title="38" badge="ATM 🟡" items={["Equilíbrio", "Maior valor extrínseco", "Maior sensibilidade ao tempo"]} />
        <Card tone="loss" title="44" badge="OTM 🔴" items={["Barata", "Alta alavancagem", "Pode virar pó"]} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full">
        <div className="flex h-full">
          <div className="h-full flex-1 bg-success" />
          <div className="h-full flex-1 bg-primary" />
          <div className="h-full flex-1 bg-loss" />
        </div>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>dentro do dinheiro</span>
        <span>no dinheiro</span>
        <span>fora do dinheiro</span>
      </div>
    </div>
  );
}

function CallPut() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-success/50 bg-success/10 p-5">
        <TrendingUp className="text-success" />
        <div className="mt-2 text-lg font-semibold">CALL</div>
        <p className="mt-1 text-sm text-muted-foreground">Direito de <strong>comprar</strong> no strike.</p>
        <p className="mt-3 text-sm">Você ganha se o ativo <strong>sobe</strong> acima do strike + prêmio.</p>
      </div>
      <div className="rounded-xl border border-loss/50 bg-loss/10 p-5">
        <TrendingDown className="text-loss" />
        <div className="mt-2 text-lg font-semibold">PUT</div>
        <p className="mt-1 text-sm text-muted-foreground">Direito de <strong>vender</strong> no strike.</p>
        <p className="mt-3 text-sm">Você ganha se o ativo <strong>cai</strong> abaixo do strike − prêmio.</p>
      </div>
    </div>
  );
}

function ThetaCurve() {
  const pts = [1, 0.94, 0.86, 0.76, 0.63, 0.47, 0.28, 0.1, 0];
  const w = 320;
  const h = 120;
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - p * h}`)
    .join(" ");
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock size={14} /> Valor extrínseco ao longo dos dias
      </div>
      <svg viewBox={`0 0 ${w} ${h + 8}`} className="w-full">
        <path d={d} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>40 dias</span>
        <span>10 dias</span>
        <span>vencimento</span>
      </div>
      <p className="mt-3 text-sm">
        A corrosão <strong>acelera</strong> na reta final. O tempo não é linear contra o comprador.
      </p>
    </div>
  );
}

function SpreadLegs() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">Pernas da operação</div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-3">
          <ArrowUp className="text-success shrink-0" size={18} />
          <div className="min-w-0 text-sm">
            <div className="font-semibold">Compra (perna longa)</div>
            <div className="text-muted-foreground">Define de onde você começa a ganhar. Paga prêmio.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-loss/40 bg-loss/10 p-3">
          <ArrowDown className="text-loss shrink-0" size={18} />
          <div className="min-w-0 text-sm">
            <div className="font-semibold">Venda (perna curta)</div>
            <div className="text-muted-foreground">Barateia a montagem e limita o ganho. Recebe prêmio.</div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm">
        A distância entre os strikes define o <strong>ganho máximo</strong>. O custo líquido define a{" "}
        <strong>perda máxima</strong>.
      </p>
    </div>
  );
}

function PremioSplit() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">Prêmio de R$ 2,00</div>
      <div className="mt-4 flex h-10 overflow-hidden rounded-lg font-mono text-xs">
        <div className="grid flex-[6] place-items-center bg-success/30">intrínseco R$ 1,20</div>
        <div className="grid flex-[4] place-items-center bg-primary/30">extrínseco R$ 0,80</div>
      </div>
      <p className="mt-4 text-sm">
        O <strong>intrínseco</strong> é o que a opção já vale hoje. O <strong>extrínseco</strong> é expectativa — e no
        vencimento vale exatamente zero.
      </p>
    </div>
  );
}

function FiscalFlow() {
  const steps = ["Some os lucros do mês", "Compense prejuízos anteriores", "Aplique a alíquota", "Gere a DARF 6015", "Pague até o último dia útil"];
  const [done, setDone] = useState<number[]>([]);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays size={14} /> Fluxo do fechamento mensal
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const ok = done.includes(i);
          return (
            <li key={s}>
              <button
                onClick={() => setDone((d) => (ok ? d.filter((x) => x !== i) : [...d, i]))}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${ok ? "border-success/50 bg-success/10" : "border-border hover:bg-accent"}`}
              >
                <CheckCircle2 size={16} className={ok ? "text-success" : "text-muted-foreground"} />
                <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                {s}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LessonVisual({ kind }: { kind: LessonVisualKind }) {
  switch (kind) {
    case "moneyness":
      return <MoneynessRuler />;
    case "callput":
      return <CallPut />;
    case "theta":
      return <ThetaCurve />;
    case "travas":
      return <SpreadLegs />;
    case "premio":
      return <PremioSplit />;
    case "fiscal":
      return <FiscalFlow />;
    default:
      return null;
  }
}
