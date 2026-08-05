import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlarmClock } from "lucide-react";
import type { Perna } from "@/lib/payoff";
import { payoffCurve } from "@/lib/payoff";
import { premioTeorico, repricarPernas } from "@/engines/position-intelligence";

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

/**
 * "Simular no tempo" — o slider de dias recalcula o prêmio teórico de cada
 * perna via Black-Scholes em tempo real (memoizado, sem gargalo de render).
 */
export function CenarioTempo({
  pernas,
  centro,
  ativo,
  dias,
  iv,
  onDias,
  onIv,
}: {
  pernas: Perna[];
  centro: number;
  ativo: string;
  dias: number;
  iv: number;
  onDias: (d: number) => void;
  onIv: (v: number) => void;
}) {
  const repricadas = useMemo(
    () => repricarPernas(pernas, centro, dias, iv),
    [pernas, centro, dias, iv],
  );

  const curvaVenc = useMemo(() => payoffCurve(pernas, centro, 0.3, 61), [pernas, centro]);
  const curvaHoje = useMemo(() => payoffCurve(repricadas, centro, 0.3, 61), [repricadas, centro]);

  const dados = useMemo(
    () => curvaVenc.map((p, i) => ({ ...p, hoje: curvaHoje[i]?.resultado ?? p.resultado })),
    [curvaVenc, curvaHoje],
  );

  const custoPago = useMemo(
    () =>
      pernas.reduce((s, p) => s + (p.acao === "compra" ? p.premio : -p.premio) * p.quantidade, 0),
    [pernas],
  );
  const custoTeorico = useMemo(
    () =>
      repricadas.reduce(
        (s, p) => s + (p.acao === "compra" ? p.premio : -p.premio) * p.quantidade,
        0,
      ),
    [repricadas],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <AlarmClock size={14} className="text-primary" /> Simular no tempo
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Arraste o tempo: cada perna é reprecificada na hora pelo modelo Black-Scholes. A linha
        laranja é sua operação <em>hoje</em>; a verde, no vencimento.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Dias até o vencimento</span>
            <span className="font-mono font-semibold text-foreground">{dias} dias</span>
          </div>
          <input
            type="range"
            min={5}
            max={90}
            step={1}
            value={dias}
            onChange={(e) => onDias(Number(e.target.value))}
            className="mt-2 w-full accent-[oklch(0.78_0.17_65)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>5</span>
            <span>90</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Volatilidade implícita (IV)</span>
            <span className="font-mono font-semibold text-foreground">{iv}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            step={1}
            value={iv}
            onChange={(e) => onIv(Number(e.target.value))}
            className="mt-2 w-full accent-[oklch(0.78_0.17_65)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>10%</span>
            <span>80%</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-background/40 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Prêmio teórico de cada perna hoje ({dias} dias · IV {iv}%)
        </div>
        <ul className="mt-2 space-y-1.5">
          {pernas.map((p, i) => {
            const teorico = premioTeorico(p, centro, dias, iv);
            return (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {p.acao === "compra" ? "Compra" : "Venda"} de {p.tipo} {p.strike.toFixed(1)}
                </span>
                <span className="font-mono">
                  <span className={p.acao === "compra" ? "text-loss" : "text-success"}>
                    {p.acao === "compra" ? "-" : "+"}
                    {teorico.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {" "}
                    (você pagou {p.premio.toFixed(2)})
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm">
          <span className="text-muted-foreground">Custo líquido da estrutura</span>
          <span className="font-mono font-semibold">
            <span className={custoTeorico > custoPago ? "text-loss" : "text-success"}>
              {custoTeorico < 0 ? `-${brl(Math.abs(custoTeorico))}` : `+${brl(custoTeorico)}`}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {" "}
              (pago: {brl(Math.abs(custoPago))})
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer>
          <AreaChart data={dados}>
            <defs>
              <linearGradient id="ct-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="preco" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12 }}
              formatter={(v: number, nome: string) => [
                `R$ ${v.toFixed(2)}`,
                nome === "hoje" ? "Hoje" : "Vencimento",
              ]}
              labelFormatter={(l) => `Preço: R$ ${l}`}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            <ReferenceLine
              x={centro}
              stroke="oklch(0.78 0.17 65)"
              strokeDasharray="4 4"
              label={{ value: "hoje", position: "top", fill: "oklch(0.78 0.17 65)", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="resultado"
              name="vencimento"
              stroke="oklch(0.72 0.18 155)"
              fill="url(#ct-g)"
              baseValue={0}
            />
            <Area
              type="monotone"
              dataKey="hoje"
              name="hoje"
              stroke="oklch(0.78 0.17 65)"
              fill="transparent"
              strokeDasharray="5 3"
              baseValue={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {ativo} hoje em {brl(centro)}. Quanto menos dias, mais o prêmio encosta no valor intrínseco
        — é o Theta corroendo o tempo que você comprou.
      </p>
    </div>
  );
}
