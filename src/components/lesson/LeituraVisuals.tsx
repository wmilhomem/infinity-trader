import { useState } from "react";
import type { LessonVisualKind } from "@/lib/lesson-meta";
import { CHECKLIST_ROMPIMENTO } from "@/lib/market-reading";
import {
  Activity,
  ChartCandlestick,
  CheckCircle2,
  MousePointerClick,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function CandleVisual() {
  const [sel, setSel] = useState<string | null>("fechamento");
  const partes = [
    {
      id: "maxima",
      rotulo: "Máxima",
      texto:
        "O preço esteve neste topo — e voltou. Registro de rejeição naquele duelo, não um destino.",
    },
    {
      id: "fechamento",
      rotulo: "Fechamento",
      texto: "O preço que sobrou no fim do período: é quem venceu o duelo.",
    },
    {
      id: "abertura",
      rotulo: "Abertura",
      texto: "O preço em que o período começou — o ponto de partida do duelo.",
    },
    {
      id: "minima",
      rotulo: "Mínima",
      texto: "O preço tocou neste piso — e a compra reagiu. Onde a queda perdeu força.",
    },
  ] as const;
  const zonas: Record<string, { x: number; y: number; w: number; h: number }> = {
    maxima: { x: 136, y: 18, w: 48, h: 60 },
    fechamento: { x: 136, y: 75, w: 48, h: 30 },
    abertura: { x: 136, y: 105, w: 48, h: 30 },
    minima: { x: 136, y: 135, w: 48, h: 65 },
  };
  const ativa = partes.find((p) => p.id === sel);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <MousePointerClick size={14} /> Anatomia de um candle de alta — clique em cada parte
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <svg viewBox="0 0 320 225" className="w-full">
          <line
            x1="150"
            y1="25"
            x2="150"
            y2="75"
            stroke="var(--success)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect
            x="135"
            y="75"
            width="30"
            height="60"
            rx="3"
            fill="var(--success)"
            fillOpacity="0.85"
          />
          <line
            x1="150"
            y1="135"
            x2="150"
            y2="195"
            stroke="var(--success)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {Object.entries(zonas).map(([id, z]) => (
            <rect
              key={id}
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx="6"
              fill="transparent"
              stroke={sel === id ? "var(--primary)" : "transparent"}
              strokeWidth="2"
              strokeDasharray="5 4"
              className="cursor-pointer"
              onClick={() => setSel(id)}
            />
          ))}
          <text x="205" y="45" fontSize="12" fill="var(--muted-foreground)">
            máxima
          </text>
          <text x="205" y="98" fontSize="12" fill="var(--success)">
            fechamento
          </text>
          <text x="205" y="128" fontSize="12" fill="var(--muted-foreground)">
            abertura
          </text>
          <text x="205" y="172" fontSize="12" fill="var(--muted-foreground)">
            mínima
          </text>
        </svg>
        <div>
          <div
            className={`rounded-lg border p-3 text-sm ${ativa ? "border-primary/50 bg-primary/10" : "border-border"}`}
          >
            <div className="font-semibold">{ativa?.rotulo}</div>
            <p className="mt-1 text-muted-foreground">{ativa?.texto}</p>
          </div>
          <p className="mt-3 text-sm">
            O candle <strong>descreve</strong> o que aconteceu. Ele nunca recomenda o que fazer.
          </p>
        </div>
      </div>
    </div>
  );
}

