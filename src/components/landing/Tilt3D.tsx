import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tilt3D — inclinação 3D sutil no hover, com brilho que segue o cursor.
 * Puro CSS/React, sem libs. Desativa em toque (pointer coarse) via CSS.
 */
export function Tilt3D({
  children,
  className,
  max = 7,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50, on: false });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        setT({
          rx: (0.5 - py) * max * 2,
          ry: (px - 0.5) * max * 2,
          mx: px * 100,
          my: py * 100,
          on: true,
        });
      }}
      onMouseLeave={() => setT((s) => ({ ...s, rx: 0, ry: 0, on: false }))}
      style={{ perspective: "1000px" }}
      className={cn("group/tilt h-full", className)}
    >
      <div
        style={{
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) translateZ(0)`,
          transition: t.on ? "transform 90ms linear" : "transform 550ms cubic-bezier(.2,.8,.2,1)",
          transformStyle: "preserve-3d",
        }}
        className="relative h-full"
      >
        {children}
        {glare ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
            style={{
              background: `radial-gradient(340px circle at ${t.mx}% ${t.my}%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 62%)`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
