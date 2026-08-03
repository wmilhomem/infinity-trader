/**
 * PayoffCurve — ilustração decorativa da curva de uma trava de alta.
 * Termos técnicos aparecem apenas como rótulos do desenho: hoje, breakeven,
 * lucro máximo e perda máxima. Sem nenhuma lib adicional — SVG puro.
 */
const W = 560;
const H = 250;
const X0 = 42;
const X1 = 518;
const Y0 = 20;
const Y1 = 228;

const pp = (p: number) => X0 + ((p - 32) / 12) * (X1 - X0);
const pv = (v: number) => Y1 - ((v - -150) / 250) * (Y1 - Y0);

const CURVA: [number, number][] = [
  [32, -90],
  [38, -90],
  [38.9, 0],
  [40, 10],
  [44, 10],
];

const pathLine = CURVA.map(
  ([p, v], i) => `${i === 0 ? "M" : "L"} ${pp(p).toFixed(1)},${pv(v).toFixed(1)}`,
).join(" ");
const pathArea = `${pathLine} L ${pp(44).toFixed(1)},${pv(0).toFixed(1)} L ${pp(32).toFixed(1)},${pv(0).toFixed(1)} Z`;

export function PayoffCurve() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id="lpv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 155)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[120, 160, 200, 240, 280, 320, 360, 400, 440, 480].map((x) => (
        <line key={x} x1={x} y1={Y0} x2={x} y2={Y1} stroke="rgba(255,255,255,0.04)" />
      ))}
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1={X0} y1={y} x2={X1} y2={y} stroke="rgba(255,255,255,0.04)" />
      ))}

      <line
        x1={X0}
        y1={pv(0)}
        x2={X1}
        y2={pv(0)}
        stroke="rgba(255,255,255,0.25)"
        strokeDasharray="3 3"
      />

      <path d={pathArea} fill="url(#lpv)" />
      <path
        d={pathLine}
        fill="none"
        stroke="oklch(0.72 0.18 155)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <line
        x1={pp(38)}
        y1={Y0}
        x2={pp(38)}
        y2={Y1}
        stroke="oklch(0.78 0.17 65)"
        strokeDasharray="4 4"
        strokeDashoffset="2"
      />
      <line
        x1={pp(38.9)}
        y1={Y0}
        x2={pp(38.9)}
        y2={Y1}
        stroke="rgba(255,255,255,0.4)"
        strokeDasharray="3 3"
      />

      <circle cx={pp(40)} cy={pv(10)} r="5" fill="oklch(0.72 0.18 155)" />
      <circle cx={pp(38)} cy={pv(-90)} r="5" fill="oklch(0.63 0.24 27)" />

      <text
        x={pp(38) - 6}
        y={Y0 + 14}
        textAnchor="end"
        fontSize="11"
        fill="oklch(0.78 0.17 65)"
        fontFamily="JetBrains Mono, monospace"
      >
        hoje
      </text>
      <text
        x={pp(38.9) + 4}
        y={Y0 + 14}
        fontSize="11"
        fill="rgba(255,255,255,0.6)"
        fontFamily="JetBrains Mono, monospace"
      >
        breakeven
      </text>
      <text
        x={pp(42) + 6}
        y={pv(10)}
        fontSize="10"
        fill="oklch(0.72 0.18 155)"
        fontFamily="JetBrains Mono, monospace"
      >
        lucro máximo
      </text>
      <text
        x={pp(34) + 6}
        y={pv(-90) + 4}
        fontSize="10"
        fill="oklch(0.63 0.24 27)"
        fontFamily="JetBrains Mono, monospace"
      >
        perda máxima
      </text>
    </svg>
  );
}
