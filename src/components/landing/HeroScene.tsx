import { useEffect, useRef, useState } from "react";

/**
 * HeroScene — cena 3D decorativa: piso em perspectiva, cartões de vidro
 * flutuando em profundidade e um anel orbital. CSS 3D puro, sem libs.
 * SSR-safe: o parallax só liga após montar no cliente.
 */
export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setP({
        x: (e.clientX - (r.left + r.width / 2)) / r.width,
        y: (e.clientY - (r.top + r.height / 2)) / r.height,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const rx = -p.y * 6;
  const ry = p.x * 10;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative mx-auto h-[420px] w-full max-w-3xl select-none md:h-[520px]"
      style={{ perspective: "1200px" }}
    >
      {/* halo */}
      <div
        className="absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[80px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
          transition: "transform 400ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* piso em perspectiva */}
        <div
          className="absolute bottom-2 left-1/2 h-[300px] w-[820px] -translate-x-1/2 opacity-[0.55]"
          style={{
            transform: "rotateX(72deg) translateZ(-120px)",
            transformStyle: "preserve-3d",
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--primary) 30%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 22%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(closest-side, #000 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent 78%)",
          }}
        />

        {/* anel orbital */}
        <div
          className="absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/35 md:size-[440px]"
          style={{ transform: "rotateX(74deg) translateZ(30px)", animation: "zat-spin 26s linear infinite" }}
        >
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_2px_color-mix(in_oklab,var(--primary)_70%,transparent)]" />
        </div>
        <div
          className="absolute left-1/2 top-1/2 size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-success/20 md:size-[300px]"
          style={{ transform: "rotateX(74deg) translateZ(70px)", animation: "zat-spin 18s linear infinite reverse" }}
        >
          <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-success shadow-[0_0_16px_2px_color-mix(in_oklab,var(--success)_70%,transparent)]" />
        </div>

        {/* cartões de vidro */}
        <GlassCard
          style={{ transform: "translate3d(-46%, -78%, 120px) rotateY(16deg) rotateX(6deg)", animationDelay: "0s" }}
          label="CHECK COGNITIVO"
          title="Como você chega hoje?"
          tone="primary"
        />
        <GlassCard
          style={{ transform: "translate3d(6%, -10%, 220px) rotateY(-6deg) rotateX(3deg)", animationDelay: "-2.4s" }}
          label="SIMULAÇÃO"
          title="Perda máxima — R$ 320"
          tone="loss"
          chart
        />
        <GlassCard
          style={{ transform: "translate3d(-58%, 44%, 60px) rotateY(18deg) rotateX(-4deg)", animationDelay: "-1.2s" }}
          label="DECISION SCORE"
          title="82 / 100 · processo"
          tone="success"
        />
      </div>
    </div>
  );
}

function GlassCard({
  style,
  label,
  title,
  tone,
  chart,
}: {
  style: React.CSSProperties;
  label: string;
  title: string;
  tone: "primary" | "success" | "loss";
  chart?: boolean;
}) {
  const dot =
    tone === "primary" ? "bg-primary" : tone === "success" ? "bg-success" : "bg-loss";
  return (
    <div
      className="absolute left-1/2 top-1/2 w-56 rounded-2xl border border-white/10 bg-card/60 p-4 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] backdrop-blur-xl md:w-64"
      style={{ ...style, animation: "zat-float 7s ease-in-out infinite", animationDelay: style.animationDelay }}
    >
      <div className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${dot}`} />
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3 text-sm font-semibold leading-snug">{title}</div>
      {chart ? (
        <svg viewBox="0 0 200 54" className="mt-3 h-12 w-full">
          <path
            d="M4 44 L70 44 L104 14 L196 14"
            fill="none"
            stroke="oklch(0.72 0.18 155)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M4 44 L70 44 L104 14 L196 14 L196 50 L4 50 Z" fill="oklch(0.72 0.18 155 / 0.12)" />
        </svg>
      ) : (
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-white/10" />
          <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
        </div>
      )}
    </div>
  );
}
