import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Brain, Calculator, ClipboardList, LineChart, ScrollText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zero ao Trade — Aprenda opções da B3 com disciplina" },
      {
        name: "description",
        content:
          "Um Decision OS que ensina opções do zero e organiza suas decisões: aprenda, defina regras, simule, registre e revise. O copilot informa — você decide.",
      },
      { property: "og:title", content: "Zero ao Trade — Aprenda opções da B3 com disciplina" },
      {
        property: "og:description",
        content: "Um Decision OS que ensina opções do zero e organiza suas decisões: aprenda, defina regras, simule, registre e revise. O copilot informa — você decide.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: BookOpen, label: "Aprender", desc: "13 lições, do vale-ingresso à trava lateral." },
  { icon: ScrollText, label: "Definir", desc: "Escreva as regras que você — não o mercado — vai seguir." },
  { icon: Calculator, label: "Simular", desc: "Payoff multi-perna: travas, rolagem, iron condor." },
  { icon: ClipboardList, label: "Registrar", desc: "Diário: o que fez, por quê, qual regra aplicou." },
  { icon: LineChart, label: "Revisar", desc: "Compare 'segui minha regra' vs 'não segui'." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground font-mono font-bold">
            0→
          </div>
          <div className="font-semibold">Zero ao Trade</div>
        </div>
        <Link
          to="/auth"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Entrar
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground">
          <Brain size={14} className="text-primary" /> Copilot informa — você decide
        </div>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
          Aprenda opções da B3.<br />
          <span className="text-primary">Estruture suas decisões.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Do que é uma call até montar uma trava de alta. Do vale-ingresso ao Iron Condor. Um
          loop contínuo — Aprender, Definir, Simular, Registrar, Revisar — pra você virar um
          operador disciplinado, não sortudo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Começar do zero
          </Link>
          <Link
            to="/auth"
            className="rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            Já opero — quero estruturar
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-5">
          {STEPS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-5">
              <Icon className="text-primary" size={20} />
              <div className="mt-3 font-semibold">{label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Conteúdo educacional. Não é recomendação de investimento.
      </footer>
    </div>
  );
}
