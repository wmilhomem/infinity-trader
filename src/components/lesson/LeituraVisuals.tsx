import { useState } from "react";
import type { LessonVisualKind } from "@/lib/lesson-meta";
import { CHECKLIST_ROMPIMENTO } from "@/lib/market-reading";
import { Activity, CheckCircle2, MousePointerClick, TrendingDown, TrendingUp } from "lucide-react";

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

export function LeituraVisual({ kind }: { kind: LessonVisualKind }) {
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
    default:
      return null;
  }
}
