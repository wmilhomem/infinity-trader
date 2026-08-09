import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  FlaskConical,
  PlayCircle,
  ShieldAlert,
  Sigma,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { CenariosCard } from "@/components/lessons/CenariosCard";
import type { FichaEstrategia } from "@/lib/fichas-estrategias";
import { getLesson } from "@/lib/lessons";
import { PRESETS_ESTRATEGIA } from "@/lib/presets-estrategias";
import { payoffCurve, summary } from "@/lib/payoff";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const NATUREZA_LABEL = {
  debito: "Débito",
  credito: "Crédito",
  mista: "Mista",
} as const;

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

export function FichaDetalhe({
  ficha,
  aberta,
  onFechar,
  onSimular,
}: {
  ficha: FichaEstrategia | null;
  aberta: boolean;
  onFechar: () => void;
  onSimular: () => void;
}) {
  const preset = ficha ? PRESETS_ESTRATEGIA[ficha.preset] : null;
  const stats = useMemo(
    () => (ficha && preset ? summary(preset.pernas, preset.centro) : null),
    [ficha, preset],
  );
  const curva = useMemo(
    () => (ficha && preset ? payoffCurve(preset.pernas, preset.centro, 0.3, 61) : []),
    [ficha, preset],
  );
  const licao = ficha ? getLesson(ficha.licaoSlug) : null;

  if (!ficha || !preset || !stats) return null;

  const risco = Math.abs(Math.min(0, stats.perdaMax));
  const lucroTeto =
    Number.isFinite(stats.lucroMax) && stats.lucroMax < 1e6
      ? brl(Math.max(0, stats.lucroMax))
      : "Ilimitado";

  return (
    <Sheet open={aberta} onOpenChange={(o) => !o && onFechar()}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border sm:max-w-xl">
        <SheetHeader className="flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/20 text-primary">
              <FlaskConical size={18} />
            </div>
            <SheetTitle className="text-lg font-bold leading-tight">{ficha.nome}</SheetTitle>
          </div>
          <SheetClose className="rounded-md p-1 text-muted-foreground hover:bg-accent">
            <X size={16} />
          </SheetClose>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                Hipótese · {ficha.hipotese}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                {NATUREZA_LABEL[ficha.natureza]}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                {preset.ativo} · centro {brl(preset.centro)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{ficha.expressa}</p>
          </div>

          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Perfil de risco e retorno
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">{ficha.perfilRisco}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border bg-accent/40 p-3">
                <div className="text-[10px] text-muted-foreground">Perda máx (lote 100)</div>
                <div className="font-mono text-sm font-semibold text-loss">{brl(risco)}</div>
              </div>
              <div className="rounded-xl border border-border bg-accent/40 p-3">
                <div className="text-[10px] text-muted-foreground">Lucro máx (lote 100)</div>
                <div className="font-mono text-sm font-semibold text-success">{lucroTeto}</div>
              </div>
              <div className="rounded-xl border border-border bg-accent/40 p-3">
                <div className="text-[10px] text-muted-foreground">Breakevens</div>
                <div className="font-mono text-sm font-semibold">
                  {stats.breakevens.length ? stats.breakevens.map((b) => brl(b)).join(" · ") : "—"}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border p-3">
              <div className="mb-2 text-[10px] text-muted-foreground">
                Exemplo com {preset.ativo} {brl(preset.centro)} · o gráfico não é recomendação: é o
                mapa da estrutura
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={curva} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="labPayoff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="preco" tick={{ fontSize: 10 }} stroke="var(--border)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--border)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => brl(v)}
                    labelFormatter={(v: number) => `Preço: ${brl(v)}`}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                  <ReferenceLine x={preset.centro} stroke="var(--border)" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="resultado"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#labPayoff)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Sigma size={12} /> Gregas que mandam
            </div>
            <ul className="space-y-1.5">
              {ficha.gregas.map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <ShieldAlert size={12} /> O que vigiar
            </div>
            <ul className="space-y-1.5">
              {ficha.alertas.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-foreground/85">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-chart-2" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Regras que você pode adotar
            </div>
            <ul className="space-y-1.5">
              {ficha.regras.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-chart-2/80" />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Regras são suas: o copilot lembra delas e nunca decide por você.
            </p>
          </div>

          <CenariosCard cenarios={ficha.cenarios} />

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {licao && (
              <Link
                to="/licao/$slug"
                params={{ slug: ficha.licaoSlug }}
                onClick={onFechar}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
              >
                <BookOpen size={15} /> Estudar na lição {licao.ordem}
              </Link>
            )}
            <button
              onClick={onSimular}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <PlayCircle size={15} /> Levar ao simulador
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
