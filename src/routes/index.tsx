import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ClipboardList,
  Compass,
  Eye,
  GraduationCap,
  Hourglass,
  LineChart,
  Quote,
  Scale,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { PayoffCurve } from "@/components/landing/PayoffCurve";
import { Reveal } from "@/components/landing/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zero ao Trade — Decisões conscientes em um mercado incerto" },
      {
        name: "description",
        content:
          "O mercado não falta informação — falta processo. O Zero ao Trade transforma impulsos em decisões conscientes: o copilot informa, você decide.",
      },
      {
        property: "og:title",
        content: "Zero ao Trade — Decisões conscientes em um mercado incerto",
      },
      {
        property: "og:description",
        content:
          "Desenvolva a habilidade mais importante do mercado: tomar boas decisões quando existe incerteza. O copilot informa, você decide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PROBLEMA = [
  {
    icon: Activity,
    titulo: "Ansiedade",
    desc: "Decidir sob pressão para sentir que está participando.",
  },
  { icon: Zap, titulo: "Impulso", desc: "Clicar antes de entender, só porque a tela anima." },
  {
    icon: TrendingUp,
    titulo: "Excesso de confiança",
    desc: "Vencer algumas vezes e achar que ficou imune a errar.",
  },
  {
    icon: Hourglass,
    titulo: "Medo de ficar de fora",
    desc: "Entrar atrasado, às pressas, no que já subiu.",
  },
  {
    icon: SlidersHorizontal,
    titulo: "Falta de critérios",
    desc: "Cada operação um método novo — nenhum processo.",
  },
];

const LOOP = [
  {
    icon: BookOpen,
    n: "01",
    titulo: "Aprender",
    desc: "Conceitos complexos em linguagem simples. Você entende primeiro.",
  },
  {
    icon: ScrollText,
    n: "02",
    titulo: "Definir critérios",
    desc: "Escreva as regras que você — não o mercado — vai seguir.",
  },
  {
    icon: Calculator,
    n: "03",
    titulo: "Simular riscos",
    desc: "Veja quanto pode perder antes de correr o risco.",
  },
  {
    icon: ClipboardList,
    n: "04",
    titulo: "Registrar escolhas",
    desc: "O que fez, por quê, com qual regra e como se sentia.",
  },
  {
    icon: LineChart,
    n: "05",
    titulo: "Revisar resultados",
    desc: "Planejado contra acontecido — sem culpa, com leitura.",
  },
  {
    icon: Sprout,
    n: "06",
    titulo: "Evoluir",
    desc: "Cada ciclo começa de novo, com um processo melhor.",
  },
];

const EVENTOS = [
  { titulo: "Impulso", desc: "Entrar porque deu ansiedade, porque subiu, porque alguém avisou." },
  { titulo: "Quebra de regras", desc: "Ficar na mesa quando a própria regra mandava sair." },
  {
    titulo: "Recuperação agressiva",
    desc: "Aumentar o risco logo depois de perder, para recuperar.",
  },
  {
    titulo: "Confirmação, não evidência",
    desc: "Procurar quem concorde com a decisão, em vez de dados.",
  },
];

const CONCEITOS = ["Theta", "Volatilidade", "Gregas", "Travas", "Rolling"];