function PavioVisual() {
  const [sel, setSel] = useState<string | null>("pavio");
  const partes = [
    {
      id: "pavio",
      rotulo: "Pavio superior longo",
      texto:
        "O preço subiu até esta região e foi rejeitado: a venda venceu este duelo. Sozinho, não determina o que fazer.",
    },
    {
      id: "corpo",
      rotulo: "Corpo pequeno no chão do período",
      texto:
        "O fechamento ficou próximo da abertura, longe do topo: o avanço não se sustentou até o fim.",
    },
  ] as const;
  const ativa = partes.find((p) => p.id === sel);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <MousePointerClick size={14} /> Pavio superior — clique nas regiões
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <svg viewBox="0 0 320 215" className="w-full">
          <line
            x1="160"
            y1="32"
            x2="160"
            y2="152"
            stroke="var(--loss)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect
            x="128"
            y="152"
            width="64"
            height="32"
            rx="3"
            fill="var(--loss)"
            fillOpacity="0.85"
          />
          <line
            x1="160"
            y1="184"
            x2="160"
            y2="198"
            stroke="var(--loss)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="60"
            y1="40"
            x2="252"
            y2="40"
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <rect
            x="100"
            y="12"
            width="210"
            height="142"
            rx="8"
            fill="transparent"
            stroke={sel === "pavio" ? "var(--primary)" : "transparent"}
            strokeWidth="2"
            strokeDasharray="5 4"
            className="cursor-pointer"
            onClick={() => setSel("pavio")}
          />
          <rect
            x="100"
            y="152"
            width="210"
            height="50"
            rx="8"
            fill="transparent"
            stroke={sel === "corpo" ? "var(--primary)" : "transparent"}
            strokeWidth="2"
            strokeDasharray="5 4"
            className="cursor-pointer"
            onClick={() => setSel("corpo")}
          />
          <text x="228" y="50" fontSize="12" fill="var(--muted-foreground)">
            onde o preço esteve
          </text>
          <text x="236" y="172" fontSize="12" fill="var(--muted-foreground)">
            onde fechou
          </text>
          <text x="70" y="34" fontSize="12" fill="var(--muted-foreground)">
            região rejeitada
          </text>
        </svg>
        <div>
          <div
            className={`rounded-lg border p-3 text-sm ${ativa ? "border-primary/50 bg-primary/10" : "border-border"}`}
          >
            <div className="font-semibold">{ativa?.rotulo}</div>
            <p className="mt-1 text-muted-foreground">{ativa?.texto}</p>
          </div>
          <p className="mt-3 text-sm">
            Pavio é <strong>observação</strong>. A leitura nasce do contexto — força, sequência e
            região.
          </p>
        </div>
      </div>
    </div>
  );
}

function ForcaVisual() {
  const seqA = [14, 14, 14, 14];
  const seqB = [14, 46, 14, 14];
  const [sel, setSel] = useState<{ seq: "A" | "B"; idx: number } | null>(null);
  const pontos = { A: 20, B: 60 };
  const reais = { A: 4, B: 12 };
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Activity size={14} /> Força se mede em reais — clique nas velas
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["A", "B"] as const).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-background/50 p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Sequência {s}
              </span>
              <span className="font-mono text-sm font-bold">
                {s === "A" ? "+20 pts" : "+60 pts"} · R$ {reais[s]},00
              </span>
            </div>
            <svg viewBox="0 0 240 75" className="w-full">
              {(s === "A" ? seqA : seqB).map((h, i) => {
                const x = 34 + i * 46;
                const base = 62;
                const top = base - h;
                const on = sel?.seq === s && sel.idx === i;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setSel({ seq: s, idx: i })}>
                    <rect
                      x={x - 14}
                      y={top - 14}
                      width={48}
                      height={60}
                      rx="8"
                      fill="transparent"
                      stroke={on ? "var(--primary)" : "transparent"}
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    <rect
                      x={x + 10}
                      y={top}
                      width={20}
                      height={h}
                      rx="2"
                      fill="var(--success)"
                      fillOpacity="0.85"
                    />
                    <line
                      x1={x + 20}
                      y1={top - 5}
                      x2={x + 20}
                      y2={base}
                      stroke="var(--success)"
                      strokeWidth="2"
                    />
                    <text
                      x={x + 20}
                      y={base + 11}
                      fontSize="10"
                      fill="var(--muted-foreground)"
                      textAnchor="middle"
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-1 h-5 font-mono text-xs text-muted-foreground">
              {sel && sel.seq === s
                ? `Vela ${sel.idx + 1}: ${(s === "A" ? seqA : seqB)[sel.idx]} px de corpo`
                : " "}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm">
        Mesma quantidade de velas, forças diferentes: a sequência B andou{" "}
        <strong>3× mais em reais</strong>. Compare em pontos, nunca em pixels.
      </p>
    </div>
  );
}

