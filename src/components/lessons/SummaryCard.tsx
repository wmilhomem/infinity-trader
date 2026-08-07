import { ArrowRight, Check, MessageCircle, RefreshCcw, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Lesson } from "@/lib/lessons";
import type { LessonMeta } from "@/lib/lesson-meta";

type Props = {
  lesson: Lesson;
  meta: LessonMeta;
  score: number;
  proximaLicao?: Lesson;
  missaoAcertou?: boolean;
  missaoReverteu: boolean;
  missaoExplicada: boolean;
  onRefazer: () => void;
  onContinuar: () => void;
};

export function SummaryCard({
  lesson,
  meta,
  score,
  proximaLicao,
  missaoAcertou,
  missaoReverteu,
  missaoExplicada,
  onRefazer,
  onContinuar,
}: Props) {
  const aprendizados = meta.resumoPontos ?? lesson.conceitos.map((c) => c.titulo);
  const bom = score >= 80;
  const titulo = lesson.titulo.replace(/^Lição \d+ — /, "");

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-8 text-center ${bom ? "border-success/60 bg-success/10" : "border-loss/60 bg-loss/10"}`}
      >
        <div className="font-mono text-6xl font-bold">{score}%</div>
        <p className="mx-auto mt-3 max-w-md text-sm md:text-base">
          {bom
            ? "Lição concluída. Você não decorou — você entendeu."
            : "Faltou pouco. Refaça o quiz: aqui erro é treino, não prejuízo."}
        </p>
        {!bom && (
          <button
            onClick={onRefazer}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2 text-sm hover:bg-accent"
          >
            <RefreshCcw size={14} /> Refazer o quiz
          </button>
        )}
        {missaoAcertou !== undefined && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-card/60 p-4 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Missão da lição
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Check size={15} className={missaoAcertou ? "text-success" : "text-amber-400"} />
                {missaoAcertou
                  ? "Decisão correta na primeira tentativa"
                  : missaoReverteu
                    ? "Errou, reverteu aos conceitos e seguiu"
                    : "Errou na primeira tentativa"}
              </li>
              {missaoExplicada && (
                <li className="flex items-center gap-2">
                  <Check size={15} className="text-success" />
                  Explicou a decisão com as próprias palavras
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles size={16} /> Hoje você aprendeu
        </div>
        <ul className="mt-4 space-y-3">
          {aprendizados.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px]">
              <Check className="mt-0.5 shrink-0 text-success" size={18} />
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted-foreground">
          Agora vem a parte que fixa: aplicar no simulador — decisão, não memorização.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          to="/simulador"
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/60"
        >
          <div className="font-semibold">Agora veja funcionando</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.simulador ?? "Monte a estrutura no simulador e veja o payoff mudar."}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
            Abrir simulador <ArrowRight size={14} />
          </span>
        </Link>
        <Link
          to="/copilot"
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/60"
        >
          <div className="flex items-center gap-2 font-semibold">
            <MessageCircle size={16} className="text-primary" /> Ficou dúvida?
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Pergunte ao copilot sobre {titulo}.</p>
        </Link>
      </div>

      {proximaLicao ? (
        <button
          onClick={onContinuar}
          className="w-full rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continuar jornada → {proximaLicao.titulo}
        </button>
      ) : (
        <Link
          to="/trilha"
          className="block w-full rounded-xl border border-border px-5 py-4 text-center text-sm hover:bg-accent"
        >
          Voltar à trilha
        </Link>
      )}
    </div>
  );
}
