import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { getLesson, liçõesDe } from "@/lib/lessons";
import { getLessonMeta, NIVEL_THEME } from "@/lib/lesson-meta";
import { useCaminho } from "@/lib/use-caminho";
import { LessonProgress } from "@/components/lessons/LessonProgress";
import { LessonHero } from "@/components/lessons/LessonHero";
import { LessonProblem } from "@/components/lessons/LessonProblem";
import { ConceptCard } from "@/components/lessons/ConceptCard";
import { ComparativoCard } from "@/components/lessons/ComparativoCard";
import { CenariosCard } from "@/components/lessons/CenariosCard";
import { DiagramCard } from "@/components/lessons/DiagramCard";
import { AnalogyCard } from "@/components/lessons/AnalogyCard";
import { WarningCard } from "@/components/lessons/WarningCard";
import { DecisionCard } from "@/components/lessons/DecisionCard";
import { MissionCard } from "@/components/lessons/MissionCard";
import { QuizCard } from "@/components/lessons/QuizCard";
import { SummaryCard } from "@/components/lessons/SummaryCard";
import { LessonNavigator } from "@/components/lessons/LessonNavigator";
import type { LessonTimelineStep } from "@/components/lessons/LessonTimeline";

export const Route = createFileRoute("/_authenticated/licao/$slug")({
  head: ({ params }) => {
    const l = getLesson(params.slug);
    return { meta: [{ title: `${l?.titulo ?? "Lição"} · Zero ao Trade` }] };
  },
  component: LicaoPage,
});

type Step =
  | { kind: "hero" }
  | { kind: "problema" }
  | { kind: "conceito"; i: number }
  | { kind: "diagrama" }
  | { kind: "comparativo" }
  | { kind: "cenarios" }
  | { kind: "ideia" }
  | { kind: "erro" }
  | { kind: "pratica" }
  | { kind: "missao" }
  | { kind: "quiz"; i: number }
  | { kind: "fim" };

const CHIPS: { rotulo: string; kind: Step["kind"] }[] = [
  { rotulo: "Problema", kind: "problema" },
  { rotulo: "Conceitos", kind: "conceito" },
  { rotulo: "Comparar", kind: "comparativo" },
  { rotulo: "Cenários", kind: "cenarios" },
  { rotulo: "Ideia", kind: "ideia" },
  { rotulo: "Erro", kind: "erro" },
  { rotulo: "Prática", kind: "pratica" },
  { rotulo: "Missão", kind: "missao" },
  { rotulo: "Quiz", kind: "quiz" },
  { rotulo: "Encerrar", kind: "fim" },
];