function CongestaoVisual() {
  const [sel, setSel] = useState<"congestao" | "expansao">("congestao");
  const expand = [128, 118, 108, 96, 84, 72];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <MousePointerClick size={14} /> Congestão e expansão — clique nas faixas
      </div>
      <svg viewBox="0 0 320 205" className="w-full">
        <rect
          x="8"
          y="8"
          width="158"
          height="186"
          rx="8"
          fill={sel === "congestao" ? "var(--primary)" : "transparent"}
          fillOpacity={sel === "congestao" ? 0.08 : 0}
          stroke={sel === "congestao" ? "var(--primary)" : "var(--border)"}
          strokeWidth="2"
          strokeDasharray="5 4"
          className="cursor-pointer"
          onClick={() => setSel("congestao")}
        />
        <rect
          x="170"
          y="8"
          width="142"
          height="186"
          rx="8"
          fill={sel === "expansao" ? "var(--primary)" : "transparent"}
          fillOpacity={sel === "expansao" ? 0.08 : 0}
          stroke={sel === "expansao" ? "var(--primary)" : "var(--border)"}
          strokeWidth="2"
          strokeDasharray="5 4"
          className="cursor-pointer"
          onClick={() => setSel("expansao")}
        />
        <text
          x="44"
          y="30"
          fontSize="13"
          fontWeight="700"
          fill={sel === "congestao" ? "var(--primary)" : "var(--muted-foreground)"}
        >
          congestão
        </text>
        <text
          x="202"
          y="30"
          fontSize="13"
          fontWeight="700"
          fill={sel === "expansao" ? "var(--primary)" : "var(--muted-foreground)"}
        >
          expansão
        </text>
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 26 + i * 22;
          const top = 112 + (i % 2 === 0 ? -12 : 0);
          return (
            <g key={i}>
              <rect
                x={x}
                y={top}
                width={11}
                height={26}
                rx="2"
                fill="var(--muted-foreground)"
                fillOpacity="0.55"
              />
              <line
                x1={x + 5}
                y1={top - 4}
                x2={x + 5}
                y2={top + 30}
                stroke="var(--muted-foreground)"
                strokeWidth="1.5"
                strokeOpacity="0.55"
              />
            </g>
          );
        })}
        {expand.map((top, i) => {
          const x = 188 + i * 19;
          return (
            <g key={i}>
              <rect
                x={x}
                y={top}
                width={11}
                height={72}
                rx="2"
                fill="var(--success)"
                fillOpacity="0.85"
              />
              <line
                x1={x + 5}
                y1={top - 4}
                x2={x + 5}
                y2={top + 76}
                stroke="var(--success)"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
        <text x="200" y="196" fontSize="10" fill="var(--muted-foreground)">
          a faixa se abre
        </text>
      </svg>
      <p className="mt-3 text-sm">
        {sel === "congestao" ? (
          <>
            Faixa estreita: o preço circula <strong>sem escolher lado</strong>. Mercado parado por
            muito tempo também fala — e pode continuar parado.
          </>
        ) : (
          <>
            A faixa se abre e o preço começa a andar <strong>de verdade</strong>. É aqui que
            hipóteses ganham corpo.
          </>
        )}
      </p>
    </div>
  );
}

function TendenciaVisual() {
  const [modo, setModo] = useState<"tendencia" | "lateralizacao">("tendencia");
  const alta = [
    { top: 140, bottom: 172 },
    { top: 130, bottom: 164 },
    { top: 120, bottom: 156 },
    { top: 110, bottom: 148 },
    { top: 100, bottom: 140 },
    { top: 90, bottom: 132 },
  ];
  const lado = [
    { top: 104, bottom: 166 },
    { top: 108, bottom: 160 },
    { top: 100, bottom: 168 },
    { top: 106, bottom: 162 },
    { top: 102, bottom: 166 },
    { top: 108, bottom: 160 },
  ];
  const cand = (modo === "tendencia" ? alta : lado).map((c, i) => {
    const x = 28 + i * 46;
    return (
      <g key={i}>
        <rect
          x={x}
          y={c.top}
          width={22}
          height={c.bottom - c.top}
          rx="2"
          fill="var(--success)"
          fillOpacity="0.85"
        />
        <line
          x1={x + 11}
          y1={c.top - 5}
          x2={x + 11}
          y2={c.bottom}
          stroke="var(--success)"
          strokeWidth="2"
        />
      </g>
    );
  });
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setModo("tendencia")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${modo === "tendencia" ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
        >
          <TrendingUp size={14} /> Tendência
        </button>
        <button
          onClick={() => setModo("lateralizacao")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${modo === "lateralizacao" ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
        >
          <TrendingDown size={14} /> Lateralização
        </button>
      </div>
      <svg viewBox="0 0 320 190" className="w-full">
        {modo === "tendencia" ? (
          <>
            {cand}
            <line
              x1="24"
              y1="178"
              x2="296"
              y2="126"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text x="252" y="112" fontSize="12" fill="var(--primary)">
              toques que respeitam
            </text>
            <text x="264" y="126" fontSize="12" fill="var(--primary)">
              o nível
            </text>
          </>
        ) : (
          <>
            {cand}
            <line
              x1="24"
              y1="96"
              x2="296"
              y2="96"
              stroke="var(--loss)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <line
              x1="24"
              y1="170"
              x2="296"
              y2="170"
              stroke="var(--success)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text x="220" y="88" fontSize="12" fill="var(--loss)">
              resistência
            </text>
            <text x="228" y="186" fontSize="12" fill="var(--success)">
              suporte
            </text>
          </>
        )}
      </svg>
      <p className="mt-3 text-sm">
        {modo === "tendencia" ? (
          <>
            Máximas e mínimas <strong>crescentes</strong>: os toques respeitam um nível que anda
            junto com o preço.
          </>
        ) : (
          <>
            O mercado <strong>respeita os dois lados</strong>. O rompimento fecharia o padrão — até
            lá, a leitura é especulação.
          </>
        )}
      </p>
    </div>
  );
}

function RompimentoVisual() {
  const [done, setDone] = useState<number[]>([]);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 size={14} /> Rompimento: evento, não ordem — toque nos passos
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <svg viewBox="0 0 320 185" className="w-full">
          <line
            x1="16"
            y1="112"
            x2="304"
            y2="112"
            stroke="var(--loss)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <text x="236" y="104" fontSize="12" fill="var(--loss)">
            resistência
          </text>
          {[
            { top: 128, bottom: 168 },
            { top: 140, bottom: 172 },
            { top: 132, bottom: 165 },
            { top: 142, bottom: 170 },
            { top: 74, bottom: 112 },
          ].map((c, i) => {
            const x = 26 + i * 48;
            const quebra = i === 4;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={c.top}
                  width={20}
                  height={c.bottom - c.top}
                  rx="2"
                  fill={quebra ? "var(--primary)" : "var(--muted-foreground)"}
                  fillOpacity={quebra ? 0.9 : 0.55}
                />
                <line
                  x1={x + 10}
                  y1={c.top - 5}
                  x2={x + 10}
                  y2={c.bottom}
                  stroke={quebra ? "var(--primary)" : "var(--muted-foreground)"}
                  strokeWidth="2"
                />
                <rect
                  x={x + 4}
                  y={174 - (quebra ? 22 : 7)}
                  width={12}
                  height={quebra ? 22 : 7}
                  rx="2"
                  fill={quebra ? "var(--primary)" : "var(--muted)"}
                />
              </g>
            );
          })}
          <text x="216" y="52" fontSize="12" fontWeight="700" fill="var(--primary)">
            rompimento
          </text>
        </svg>
        <ol className="space-y-2">
          {CHECKLIST_ROMPIMENTO.map((c, i) => {
            const ok = done.includes(i);
            return (
              <li key={c.passo}>
                <button
                  onClick={() => setDone((d) => (ok ? d.filter((x) => x !== i) : [...d, i]))}
                  className={`flex w-full items-start gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors ${ok ? "border-success/50 bg-success/10" : "border-border hover:bg-accent"}`}
                >
                  <CheckCircle2
                    size={16}
                    className={
                      ok ? "mt-0.5 shrink-0 text-success" : "mt-0.5 shrink-0 text-muted-foreground"
                    }
                  />
                  <span>
                    <span className="font-semibold">{c.passo}.</span> {c.pergunta}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-3 text-sm">
        O checklist fecha a <strong>leitura</strong> antes de qualquer decisão: contexto, evidência,
        regra e risco — nessa ordem.
      </p>
    </div>
  );
}

function linha(pontos: [number, number][], cor: string, largura: number) {
  const d = pontos.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  return (
    <path
      d={d}
      fill="none"
      stroke={cor}
      strokeWidth={largura}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function MediasVisual() {
  const [modo, setModo] = useState<"tendencia" | "lateral">("tendencia");
  const preco: [number, number][] =
    modo === "tendencia"
      ? [
          [10, 150],
          [40, 140],
          [70, 143],
          [100, 128],
          [130, 132],
          [160, 115],
          [190, 118],
          [220, 100],
          [250, 104],
          [280, 86],
        ]
      : [
          [10, 120],
          [40, 145],
          [70, 112],
          [100, 140],
          [130, 115],
          [160, 138],
          [190, 118],
          [220, 135],
          [250, 120],
          [280, 132],
        ];
  const mm9: [number, number][] =
    modo === "tendencia"
      ? [
          [10, 148],
          [40, 142],
          [70, 141],
          [100, 132],
          [130, 130],
          [160, 120],
          [190, 116],
          [220, 104],
          [250, 100],
          [280, 92],
        ]
      : [
          [10, 124],
          [40, 138],
          [70, 118],
          [100, 134],
          [130, 122],
          [160, 132],
          [190, 124],
          [220, 130],
          [250, 126],
          [280, 127],
        ];
  const mm200: [number, number][] =
    modo === "tendencia"
      ? [
          [10, 154],
          [40, 148],
          [70, 143],
          [100, 136],
          [130, 131],
          [160, 124],
          [190, 119],
          [220, 112],
          [250, 107],
          [280, 102],
        ]
      : [
          [10, 128],
          [40, 128],
          [70, 128],
          [100, 128],
          [130, 128],
          [160, 128],
          [190, 128],
          [220, 128],
          [250, 128],
          [280, 128],
        ];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setModo("tendencia")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${modo === "tendencia" ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
        >
          <TrendingUp size={14} /> Tendência
        </button>
        <button
          onClick={() => setModo("lateral")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${modo === "lateral" ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
        >
          <TrendingDown size={14} /> Lateralização
        </button>
      </div>
      <svg viewBox="0 0 320 175" className="w-full">
        {linha(mm200, "var(--loss)", 3)}
        {linha(mm9, "var(--chart-2)", 2)}
        {linha(preco, "var(--success)", 2)}
        {modo === "lateral" && (
          <circle
            cx="100"
            cy="134"
            r="6"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        )}
        <text x="230" y="24" fontSize="12" fill="var(--loss)">
          MM200
        </text>
        <text x="230" y="40" fontSize="12" fill="var(--chart-2)">
          MM9
        </text>
        <text x="230" y="56" fontSize="12" fill="var(--success)">
          preço
        </text>
      </svg>
      <p className="mt-3 text-sm">
        {modo === "tendencia" ? (
          <>
            Fechamentos mantidos <strong>acima</strong> da média descrevem força relativa recente —
            contexto para a hipótese, não ordem.
          </>
        ) : (
          <>
            Em lateralização, a MM9 cruza a MM200 <strong>sem continuação</strong> (whiplash): o
            mesmo evento se repete sem força nova.
          </>
        )}
      </p>
    </div>
  );
}

function VwapVisual() {
  const [lado, setLado] = useState<"acima" | "abaixo">("acima");
  const vwap: [number, number][] = [
    [10, 150],
    [50, 145],
    [90, 146],
    [130, 138],
    [170, 139],
    [210, 130],
    [250, 132],
    [290, 128],
  ];
  const precoAcima: [number, number][] = [
    [10, 140],
    [50, 136],
    [90, 133],
    [130, 128],
    [170, 124],
    [210, 118],
    [250, 116],
    [290, 110],
  ];
  const precoAbaixo: [number, number][] = [
    [10, 160],
    [50, 162],
    [90, 158],
    [130, 156],
    [170, 152],
    [210, 150],
    [250, 148],
    [290, 146],
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setLado("acima")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${lado === "acima" ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
        >
          <TrendingUp size={14} /> Preço acima
        </button>
        <button
          onClick={() => setLado("abaixo")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${lado === "abaixo" ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}
        >
          <TrendingDown size={14} /> Preço abaixo
        </button>
      </div>
      <svg viewBox="0 0 320 175" className="w-full">
        {linha(vwap, "var(--loss)", 3)}
        {linha(lado === "acima" ? precoAcima : precoAbaixo, "var(--success)", 2)}
        <text x="222" y="24" fontSize="12" fill="var(--loss)">
          VWAP
        </text>
        <text x="222" y="40" fontSize="12" fill="var(--success)">
          preço
        </text>
        {lado === "acima" && (
          <text x="16" y="118" fontSize="12" fill="var(--primary)">
            distância — importa mais que o lado
          </text>
        )}
      </svg>
      <p className="mt-3 text-sm">
        {lado === "acima" ? (
          <>
            A sessão negocia, em média, <strong>acima</strong> da referência ponderada — força
            relativa do dia, contexto, não garantia.
          </>
        ) : (
          <>
            A sessão média está <strong>abaixo</strong> da referência — registro do pregão, não
            ordem de venda.
          </>
        )}
      </p>
    </div>
  );
}

function FibonacciVisual() {
  const niveis = [
    {
      id: "236",
      rotulo: "23,6%",
      y: 96,
      texto: "Retração rasa — o impulso ainda segura a maior parte do movimento.",
    },
    {
      id: "382",
      rotulo: "38,2%",
      y: 112,
      texto: "Retração média — os compradores do fundo seguem ativos?",
    },
    {
      id: "50",
      rotulo: "50%",
      y: 125,
      texto: "Metade do movimento devolvida — o mercado entrega metade do que andou?",
    },
    {
      id: "618",
      rotulo: "61,8%",
      y: 138,
      texto: "Retração profunda — quem entrou no topo segura a região?",
    },
  ] as const;
  const [sel, setSel] = useState<(typeof niveis)[number]["id"]>("618");
  const ativo = niveis.find((n) => n.id === sel);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <ChartCandlestick size={14} /> Retrações sobre o movimento medido — clique nos níveis
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <svg viewBox="0 0 320 200" className="w-full">
          {linha(
            [
              [20, 180],
              [80, 120],
              [140, 70],
              [200, 105],
              [240, 122],
              [280, 138],
            ],
            "var(--success)",
            3,
          )}
          <line
            x1="20"
            y1="180"
            x2="300"
            y2="180"
            stroke="var(--success)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="12" y="172" fontSize="11" fill="var(--success)">
            fundo
          </text>
          <text x="222" y="62" fontSize="11" fill="var(--success)">
            topo
          </text>
          {niveis.map((n) => (
            <g key={n.id} className="cursor-pointer" onClick={() => setSel(n.id)}>
              <line
                x1="30"
                y1={n.y}
                x2="292"
                y2={n.y}
                stroke={sel === n.id ? "var(--primary)" : "var(--muted-foreground)"}
                strokeWidth={sel === n.id ? 2 : 1}
                strokeDasharray="6 4"
              />
              <rect
                x="30"
                y={n.y - 11}
                width="72"
                height="22"
                rx="5"
                fill={sel === n.id ? "var(--primary)" : "var(--card)"}
                fillOpacity={sel === n.id ? 0.15 : 0}
                stroke={sel === n.id ? "var(--primary)" : "transparent"}
                strokeWidth="1"
              />
              <text
                x="36"
                y={n.y + 4}
                fontSize="12"
                fontWeight={sel === n.id ? 700 : 400}
                fill={sel === n.id ? "var(--primary)" : "var(--muted-foreground)"}
              >
                retração {n.rotulo}
              </text>
            </g>
          ))}
        </svg>
        <div>
          <div className="rounded-lg border border-primary/50 bg-primary/10 p-3 text-sm">
            <div className="font-semibold">Retração {ativo?.rotulo}</div>
            <p className="mt-1 text-muted-foreground">{ativo?.texto}</p>
          </div>
          <p className="mt-3 text-sm">
            Níveis são <strong>regiões de referência</strong>, não ordens — e o desenho depende do
            movimento que você declara medir.
          </p>
        </div>
      </div>
    </div>
  );
}

function RenkoVisual({ mode }: { mode: "comparacao" | "resolucao" | "evidencia" }) {
  const [val, setVal] = useState<number>(3);
  const [showEv, setShowEv] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <MousePointerClick size={14} />{" "}
        {mode === "comparacao"
          ? "Candle vs Renko — O mercado é o mesmo"
          : mode === "resolucao"
            ? "Tamanho do bloco — Mude a resolução"
            : "Renko é evidência, não gatilho"}
      </div>

      {mode === "comparacao" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4 text-center">
            <div className="mb-2 text-xs uppercase text-muted-foreground">
              Candle (Tempo + Movimento)
            </div>
            <div className="font-mono text-xl h-24 flex items-center justify-center gap-2">
              <span className="text-success">🟩</span>
              <span className="text-success">🟩</span>
              <span className="text-loss">🟥</span>
              <span className="text-success">🟩</span>
              <span className="text-loss">🟥</span>
              <span className="text-loss">🟥</span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4 text-center">
            <div className="mb-2 text-xs uppercase text-muted-foreground">
              Renko (Apenas Movimento)
            </div>
            <div className="font-mono text-xl h-24 flex items-center justify-center -space-x-1">
              <div className="flex flex-col">
                <span className="text-success">🟩</span>
              </div>
              <div className="flex flex-col">
                <span className="text-success">🟩</span>
                <span className="text-transparent">🟩</span>
              </div>
              <div className="flex flex-col">
                <span className="text-loss">🟥</span>
                <span className="text-transparent">🟩</span>
                <span className="text-transparent">🟩</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm md:col-span-2">
            A forma visual muda, mas a realidade do sistema financeiro é idêntica. Renko elimina
            ruídos temporais e enfatiza sequências direcionais reais.
          </p>
        </div>
      )}

      {mode === "resolucao" && (
        <div className="flex flex-col gap-4">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="text-center text-sm font-mono text-muted-foreground mb-2">
            Tamanho do bloco: R$ {(val * 0.5).toFixed(2)}
          </div>
          <div className="rounded-lg border border-border bg-background p-4 pt-16 pb-8 h-32 flex items-center justify-center relative">
            <div className="flex items-end -space-x-1">
              {Array.from({ length: 6 - val }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col"
                  style={{ transform: `translateY(-${i * 12}px)` }}
                >
                  <span className="text-success font-mono text-xl">🟩</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm">
            Ao aumentar o bloco, o mercado ficou com menos volatilidade? <strong>Não.</strong> Você
            apenas alterou a "resolução" sobre qual ele apresenta a mesma realidade.
          </p>
        </div>
      )}

      {mode === "evidencia" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-success/30 bg-success/10 p-4">
            <div className="flex items-end justify-center h-16 mb-4 -space-x-1">
              <div className="flex flex-col">
                <span className="text-success font-mono text-xl">🟩</span>
              </div>
              <div className="flex flex-col" style={{ transform: "translateY(-12px)" }}>
                <span className="text-success font-mono text-xl">🟩</span>
              </div>
              <div className="flex flex-col" style={{ transform: "translateY(-24px)" }}>
                <span className="text-success font-mono text-xl">🟩</span>
              </div>
            </div>
            <p className="text-sm text-center">
              "O Renko mostra uma sequência de blocos na mesma direção."
            </p>
          </div>

          <button
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
            onClick={() => setShowEv(true)}
          >
            Isso é suficiente para operar?
          </button>

          {showEv && (
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="rounded-lg border border-success/30 bg-background p-4">
                <div className="font-semibold text-sm text-success mb-2">O QUE ELE MOSTRA</div>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Direção do movimento anterior</li>
                  <li>Sequência</li>
                  <li>Deslocamento relevante alcançado</li>
                </ul>
              </div>
              <div className="rounded-lg border border-loss/30 bg-background p-4">
                <div className="font-semibold text-sm text-loss mb-2">O QUE ELE NÃO DIZ</div>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Que o preço vai continuar</li>
                  <li>Que existe uma "entrada mágica"</li>
                  <li>Que a operação lhe trará lucro</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LeituraVisual({
  kind,
}: {
  kind:
    | "candle"
    | "pavio"
    | "forca"
    | "congestao"
    | "tendencia"
    | "rompimento"
    | "medias"
    | "vwap"
    | "fibonacci"
    | "renko-comparacao"
    | "renko-resolucao"
    | "renko-evidencia";
}) {
  switch (kind) {
    case "candle":
      return <CandleVisual />;
    case "pavio":
      return <PavioVisual />;
    case "forca":
      return <ForcaVisual />;
    case "congestao":
      return <CongestaoVisual />;
    case "tendencia":
      return <TendenciaVisual />;
    case "rompimento":
      return <RompimentoVisual />;
    case "medias":
      return <MediasVisual />;
    case "vwap":
      return <VwapVisual />;
    case "fibonacci":
      return <FibonacciVisual />;
    case "renko-comparacao":
      return <RenkoVisual mode="comparacao" />;
    case "renko-resolucao":
      return <RenkoVisual mode="resolucao" />;
    case "renko-evidencia":
      return <RenkoVisual mode="evidencia" />;
    default:
      return null;
  }
}
