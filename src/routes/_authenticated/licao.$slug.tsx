import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LessonVisual } from "@/components/lesson/LessonVisual";
import { getLessonMeta, NIVEL_THEME } from "@/lib/lesson-meta";
import { getLesson, LESSONS, type Exercise, type QuizQuestion } from "@/lib/lessons";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Eye,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Target,
  TriangleAlert,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/licao/$slug")({
  head: ({ params }) => {
    const l = getLesson(params.slug);
    return { meta: [{ title: `${l?.titulo ?? "Lição"} · Zero ao Trade` }] };
  },
  component: LicaoPage,
});

type Step =
  | { kind: "intro" }
  | { kind: "ideia" }
  | { kind: "visual" }
  | { kind: "conceito"; titulo: string; corpo: string; i: number }
  | { kind: "erro" }
  | { kind: "desafio"; ex: Exercise; i: number }
  | { kind: "resumo" }
  | { kind: "quiz"; q: QuizQuestion; i: number }
  | { kind: "fim" };

function splitSections(md: string) {
  return md
    .split(/^##\s+/m)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      return { titulo: first.trim(), corpo: rest.join("\n").trim() };
    });
}

function Prose({ children }: { children: string }) {
  return (
    <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px] prose-strong:text-foreground prose-table:text-sm">
      <ReactMarkdown>{children}</ReactMarkdown>
    </article>
  );
}

