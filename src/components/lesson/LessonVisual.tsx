import { useState } from "react";
import type { LessonVisualKind } from "@/lib/lesson-meta";
import { LeituraVisual } from "./LeituraVisuals";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock,
  Scale,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

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
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          PETR4 — preço atual
        </div>
        <div className="font-mono text-4xl font-bold">R$ 38</div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card
          tone="success"
          title="34"
          badge="ITM 🟢"
          items={["Maior chance", "Prêmio mais caro", "Menor alavancagem"]}
        />
        <Card
          tone="primary"
          title="38"
          badge="ATM 🟡"
          items={["Equilíbrio", "Maior valor extrínseco", "Maior sensibilidade ao tempo"]}
        />
        <Card
          tone="loss"
          title="44"
          badge="OTM 🔴"
          items={["Barata", "Alta alavancagem", "Pode virar pó"]}
        />
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
        <p className="mt-1 text-sm text-muted-foreground">
          Direito de <strong>comprar</strong> no strike.
        </p>
        <p className="mt-3 text-sm">
          Você ganha se o ativo <strong>sobe</strong> acima do strike + prêmio.
        </p>
      </div>
      <div className="rounded-xl border border-loss/50 bg-loss/10 p-5">
        <TrendingDown className="text-loss" />
        <div className="mt-2 text-lg font-semibold">PUT</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Direito de <strong>vender</strong> no strike.
        </p>
        <p className="mt-3 text-sm">
          Você ganha se o ativo <strong>cai</strong> abaixo do strike − prêmio.
        </p>
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
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Pernas da operação
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-3">
          <ArrowUp className="text-success shrink-0" size={18} />
          <div className="min-w-0 text-sm">
            <div className="font-semibold">Compra (perna longa)</div>
            <div className="text-muted-foreground">
              Define de onde você começa a ganhar. Paga prêmio.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-loss/40 bg-loss/10 p-3">
          <ArrowDown className="text-loss shrink-0" size={18} />
          <div className="min-w-0 text-sm">
            <div className="font-semibold">Venda (perna curta)</div>
            <div className="text-muted-foreground">
              Barateia a montagem e limita o ganho. Recebe prêmio.
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm">
        A distância entre os strikes define o <strong>ganho máximo</strong>. O custo líquido define
        a <strong>perda máxima</strong>.
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
        O <strong>intrínseco</strong> é o que a opção já vale hoje. O <strong>extrínseco</strong> é
        expectativa — e no vencimento vale exatamente zero.
      </p>
    </div>
  );
}

function FiscalFlow() {
  const steps = [
    "Some os lucros do mês",
    "Compense prejuízos anteriores",
    "Aplique a alíquota",
    "Gere a DARF 6015",
    "Pague até o último dia útil",
  ];
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

function DireitoVisual() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-success/50 bg-success/10 p-5">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">Você, comprador</span>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            Paga o <strong>prêmio</strong> agora.
          </li>
          <li>
            Tem o <strong>direito</strong> de exercer — ou não.
          </li>
          <li>Se desistir, perde no máximo o prêmio.</li>
        </ul>
      </div>
      <div className="rounded-xl border border-loss/50 bg-loss/10 p-5">
        <div className="flex items-center gap-2 text-loss">
          <XCircle size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">O vendedor</span>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            Recebe o <strong>prêmio</strong> agora.
          </li>
          <li>
            Assume a <strong>obrigação</strong> se você exercer.
          </li>
          <li>Ganha no máximo o prêmio recebido.</li>
        </ul>
      </div>
      <p className="text-sm md:col-span-2">
        Direito <strong>não</strong> é obrigação: é por isso que a perda do comprador trava no
        prêmio.
      </p>
    </div>
  );
}

function VencimentoVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays size={14} /> Do contrato ao vencimento
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="text-xs text-muted-foreground">Hoje</div>
          <div className="mt-1 text-sm font-semibold">Série com liquidez?</div>
        </div>
        <ArrowRight className="shrink-0 text-muted-foreground" size={16} />
        <div className="flex-1 rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="text-xs text-muted-foreground">3ª sexta-feira</div>
          <div className="mt-1 text-sm font-semibold">Vencimento</div>
        </div>
        <ArrowRight className="shrink-0 text-muted-foreground" size={16} />
        <div className="flex-1 rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="text-xs text-muted-foreground">Depois</div>
          <div className="mt-1 text-sm font-semibold">O contrato deixa de existir</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm">
          <div className="font-semibold text-success">ITM no vencimento</div>
          <p className="mt-1 text-muted-foreground">Exercida automaticamente pela corretora.</p>
        </div>
        <div className="rounded-lg border border-loss/40 bg-loss/10 p-3 text-sm">
          <div className="font-semibold text-loss">OTM no vencimento</div>
          <p className="mt-1 text-muted-foreground">Vira pó. Você perde o prêmio pago.</p>
        </div>
      </div>
      <p className="mt-4 text-sm">
        Sem contraparte para vender antes? <strong>Spread alto = prisão.</strong> Confira liquidez
        antes de entrar.
      </p>
    </div>
  );
}

function SizingVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs uppercase tracking-wide text-muted-foreground">
        Tamanho antes do clique
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="font-mono text-base font-bold">R$20.000</div>
          <div className="text-xs text-muted-foreground">capital</div>
        </div>
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-center">
          <div className="font-mono text-base font-bold text-primary">R$200</div>
          <div className="text-xs text-muted-foreground">1% por operação</div>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="font-mono text-base font-bold">R$80</div>
          <div className="text-xs text-muted-foreground">custo de 1 lote</div>
        </div>
        <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-center">
          <div className="font-mono text-base font-bold text-success">2 lotes</div>
          <div className="text-xs text-muted-foreground">cabem (R$160)</div>
        </div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full">
        <div className="flex h-full gap-[3px]">
          <div className="h-full flex-1 bg-success" />
          <div className="h-full flex-1 bg-success" />
          <div className="h-full flex-1 bg-muted" />
        </div>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>lote 1 · R$80</span>
        <span>lote 2 · R$160</span>
        <span>lote 3 estoura o limite</span>
      </div>
      <p className="mt-4 text-sm">
        Perder <strong>100% do prêmio</strong> é normal na compra a seco. O tamanho é o que te
        mantém vivo.
      </p>
    </div>
  );
}

function CobertaVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp size={14} /> Venda coberta: ação a R$30, call K33 vendida por R$0,90
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
          <div className="text-xs text-muted-foreground">Ativo ≤ 33 no vencimento</div>
          <p className="mt-2 text-sm">
            Fica com as ações <strong>e</strong> com o prêmio. Aluguel recebido.
          </p>
        </div>
        <div className="rounded-lg border border-success/40 bg-success/10 p-4">
          <div className="text-xs text-muted-foreground">Ativo &gt; 33</div>
          <p className="mt-2 text-sm">
            É exercido: ganho trava em <strong>strike + prêmio</strong>.
          </p>
        </div>
        <div className="rounded-lg border border-loss/40 bg-loss/10 p-4">
          <div className="text-xs text-muted-foreground">Queda forte</div>
          <p className="mt-2 text-sm">
            O prêmio amortece <strong>só o valor dele</strong>. O resto é seu.
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm">
        Você vendeu a <strong>alta acima do strike</strong>. Em troca, recebeu um prêmio fixo —
        nunca mais que isso.
      </p>
    </div>
  );
}

function RollVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs uppercase tracking-wide text-muted-foreground">
        Call K40 vendida por R$1,00 · PETR4 a R$41
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-success/40 bg-success/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-success">
            <ArrowRight size={16} /> Rolagem boa
          </div>
          <p className="mt-2 text-sm">
            Recompra R$1,80 → vende PETRL42 (próximo mês) por R$2,20:{" "}
            <strong>crédito R$0,40 + tempo extra</strong>.
          </p>
        </div>
        <div className="rounded-lg border border-loss/40 bg-loss/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-loss">
            <ArrowDown size={16} /> Rolagem ruim
          </div>
          <p className="mt-2 text-sm">
            Recompra R$1,80 → vende PETRK41 (mesma série) por R$0,50:{" "}
            <strong>débito R$1,30 sem tempo extra</strong>.
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm">
        Rolagem boa <strong>gera crédito ou débito pequeno e ganha tempo</strong>. Rolagem ruim paga
        caro para continuar errado.
      </p>
    </div>
  );
}

function RiscoVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs uppercase tracking-wide text-muted-foreground">
        Regra do 1% na prática
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="font-mono text-base font-bold">R$50.000</div>
          <div className="text-xs text-muted-foreground">patrimônio</div>
        </div>
        <ArrowRight className="shrink-0 text-muted-foreground" size={16} />
        <div className="flex-1 rounded-lg border border-primary/40 bg-primary/10 p-3 text-center">
          <div className="font-mono text-base font-bold text-primary">R$500</div>
          <div className="text-xs text-muted-foreground">1% = risco máx</div>
        </div>
        <ArrowRight className="shrink-0 text-muted-foreground" size={16} />
        <div className="flex-1 rounded-lg border border-border bg-background/60 p-3 text-center">
          <div className="font-mono text-base font-bold">R$90</div>
          <div className="text-xs text-muted-foreground">risco por lote</div>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="h-8 w-full rounded-t-md bg-success/70" />
            <span className="font-mono text-[11px] text-muted-foreground">lote {i + 1}</span>
          </div>
        ))}
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="h-8 w-full rounded-t-md border border-dashed border-loss/60 bg-loss/10" />
          <span className="font-mono text-[11px] text-loss">lote 6</span>
        </div>
      </div>
      <p className="mt-4 text-sm">
        Máximo <strong>5 lotes</strong> (5 × R$90 = R$450 ≤ R$500). O sexto lote come o seu limite —
        e o seu jantar.
      </p>
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
    case "direito":
      return <DireitoVisual />;
    case "vencimento":
      return <VencimentoVisual />;
    case "sizing":
      return <SizingVisual />;
    case "coberta":
      return <CobertaVisual />;
    case "roll":
      return <RollVisual />;
    case "risco":
      return <RiscoVisual />;
    case "candle":
    case "pavio":
    case "forca":
    case "congestao":
    case "tendencia":
    case "rompimento":
      return <LeituraVisual kind={kind} />;
    default:
      return null;
  }
}