function PulseLine() {
  return (
    <svg viewBox="0 0 320 46" className="mx-auto mt-12 w-full max-w-md" aria-hidden="true">
      <text
        x="0"
        y="12"
        fontSize="10"
        fill="rgba(255,255,255,0.5)"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="1"
      >
        IMPULSO
      </text>
      <text
        x="320"
        y="12"
        textAnchor="end"
        fontSize="10"
        fill="oklch(0.72 0.18 155)"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="1"
      >
        DECISÃO
      </text>
      <line x1="14" y1="30" x2="306" y2="30" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <line
        x1="4"
        y1="30"
        x2="316"
        y2="30"
        stroke="oklch(0.78 0.17 65)"
        strokeWidth="1"
        strokeDasharray="4 90"
        strokeDashoffset="2"
      />
      <circle r="5" fill="oklch(0.78 0.17 65)">
        <animate attributeName="cx" values="14;306" dur="7s" repeatCount="indefinite" />
        <animate attributeName="cy" values="30;30" dur="7s" repeatCount="indefinite" />
      </circle>
      <circle r="10" fill="oklch(0.78 0.17 65)" opacity="0.25">
        <animate attributeName="cx" values="14;306" dur="7s" repeatCount="indefinite" />
        <animate attributeName="cy" values="30;30" dur="7s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function RingLoop() {
  return (
    <svg viewBox="0 0 64 64" className="size-16" aria-hidden="true">
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 32 32"
          to="360 32 32"
          dur="28s"
          repeatCount="indefinite"
        />
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="oklch(0.78 0.17 65 / 0.55)"
          strokeWidth="2"
          strokeDasharray="3 8"
        />
      </g>
      <circle cx="32" cy="32" r="9" fill="oklch(0.78 0.17 65 / 0.12)" />
      <circle cx="32" cy="32" r="4" fill="oklch(0.78 0.17 65)" />
    </svg>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.78 0.17 65), transparent)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.72 0.18 155), transparent)" }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground font-mono font-bold">
            0→
          </div>
          <div className="font-semibold">Zero ao Trade</div>
        </Link>
        <Link
          to="/auth"
          className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Entrar
        </Link>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-14 text-center md:pt-20">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Copilot informa. Você decide.
          </div>
        </Reveal>

        <Reveal delay={90}>
          <h1 className="mx-auto mt-8 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            Desenvolva a habilidade mais importante do mercado:
            <span className="text-primary"> tomar boas decisões quando existe incerteza.</span>
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Não prometemos sinais.
            <br />
            Não prometemos acertar o mercado.
            <br />
            Construímos um sistema que transforma impulsos em decisões conscientes.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-foreground">
            Enquanto a maioria aprende a operar, você aprende a pensar antes de operar.
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Começar do Zero
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="rounded-xl border border-border bg-card/60 px-8 py-4 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Já Opero
            </Link>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <PulseLine />
        </Reveal>
      </section>

      {/* PROBLEMA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="font-mono text-primary">01</span> O ponto de partida
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            O mercado não falta informação.
            <br />
            <span className="text-primary">O mercado falta processo.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Todos os dias, milhares de investidores tomam decisões baseadas em:
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROBLEMA.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 70}>
              <div className="group h-full rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-loss/50 hover:bg-loss/5">
                <p.icon className="text-loss/80" size={20} />
                <div className="mt-3 font-semibold">{p.titulo}</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mx-auto mt-14 max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-muted-foreground">
              O resultado normalmente não aparece na primeira operação. Aparece inevitavelmente, ao
              longo do tempo.
            </p>
            <p className="mt-8 text-3xl font-bold tracking-tight md:text-4xl">
              Existe um jeito diferente.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Em vez de tentar prever o mercado, aprenda a construir um{" "}
              <span className="text-foreground">processo de decisão</span>. Foi exatamente para isso
              que criamos o <span className="text-foreground">Zero ao Trade</span>.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CICLO DE DECISÃO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex items-center gap-4">
            <RingLoop />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span className="font-mono text-primary">02</span> O método
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Toda boa decisão passa por uma sequência.
              </h2>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Não são módulos soltos — é uma transformação. O <em>Decision Lifecycle</em> que dá nome
            ao nosso sistema operacional.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LOOP.map((etapa, i) => (
            <Reveal key={etapa.titulo} delay={i * 60}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                    <etapa.icon size={20} />
                  </div>
                  <span className="font-mono text-2xl font-bold text-muted-foreground/25">
                    {etapa.n}
                  </span>
                </div>
                <div className="mt-4 text-lg font-semibold">{etapa.titulo}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{etapa.desc}</p>
                {i < LOOP.length - 1 ? (
                  <ArrowRight
                    size={14}
                    className="mt-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary lg:mt-6"
                  />
                ) : (
                  <span className="mt-4 block rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary lg:mt-6">
                    e recomeça
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* QUALIDADE DA DECISÃO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="font-mono text-primary">03</span> O que medimos
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              A maioria mede lucro.
              <br />
              <span className="text-primary">Nós medimos qualidade da decisão.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Uma operação lucrativa pode ter sido uma decisão ruim. Uma operação com prejuízo pode
              ter sido executada exatamente como deveria.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Se você confunde resultado com qualidade da decisão, nunca consegue evoluir.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-success/15 text-success">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-sm font-semibold">Decision Score</div>
                <p className="text-sm text-muted-foreground">
                  Mede o processo, de 0 a 100. O lucro nunca entra na conta. Ele é consequência.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="space-y-4">
            <Reveal delay={80}>
              <div className="rounded-2xl border border-success/30 bg-success/5 p-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-success">
                  <Check size={14} /> Entender isso liberta
                </div>
                <p className="mt-3 text-[15px] leading-relaxed">
                  Você para de julgar cada operação pelo número final — e passa a julgar pelo quanto
                  seguiu o próprio processo.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="rounded-2xl border border-loss/30 bg-loss/5 p-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-loss">
                  <X size={14} /> O erro que trava todo mundo
                </div>
                <p className="mt-3 text-[15px] leading-relaxed">
                  Lucrativa não significa boa. Prejuízo não significa burrice. O que você{" "}
                  <span className="text-foreground">controla</span> é a decisão — não a
                  consequência.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal>
          <p className="mt-16 text-center font-mono text-xl font-bold tracking-tight text-primary md:text-2xl">
            O lucro é consequência. O processo é o produto.
          </p>
        </Reveal>
      </section>

      {/* COMPORTAMENTO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="font-mono text-primary">04</span> O adversário
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Seu maior adversário raramente é o mercado.
            <br />
            <span className="text-primary">É você.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            O sistema identifica padrões que normalmente passam despercebidos — e os torna visíveis
            antes que custem dinheiro.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {EVENTOS.map((a, i) => (
            <Reveal key={a.titulo} delay={i * 70}>
              <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-loss/10 text-loss">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="font-semibold">{a.titulo}</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
            <Quote className="mx-auto text-primary" size={22} />
            <p className="mt-4 text-xl leading-relaxed md:text-2xl">
              O objetivo não é julgar. É tornar os padrões visíveis{" "}
              <span className="text-primary">antes</span> que custem dinheiro.
            </p>
          </div>
        </Reveal>
      </section>

      {/* EDUCAÇÃO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="font-mono text-primary">04</span> A base
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Aprender sem decorar.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Opções parecem difíceis porque normalmente são ensinadas do jeito errado. Nós
              traduzimos conceitos complexos em linguagem simples — com analogias visuais e exemplos
              reais.
            </p>
            <p className="mt-4 text-lg font-medium text-foreground">
              Você entende primeiro. Memoriza depois.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {CONCEITOS.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div className="font-semibold">Cada conceito vira uma conversa</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Nada de glossário decorado: uma pergunta de cada vez, com um visual que mostra o
                    que está acontecendo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="font-semibold">Trilha progressiva, sem pulo</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Você só avança quando demonstra que entende — não quando adivinha.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SIMULADOR */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="font-mono text-primary">05</span> Antes de entrar
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Veja o risco
              <br />
              antes de correr o risco.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Monte estruturas. Visualize o payoff. Entenda quanto pode ganhar, quanto pode perder
              e, principalmente:{" "}
              <span className="text-foreground">por que aquela estrutura faz sentido</span>.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              O simulador conversa com você antes de mostrar qualquer número técnico — porque quem
              entende primeiro, decide melhor.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Eye size={14} /> A história do seu dinheiro
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-2 rounded-full bg-[oklch(0.78_0.17_65)]" />{" "}
                    hoje
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-2 rounded-full bg-success" /> lucro
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-2 rounded-full bg-loss" /> perda
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <PayoffCurve />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-background p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Risco máximo
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-loss">R$ 90</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Lucro máximo
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-success">R$ 10</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Ponto de equilíbrio
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold">R$ 38,90</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DIÁRIO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="font-mono text-primary">06</span> A memória
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              Sua memória falha.
              <br />
              <span className="text-primary">Seu processo não.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Toda decisão fica registrada: o que você fez, por que fez, qual regra utilizou e como
              se sentia. Meses depois, você consegue responder uma pergunta que quase ninguém
              consegue:
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
            <p className="text-2xl font-bold leading-relaxed tracking-tight md:text-3xl">
              “Eu ganho dinheiro porque tenho método —
              <span className="text-primary">ou apesar dele?</span>”
            </p>
          </div>
        </Reveal>
      </section>

      {/* POR QUE ISSO IMPORTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="font-mono text-primary">07</span> Por que isso importa
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Existem milhares de ferramentas para mostrar gráficos.
            <br />
            <span className="text-primary">Quase ninguém ensina a decidir.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Há centenas de cursos ensinando estratégias — e quase ninguém ensina a construir um
            processo consistente para decidir sob incerteza. O Zero ao Trade nasceu exatamente para
            preencher essa lacuna.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-muted-foreground">
                <LineChart size={18} />
              </div>
              <div>
                <div className="font-semibold">Gráficos mostram o preço</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Onde a coisa esteve. Nunca explicam como o ser humano decide ali dentro.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-muted-foreground">
                <Compass size={18} />
              </div>
              <div>
                <div className="font-semibold">Cursos ensinam estratégias</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Assumem que o problema é saber o que comprar. O problema real está a um passo
                  antes.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* EVIDÊNCIA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Scale size={14} /> O problema não é apenas técnico — é comportamental
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Estudos brasileiros conduzidos por pesquisadores da{" "}
              <span className="text-foreground">FGV</span> mostram que a maior parte dos
              investidores pessoa física que entra em operações de curtíssimo prazo termina
              acumulando prejuízos — e que muitos abandonam a atividade antes mesmo de desenvolver
              um processo consistente.
            </p>
            <div className="mt-6 border-t border-border pt-6 text-[15px] leading-relaxed md:text-base">
              <p className="text-foreground">O Zero ao Trade não promete mudar o mercado.</p>
              <p className="mt-1 text-muted-foreground">
                Ele busca mudar a forma como você toma decisões dentro dele.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* POSICIONAMENTO */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-10">
        <Reveal>
          <div className="border-l-2 border-primary/50 pl-6 md:pl-8">
            <Quote className="text-primary/70" size={20} />
            <p className="mt-4 text-xl leading-relaxed md:text-2xl">
              O Zero ao Trade é uma plataforma para desenvolver{" "}
              <span className="text-primary">
                a qualidade das decisões em ambientes de incerteza
              </span>
              . Começamos pelo mercado de opções porque é um dos ambientes onde os erros de decisão
              aparecem de forma mais evidente.
            </p>
          </div>
        </Reveal>
      </section>

      {/* MANIFESTO */}
      <section className="relative z-10 px-6 py-28 text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="font-mono text-primary">08</span> O manifesto
          </div>
          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            O mercado sempre será incerto.
            <br />
            <span className="text-primary">Sua forma de decidir não precisa ser.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            O Zero ao Trade não existe para prever o próximo movimento da Bolsa. Existe para ajudar
            você a construir algo muito mais valioso: um processo de decisão que continua
            funcionando quando o mercado muda.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-foreground md:text-2xl">
            Porque sobreviver sempre vem antes de lucrar.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Começar minha jornada
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground font-mono text-xs font-bold">
              0→
            </div>
            <span className="text-sm font-semibold">Zero ao Trade</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Conteúdo educacional. Não é recomendação de investimento.
          </p>
        </div>
      </footer>
    </div>
  );
}
