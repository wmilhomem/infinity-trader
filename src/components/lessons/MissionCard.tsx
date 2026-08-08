import { Check, Flag, RotateCcw, X } from "lucide-react";
import type { LessonMissao, LessonTransferencia, MissaoOpcao } from "@/lib/lessons";

type Props = {
  missao: LessonMissao;
  escolha?: number;
  explicacao: string;
  revelado: boolean;
  transferEscolha?: number;
  transferRevelado: boolean;
  onEscolher: (i: number) => void;
  onExplicar: (t: string) => void;
  onConfirmar: () => void;
  onReverConceito: () => void;
  onEscolherTransferencia: (i: number) => void;
  onConfirmarTransferencia: () => void;
  onContinuar: () => void;
};

const TOM = {
  correta: {
    box: "border-success/50 bg-success/10",
    header: "text-success",
    titulo: "🟢 Boa decisão.",
  },
  quase: {
    box: "border-amber-400/50 bg-amber-400/10",
    header: "text-amber-400",
    titulo: "🟡 Quase.",
  },
  errada: {
    box: "border-loss/50 bg-loss/10",
    header: "text-loss",
    titulo: "🔴 Ainda não.",
  },
} as const;

function letra(i: number) {
  return String.fromCharCode(65 + i);
}

function Opcoes({
  opcoes,
  escolha,
  revelado,
  onEscolher,
}: {
  opcoes: MissaoOpcao[];
  escolha?: number;
  revelado: boolean;
  onEscolher: (i: number) => void;
}) {
  const acertou = escolha !== undefined && opcoes[escolha].tom === "correta";
  return (
    <div className="mt-4 space-y-2">
      {opcoes.map((o, j) => {
        const chosen = escolha === j;
        const isRight = o.tom === "correta";
        const cls = revelado
          ? chosen
            ? TOM[o.tom].box
            : isRight
              ? "border-success/60 bg-success/10"
              : "border-border opacity-50"
          : chosen
            ? "border-primary bg-primary/10"
            : "border-border hover:bg-accent";
        return (
          <button
            key={j}
            disabled={revelado}
            onClick={() => onEscolher(j)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[15px] transition-colors ${cls}`}
          >
            <span className="font-mono text-xs text-muted-foreground">{letra(j)}</span>
            <span className="flex-1">{o.texto}</span>
            {revelado && isRight && !chosen && <Check size={16} className="text-success" />}
            {revelado && chosen && !acertou && <X size={16} className="text-loss" />}
          </button>
        );
      })}
    </div>
  );
}

function Feedback({
  escolhida,
  correta,
  opcoes,
}: {
  escolhida?: MissaoOpcao;
  correta: number;
  opcoes: MissaoOpcao[];
}) {
  const acertou = escolhida?.tom === "correta";
  if (!escolhida) return null;
  return (
    <div className="mt-5 space-y-3">
      <div className={`rounded-xl border p-5 ${TOM[escolhida.tom].box}`}>
        <div className={`text-sm font-semibold ${TOM[escolhida.tom].header}`}>
          {TOM[escolhida.tom].titulo}
        </div>
        <p className="mt-2 text-[15px] leading-relaxed">{escolhida.feedback}</p>
        {!acertou && (
          <div className="mt-4 rounded-lg border border-border bg-card/60 p-3 text-sm">
            <span className="text-muted-foreground">A escolha que fecha a missão: </span>
            <strong>
              {letra(correta)}) {opcoes[correta].texto}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

export function MissionCard({
  missao,
  escolha,
  explicacao,
  revelado,
  transferEscolha,
  transferRevelado,
  onEscolher,
  onExplicar,
  onConfirmar,
  onReverConceito,
  onEscolherTransferencia,
  onConfirmarTransferencia,
  onContinuar,
}: Props) {
  const correta = missao.opcoes.findIndex((o) => o.tom === "correta");
  const escolhida: MissaoOpcao | undefined =
    escolha !== undefined ? missao.opcoes[escolha] : undefined;
  const acertou = escolhida?.tom === "correta";
  const t = missao.transferencia;
  const tCorreta = t.opcoes.findIndex((o) => o.tom === "correta");
  const tEscolhida: MissaoOpcao | undefined =
    transferEscolha !== undefined ? t.opcoes[transferEscolha] : undefined;

  return (
    <div className="rounded-2xl border-2 border-primary/50 bg-primary/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <Flag size={16} /> Missão
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{missao.titulo}</h2>

      <div className="mt-5 rounded-xl border border-border bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          A situação
        </div>
        <p className="mt-2 text-[15px] leading-relaxed md:text-base">{missao.situacao}</p>
      </div>

      <p className="mt-5 text-lg font-semibold">{missao.pergunta}</p>
      <Opcoes
        opcoes={missao.opcoes}
        escolha={escolha}
        revelado={revelado}
        onEscolher={onEscolher}
      />

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Por quê? <span className="normal-case tracking-normal">(opcional)</span>
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/60">
            {explicacao.length}/240
          </span>
        </div>
        <textarea
          value={explicacao}
          onChange={(e) => onExplicar(e.target.value)}
          disabled={revelado}
          maxLength={240}
          rows={2}
          placeholder="Explique em uma frase."
          className="mt-2 w-full resize-none rounded-xl border border-border bg-card p-4 text-[15px] placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none disabled:opacity-50"
        />
      </div>

      {!revelado ? (
        <button
          onClick={onConfirmar}
          disabled={escolha === undefined}
          className="mt-5 w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          Confirmar decisão
        </button>
      ) : (
        <>
          <div className="mt-5">
            <Feedback escolhida={escolhida} correta={correta} opcoes={missao.opcoes} />
          </div>
          {!acertou && (
            <div className="mt-3">
              <button
                onClick={onReverConceito}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-accent"
              >
                <RotateCcw size={15} /> Rever os conceitos
              </button>
            </div>
          )}
          <div className="mt-8 rounded-2xl border-2 border-border bg-card/40 p-5 md:p-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-400">
              <Check size={16} /> Aplicação — outro cenário
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight">{t.titulo}</h3>
            <div className="mt-4 rounded-xl border border-border bg-card p-5">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                A situação mudou
              </div>
              <p className="mt-2 text-[15px] leading-relaxed">{t.situacao}</p>
            </div>
            <p className="mt-5 text-base font-semibold">{t.pergunta}</p>
            <Opcoes
              opcoes={t.opcoes}
              escolha={transferEscolha}
              revelado={transferRevelado}
              onEscolher={onEscolherTransferencia}
            />
            {!transferRevelado ? (
              <button
                onClick={onConfirmarTransferencia}
                disabled={transferEscolha === undefined}
                className="mt-5 w-full rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-300 disabled:opacity-40"
              >
                Confirmar aplicação
              </button>
            ) : (
              <div className="mt-5">
                <Feedback escolhida={tEscolhida} correta={tCorreta} opcoes={t.opcoes} />
              </div>
            )}
          </div>
          {transferRevelado && (
            <button
              onClick={onContinuar}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continuar para o quiz
            </button>
          )}
        </>
      )}
    </div>
  );
}