function LicaoPage() {
  const { slug } = Route.useParams();
  const lesson = getLesson(slug);
  const meta = getLessonMeta(slug);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const topRef = useRef<HTMLDivElement>(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showGabarito, setShowGabarito] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);

  const steps = useMemo<Step[]>(() => {
    if (!lesson) return [];
    const out: Step[] = [{ kind: "intro" }, { kind: "ideia" }];
    if (meta.visual && meta.visual !== "none") out.push({ kind: "visual" });
    splitSections(lesson.conteudo).forEach((s, i) => out.push({ kind: "conceito", ...s, i }));
    if (meta.erroComum) out.push({ kind: "erro" });
    (lesson.exercicios ?? []).forEach((ex, i) => out.push({ kind: "desafio", ex, i }));
    out.push({ kind: "resumo" });
    lesson.quiz.forEach((q, i) => out.push({ kind: "quiz", q, i }));
    out.push({ kind: "fim" });
    return out;
  }, [lesson, meta]);

  if (!lesson) {
    return (
      <AppShell title="Lição">
        <p>Lição não encontrada.</p>
      </AppShell>
    );
  }

  const theme = NIVEL_THEME[lesson.nivel] ?? NIVEL_THEME[1];
  const step = steps[idx];
  const progress = Math.round(((idx + 1) / steps.length) * 100);
  const nextLesson = LESSONS[LESSONS.findIndex((l) => l.slug === slug) + 1];

  const correctCount = lesson.quiz.filter((q, i) => answers[i] === q.correta).length;
  const score = Math.round((correctCount / lesson.quiz.length) * 100);

  async function persist(pct: number) {
    if (saved) return;
    setSaved(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("lessons_progress").upsert(
      {
        user_id: u.user.id,
        lesson_slug: lesson!.slug,
        completed_at: pct >= 80 ? new Date().toISOString() : null,
        quiz_score: pct,
        attempts: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_slug" },
    );
    if (pct >= 80) {
      const { data: prof } = await supabase.from("profiles").select("xp_total").eq("id", u.user.id).maybeSingle();
      await supabase
        .from("profiles")
        .update({ xp_total: (prof?.xp_total ?? 0) + 50, ultima_atividade: new Date().toISOString() })
        .eq("id", u.user.id);
      toast.success("Lição concluída — disciplina em construção 🎯");
    }
    qc.invalidateQueries({ queryKey: ["progress"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  function go(delta: number) {
    const next = Math.min(Math.max(idx + delta, 0), steps.length - 1);
    if (steps[next]?.kind === "fim") void persist(score);
    setIdx(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const isQuiz = step?.kind === "quiz";
  const quizLocked = isQuiz && !revealed[(step as { i: number }).i];

  return (
    <AppShell title={lesson.titulo}>
      <div ref={topRef} className="mx-auto max-w-2xl pb-24">
        {/* barra de progresso */}
        <div className="sticky top-0 z-20 -mx-1 mb-6 bg-background/90 px-1 pb-3 pt-1 backdrop-blur">
          <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${theme.accent}`}>
                Nível {lesson.nivel} · {theme.nome}
              </div>
              <div className="truncate text-sm text-muted-foreground">
                Etapa {idx + 1} de {steps.length}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <Clock size={12} /> {meta.tempoMin} min
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${theme.ring} transition-all duration-300`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* conteúdo da etapa */}
        <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step?.kind === "intro" && (
            <div className="text-center">
              <div className={`mx-auto grid size-14 place-items-center rounded-2xl ${theme.bg} ${theme.accent}`}>
                <Target size={24} />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">{lesson.titulo}</h2>
              <p className="mt-3 text-muted-foreground">{lesson.resumo}</p>
              <div className={`mt-6 rounded-xl border p-5 text-left ${theme.border} ${theme.bg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${theme.accent}`}>
                  Ao final desta lição você vai conseguir
                </div>
                <p className="mt-2 text-[15px]">{meta.objetivo}</p>
              </div>
            </div>
          )}

          {step?.kind === "ideia" && (
            <div className={`rounded-2xl border p-6 md:p-8 ${theme.border} ${theme.bg}`}>
              <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${theme.accent}`}>
                <Lightbulb size={16} /> A grande ideia
              </div>
              <p className="mt-5 text-xl leading-relaxed md:text-2xl">{lesson.analogia}</p>
            </div>
          )}

          {step?.kind === "visual" && (
            <div>
              <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Eye size={14} /> Veja acontecendo
              </div>
              <LessonVisual kind={meta.visual ?? "none"} />
            </div>
          )}

          {step?.kind === "conceito" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Conceito {step.i + 1}
              </div>
              <h2 className="mt-2 text-xl font-semibold">{step.titulo}</h2>
              <div className="mt-4">
                <Prose>{step.corpo}</Prose>
              </div>
            </div>
          )}

          {step?.kind === "erro" && meta.erroComum && (
            <div className="rounded-2xl border-2 border-loss/60 bg-loss/10 p-6 md:p-8">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-loss">
                <TriangleAlert size={16} /> Erro mais comum
              </div>
              <h2 className="mt-4 text-xl font-bold md:text-2xl">{meta.erroComum.titulo}</h2>
              <p className="mt-3 text-[15px] leading-relaxed">{meta.erroComum.texto}</p>
            </div>
          )}

          {step?.kind === "desafio" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className={`text-[11px] font-semibold uppercase tracking-widest ${theme.accent}`}>
                Mini desafio {step.i + 1}
              </div>
              <h2 className="mt-2 text-lg font-semibold">{step.ex.titulo}</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] text-muted-foreground">{step.ex.enunciado}</p>
              {step.ex.dica && <p className="mt-3 text-xs text-primary">Dica: {step.ex.dica}</p>}
              {showGabarito[step.i] ? (
                <div className="mt-4 rounded-lg border border-success/40 bg-success/10 p-4 text-sm whitespace-pre-line">
                  {step.ex.gabarito}
                </div>
              ) : (
                <button
                  onClick={() => setShowGabarito((g) => ({ ...g, [(step as { i: number }).i]: true }))}
                  className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                >
                  Mostrar resposta
                </button>
              )}
            </div>
          )}

          {step?.kind === "resumo" && (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${theme.accent}`}>
                <Sparkles size={16} /> Hoje você aprendeu
              </div>
              <ul className="mt-5 space-y-3">
                {(meta.resumoPontos ?? splitSections(lesson.conteudo).map((s) => s.titulo)).map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px]">
                    <Check className="mt-0.5 shrink-0 text-success" size={18} />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Agora vem a parte que fixa: aplicar. Três perguntas de decisão — não de memorização.
              </p>
            </div>
          )}

          {step?.kind === "quiz" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Quiz {step.i + 1} de {lesson.quiz.length}
              </div>
              <h2 className="mt-2 text-lg font-semibold">{step.q.pergunta}</h2>
              <div className="mt-4 space-y-2">
                {step.q.alternativas.map((a, j) => {
                  const chosen = answers[step.i] === j;
                  const done = revealed[step.i];
                  const isRight = j === step.q.correta;
                  const cls = done
                    ? isRight
                      ? "border-success bg-success/15"
                      : chosen
                        ? "border-loss bg-loss/15"
                        : "border-border opacity-60"
                    : chosen
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent";
                  return (
                    <button
                      key={j}
                      disabled={done}
                      onClick={() => setAnswers({ ...answers, [step.i]: j })}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${cls}`}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + j)}</span>
                      <span className="flex-1">{a}</span>
                      {done && isRight && <Check size={16} className="text-success" />}
                      {done && chosen && !isRight && <X size={16} className="text-loss" />}
                    </button>
                  );
                })}
              </div>
              {revealed[step.i] ? (
                <div
                  className={`mt-4 rounded-xl border p-4 text-sm ${answers[step.i] === step.q.correta ? "border-success/50 bg-success/10" : "border-loss/50 bg-loss/10"}`}
                >
                  <div className="font-semibold">
                    {answers[step.i] === step.q.correta ? "Isso aí." : "Ainda não — olha o porquê:"}
                  </div>
                  <p className="mt-1 text-muted-foreground">{step.q.explicacao}</p>
                </div>
              ) : (
                <button
                  disabled={answers[step.i] === undefined}
                  onClick={() => setRevealed((r) => ({ ...r, [(step as { i: number }).i]: true }))}
                  className="mt-4 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  Confirmar resposta
                </button>
              )}
            </div>
          )}

          {step?.kind === "fim" && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-6 text-center ${score >= 80 ? "border-success/60 bg-success/10" : "border-loss/60 bg-loss/10"}`}
              >
                <div className="font-mono text-5xl font-bold">{score}%</div>
                <p className="mt-2 text-sm">
                  {score >= 80
                    ? "Lição concluída. Você não decorou — você entendeu."
                    : "Faltou pouco. Refaça o quiz: aqui erro é treino, não prejuízo."}
                </p>
                {score < 80 && (
                  <button
                    onClick={() => {
                      setAnswers({});
                      setRevealed({});
                      setSaved(false);
                      setIdx(steps.findIndex((s) => s.kind === "quiz"));
                    }}
                    className="mt-4 rounded-lg border border-border px-5 py-2 text-sm hover:bg-accent"
                  >
                    Refazer o quiz
                  </button>
                )}
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
                <Link to="/copilot" className="rounded-2xl border border-border bg-card p-5 hover:border-primary/60">
                  <div className="flex items-center gap-2 font-semibold">
                    <MessageCircle size={16} className="text-primary" /> Ficou dúvida?
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pergunte ao copilot sobre {lesson.titulo.replace(/^Lição \d+ — /, "")}.
                  </p>
                </Link>
              </div>

              {nextLesson ? (
                <button
                  onClick={() => {
                    setIdx(0);
                    setAnswers({});
                    setRevealed({});
                    setShowGabarito({});
                    setSaved(false);
                    navigate({ to: "/licao/$slug", params: { slug: nextLesson.slug } });
                  }}
                  className="w-full rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Continuar jornada → {nextLesson.titulo}
                </button>
              ) : (
                <Link
                  to="/trilha"
                  className="block rounded-xl border border-border px-5 py-4 text-center text-sm hover:bg-accent"
                >
                  Voltar à trilha
                </Link>
              )}
            </div>
          )}
        </div>

        {/* navegação */}
        {step?.kind !== "fim" && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:pl-64">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <button
                onClick={() => go(-1)}
                disabled={idx === 0}
                className="rounded-lg border border-border p-3 text-muted-foreground hover:bg-accent disabled:opacity-30"
                aria-label="Voltar"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => go(1)}
                disabled={quizLocked}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {idx === 0 ? "Começar" : "Continuar"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