function LicaoPage() {
  const { slug } = Route.useParams();
  const lesson = getLesson(slug);
  const meta = getLessonMeta(slug);
  const { caminho } = useCaminho();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const topRef = useRef<HTMLDivElement>(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [missaoEscolha, setMissaoEscolha] = useState<number | undefined>(undefined);
  const [missaoExplicacao, setMissaoExplicacao] = useState("");
  const [missaoRevelado, setMissaoRevelado] = useState(false);
  const [missaoSalvo, setMissaoSalvo] = useState(false);
  const [missaoReverteu, setMissaoReverteu] = useState(false);
  const [transferEscolha, setTransferEscolha] = useState<number | undefined>(undefined);
  const [transferRevelado, setTransferRevelado] = useState(false);
  const [transferSalvo, setTransferSalvo] = useState(false);

  function explicacaoCoerente(texto: string, termos: string[]): boolean {
    const t = texto.toLocaleLowerCase("pt-BR");
    return termos.some((k) => t.includes(k.toLocaleLowerCase("pt-BR")));
  }

  const steps = useMemo<Step[]>(() => {
    if (!lesson) return [];
    const out: Step[] = [{ kind: "hero" }, { kind: "problema" }];
    lesson.conceitos.forEach((_, i) => {
      out.push({ kind: "conceito", i });
      if (i === 0 && meta.visual && meta.visual !== "none") out.push({ kind: "diagrama" });
    });
    if (lesson.comparativo) out.push({ kind: "comparativo" });
    if (lesson.cenarios && lesson.cenarios.length > 0) out.push({ kind: "cenarios" });
    out.push({ kind: "ideia" }, { kind: "erro" }, { kind: "pratica" }, { kind: "missao" });
    lesson.quiz.forEach((_, i) => out.push({ kind: "quiz", i }));
    out.push({ kind: "fim" });
    return out;
  }, [lesson, meta]);

  const timeline = useMemo<LessonTimelineStep[]>(() => {
    const starts = new Map<Step["kind"], number>();
    const ends = new Map<Step["kind"], number>();
    steps.forEach((s, i) => {
      if (!starts.has(s.kind)) starts.set(s.kind, i);
      ends.set(s.kind, i);
    });
    return CHIPS.map((c) => {
      const start = starts.get(c.kind) ?? 0;
      const end = ends.get(c.kind) ?? start;
      return { rotulo: c.rotulo, done: idx > end, atual: idx >= start && idx <= end };
    });
  }, [steps, idx]);

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
  const trilha = liçõesDe(caminho);
  const nextLesson = trilha[trilha.findIndex((l) => l.slug === slug) + 1];
  const inNivel = trilha.filter((l) => l.nivel === lesson.nivel);
  const posInNivel = inNivel.findIndex((l) => l.slug === slug) + 1;

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
      const { data: prof } = await supabase
        .from("profiles")
        .select("xp_total")
        .eq("id", u.user.id)
        .maybeSingle();
      await supabase
        .from("profiles")
        .update({
          xp_total: (prof?.xp_total ?? 0) + 50,
          ultima_atividade: new Date().toISOString(),
        })
        .eq("id", u.user.id);
      toast.success("Lição concluída — disciplina em construção 🎯");
    }
    qc.invalidateQueries({ queryKey: ["progress"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function persistMissao() {
    if (missaoSalvo || missaoEscolha === undefined) return;
    setMissaoSalvo(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const opcao = lesson!.missao.opcoes[missaoEscolha];
    const explicacao = missaoExplicacao.trim();
    await supabase.from("lessons_progress").upsert(
      {
        user_id: u.user.id,
        lesson_slug: lesson!.slug,
        missao_correta: opcao.tom === "correta",
        missao_opcao: missaoEscolha,
        missao_explicacao: explicacao || null,
        explicacao_coerente:
          explicacao.length > 0
            ? explicacaoCoerente(explicacao, lesson!.missao.termosExplicacao)
            : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_slug" },
    );
    qc.invalidateQueries({ queryKey: ["progress"] });
  }

  function confirmarMissao() {
    setMissaoRevelado(true);
    void persistMissao();
  }

  async function persistTransferencia() {
    if (transferSalvo || transferEscolha === undefined) return;
    setTransferSalvo(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const opcao = lesson!.missao.transferencia.opcoes[transferEscolha];
    await supabase.from("lessons_progress").upsert(
      {
        user_id: u.user.id,
        lesson_slug: lesson!.slug,
        transferencia_correta: opcao.tom === "correta",
        transferencia_opcao: transferEscolha,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_slug" },
    );
    qc.invalidateQueries({ queryKey: ["progress"] });
  }

  function confirmarTransferencia() {
    setTransferRevelado(true);
    void persistTransferencia();
  }

  function reverConceito() {
    setMissaoReverteu(true);
    const alvo = steps.findIndex((s) => s.kind === "conceito");
    jumpTo(alvo >= 0 ? alvo : 1);
  }

  function go(delta: number) {
    const next = Math.min(Math.max(idx + delta, 0), steps.length - 1);
    if (steps[next]?.kind === "fim") void persist(score);
    setIdx(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function jumpTo(i: number) {
    const target = Math.min(Math.max(i, 0), steps.length - 1);
    if (steps[target]?.kind === "fim") void persist(score);
    setIdx(target);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function refazerQuiz() {
    setAnswers({});
    setRevealed({});
    setSaved(false);
    jumpTo(steps.findIndex((s) => s.kind === "quiz"));
  }

  function continuarJornada() {
    setIdx(0);
    setAnswers({});
    setRevealed({});
    setSaved(false);
    setMissaoEscolha(undefined);
    setMissaoExplicacao("");
    setMissaoRevelado(false);
    setMissaoSalvo(false);
    setMissaoReverteu(false);
    setTransferEscolha(undefined);
    setTransferRevelado(false);
    setTransferSalvo(false);
    if (nextLesson) navigate({ to: "/licao/$slug", params: { slug: nextLesson.slug } });
  }

  const isQuiz = step?.kind === "quiz";
  const quizLocked = isQuiz && !revealed[(step as { i: number }).i];
  const missaoLocked = step?.kind === "missao" && !(missaoRevelado && transferRevelado);

  const rotulo =
    step?.kind === "hero"
      ? "Abertura"
      : step?.kind === "problema"
        ? "O problema"
        : step?.kind === "conceito"
          ? `Conceito ${(step as { i: number }).i + 1} de ${lesson.conceitos.length}`
          : step?.kind === "diagrama"
            ? "Veja acontecendo"
            : step?.kind === "comparativo"
              ? "Comparar estruturas"
              : step?.kind === "cenarios"
                ? "Comportamento em cenários"
                : step?.kind === "ideia"
                  ? "A grande ideia"
                  : step?.kind === "erro"
                    ? "Erro clássico"
                    : step?.kind === "pratica"
                      ? "Na prática"
                      : step?.kind === "missao"
                        ? "Missão"
                        : step?.kind === "quiz"
                          ? `Questão ${(step as { i: number }).i + 1} de ${lesson.quiz.length}`
                          : "Encerramento";

  const proximoLabel =
    step?.kind === "hero"
      ? "Começar"
      : step?.kind === "problema"
        ? "A ideia"
        : step?.kind === "missao"
          ? "Ir pro quiz"
          : "Próximo";

  return (
    <AppShell title={lesson.titulo}>
      <div ref={topRef} className="mx-auto max-w-2xl pb-24">
        <LessonProgress
          nivel={lesson.nivel}
          nivelNome={theme.nome}
          ordem={lesson.ordem}
          total={trilha.length}
          posInNivel={posInNivel}
          totalInNivel={inNivel.length}
          pct={progress}
          etapa={rotulo}
          tempoMin={meta.tempoMin}
        />

        <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step?.kind === "hero" && (
            <LessonHero
              lesson={lesson}
              meta={meta}
              total={trilha.length}
              tema={theme}
              timeline={timeline}
              onJump={(i) => jumpTo(i + 1)}
              onComecar={() => go(1)}
            />
          )}

          {step?.kind === "problema" && <LessonProblem problema={lesson.problema} />}

          {step?.kind === "conceito" && (
            <ConceptCard
              conceito={lesson.conceitos[(step as { i: number }).i]}
              i={(step as { i: number }).i}
              total={lesson.conceitos.length}
            />
          )}

          {step?.kind === "diagrama" && <DiagramCard kind={meta.visual ?? "none"} />}

          {step?.kind === "comparativo" && lesson.comparativo && (
            <ComparativoCard comparativo={lesson.comparativo} />
          )}

          {step?.kind === "cenarios" && lesson.cenarios && (
            <CenariosCard cenarios={lesson.cenarios} />
          )}

          {step?.kind === "ideia" && <AnalogyCard texto={lesson.analogia} />}

          {step?.kind === "erro" && meta.erroComum && (
            <WarningCard titulo={meta.erroComum.titulo} texto={meta.erroComum.texto} />
          )}

          {step?.kind === "pratica" && (
            <DecisionCard titulo={lesson.naPratica.titulo} passos={lesson.naPratica.passos} />
          )}

          {step?.kind === "missao" && (
            <MissionCard
              missao={lesson.missao}
              escolha={missaoEscolha}
              explicacao={missaoExplicacao}
              revelado={missaoRevelado}
              transferEscolha={transferEscolha}
              transferRevelado={transferRevelado}
              onEscolher={setMissaoEscolha}
              onExplicar={setMissaoExplicacao}
              onConfirmar={confirmarMissao}
              onReverConceito={reverConceito}
              onEscolherTransferencia={setTransferEscolha}
              onConfirmarTransferencia={confirmarTransferencia}
              onContinuar={() => go(1)}
            />
          )}

          {step?.kind === "quiz" && (
            <QuizCard
              q={lesson.quiz[(step as { i: number }).i]}
              i={(step as { i: number }).i}
              total={lesson.quiz.length}
              value={answers[(step as { i: number }).i]}
              revealed={!!revealed[(step as { i: number }).i]}
              onAnswer={(j) => setAnswers((a) => ({ ...a, [(step as { i: number }).i]: j }))}
              onConfirm={() => setRevealed((r) => ({ ...r, [(step as { i: number }).i]: true }))}
              onNext={() => go(1)}
              isLast={(step as { i: number }).i === lesson.quiz.length - 1}
            />
          )}

          {step?.kind === "fim" && (
            <SummaryCard
              lesson={lesson}
              meta={meta}
              score={score}
              proximaLicao={nextLesson}
              onRefazer={refazerQuiz}
              onContinuar={continuarJornada}
              missaoAcertou={
                missaoEscolha !== undefined
                  ? lesson.missao.opcoes[missaoEscolha].tom === "correta"
                  : undefined
              }
              missaoReverteu={missaoReverteu}
              missaoExplicada={missaoExplicacao.trim().length > 0}
              missaoExplicacaoCoerente={explicacaoCoerente(
                missaoExplicacao,
                lesson.missao.termosExplicacao,
              )}
              transferAcertou={
                transferEscolha !== undefined
                  ? lesson.missao.transferencia.opcoes[transferEscolha].tom === "correta"
                  : undefined
              }
            />
          )}
        </div>

        {step?.kind !== "fim" && (
          <LessonNavigator
            onVoltar={() => go(-1)}
            onProximo={() => go(1)}
            onPausar={() => navigate({ to: "/trilha" })}
            rotulo={rotulo}
            proximoLabel={proximoLabel}
            proximoDisabled={quizLocked || missaoLocked}
            voltarDisabled={idx === 0}
          />
        )}
      </div>
    </AppShell>
  );
}
