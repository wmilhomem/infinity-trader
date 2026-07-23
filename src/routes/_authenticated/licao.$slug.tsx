import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { getLesson, LESSONS } from "@/lib/lessons";
import { Check, MessageCircle, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/licao/$slug")({
  head: ({ params }) => {
    const l = getLesson(params.slug);
    return { meta: [{ title: `${l?.titulo ?? "Lição"} · Zero ao Trade` }] };
  },
  component: LicaoPage,
});

function LicaoPage() {
  const { slug } = Route.useParams();
  const lesson = getLesson(slug);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState<"aula" | "quiz" | "resultado">("aula");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  if (!lesson) {
    return (
      <AppShell title="Lição">
        <p>Lição não encontrada.</p>
      </AppShell>
    );
  }

  async function submitQuiz() {
    let correct = 0;
    lesson!.quiz.forEach((q, i) => {
      if (answers[i] === q.correta) correct++;
    });
    const pct = Math.round((correct / lesson!.quiz.length) * 100);
    setScore(pct);
    setStep("resultado");

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const completed = pct >= 80 ? new Date().toISOString() : null;
    await supabase.from("lessons_progress").upsert(
      {
        user_id: u.user.id,
        lesson_slug: lesson!.slug,
        completed_at: completed,
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
        .update({
          xp_total: (prof?.xp_total ?? 0) + 50,
          ultima_atividade: new Date().toISOString(),
        })
        .eq("id", u.user.id);
      toast.success("+50 XP!");
    }
    qc.invalidateQueries({ queryKey: ["progress"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  const nextLesson = LESSONS[LESSONS.findIndex((l) => l.slug === slug) + 1];

  return (
    <AppShell title={lesson.titulo}>
      {step === "aula" && (
        <>
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 mb-6">
            <div className="text-xs uppercase text-primary mb-1">Analogia</div>
            <p className="text-sm">{lesson.analogia}</p>
          </div>
          <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-6 prose-p:text-sm prose-p:text-muted-foreground prose-li:text-sm prose-li:text-muted-foreground prose-strong:text-foreground prose-table:text-sm">
            <ReactMarkdown>{lesson.conteudo}</ReactMarkdown>
          </article>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep("quiz")}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Fazer o quiz →
            </button>
            <Link
              to="/copilot"
              className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-accent inline-flex items-center gap-2"
            >
              <MessageCircle size={14} /> Perguntar ao copilot
            </Link>
          </div>
        </>
      )}

      {step === "quiz" && (
        <div className="space-y-6">
          {lesson.quiz.map((q, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs uppercase text-muted-foreground">Pergunta {i + 1}</div>
              <div className="mt-1 font-semibold">{q.pergunta}</div>
              <div className="mt-3 space-y-2">
                {q.alternativas.map((a, j) => (
                  <label
                    key={j}
                    className={`flex gap-2 rounded-md border p-3 cursor-pointer ${answers[i] === j ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === j}
                      onChange={() => setAnswers({ ...answers, [i]: j })}
                    />
                    <span className="text-sm">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submitQuiz}
            disabled={Object.keys(answers).length < lesson.quiz.length}
            className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Ver resultado
          </button>
        </div>
      )}

      {step === "resultado" && (
        <div>
          <div
            className={`rounded-lg p-6 mb-6 border ${score >= 80 ? "border-success bg-success/10" : "border-loss bg-loss/10"}`}
          >
            <div className="text-4xl font-bold font-mono">{score}%</div>
            <div className="mt-1 text-sm">
              {score >= 80 ? "Lição destravada! +50 XP." : "Faltou pouco — tenta de novo."}
            </div>
          </div>
          <div className="space-y-3">
            {lesson.quiz.map((q, i) => {
              const ok = answers[i] === q.correta;
              return (
                <div key={i} className="rounded-md border border-border bg-card p-4">
                  <div className="flex items-start gap-2">
                    {ok ? (
                      <Check className="text-success mt-0.5 shrink-0" size={16} />
                    ) : (
                      <X className="text-loss mt-0.5 shrink-0" size={16} />
                    )}
                    <div className="text-sm">
                      <div className="font-medium">{q.pergunta}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Correta: {q.alternativas[q.correta]}</div>
                      <div className="mt-1 text-xs">{q.explicacao}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex gap-3">
            {score < 80 && (
              <button
                onClick={() => {
                  setAnswers({});
                  setStep("quiz");
                }}
                className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-accent"
              >
                Refazer
              </button>
            )}
            {nextLesson && score >= 80 && (
              <button
                onClick={() =>
                  navigate({ to: "/licao/$slug", params: { slug: nextLesson.slug } })
                }
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Próxima lição →
              </button>
            )}
            <button
              onClick={() => navigate({ to: "/trilha" })}
              className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-accent"
            >
              Voltar à trilha
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
