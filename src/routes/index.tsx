import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ClipboardList,
  Compass,
  Eye,
  GraduationCap,
  History,
  LineChart,
  ListChecks,
  Map,
  MessageCircleQuestion,
  Moon,
  PenLine,
  ScrollText,
  Sparkles,
  Sprout,
  Sunrise,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { Tilt3D } from "@/components/landing/Tilt3D";
import { HeroScene } from "@/components/landing/HeroScene";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zero ao Trade — Pare de operar por impulso" },
      {
        name: "description",
        content:
          "O Zero ao Trade não prevê o mercado. Ele ajuda você a desenvolver uma forma melhor de decidir: check, simulação, registro, reflexão e evolução.",
      },
      { property: "og:title", content: "Zero ao Trade — Pare de operar por impulso" },
      {
        property: "og:description",
        content:
          "Transforme cada operação em aprendizado através de um ciclo contínuo de reflexão, disciplina e evolução.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CICLO_HERO = ["Check", "Simular", "Registrar", "Refletir", "Evoluir"];

const HOJE = [
  "Decide no impulso",
  "Aprende depois do prejuízo",
  "Esquece por que entrou",
  "Repete os mesmos erros",
  "Confunde sorte com competência",
];

const COM_ZAT = [
  "Pensa antes de agir",
  "Visualiza o risco",
  "Registra sua hipótese",
  "Aprende com cada decisão",
  "Evolui seu processo",
];

const FLUXO = [
  { icon: BookOpen, titulo: "Conhecimento", desc: "Entender antes de arriscar." },
  { icon: ScrollText, titulo: "Regras Pessoais", desc: "O que você não pode quebrar." },
  { icon: LineChart, titulo: "Simulação", desc: "Ver o risco antes dele existir." },
  { icon: Target, titulo: "Decisão", desc: "Escolher com critério, não com pressa." },
  { icon: PenLine, titulo: "Registro", desc: "Guardar o porquê, não só o quanto." },
  { icon: Brain, titulo: "Reflexão", desc: "Ler o que aconteceu sem culpa." },
  { icon: Sprout, titulo: "Evolução", desc: "Voltar ao começo um pouco melhor." },
];

const PERGUNTAS = [
  "Como você está chegando ao mercado hoje?",
  "Por que você quer operar?",
  "Qual regra você não pode quebrar?",
  "Você já simulou essa ideia?",
  "Você consegue explicar sua tese?",
];

const DIA = [
  { emoji: "🌅", titulo: "Check Cognitivo", desc: "“Como você chega ao mercado hoje?”" },
  { emoji: "📖", titulo: "Sua regra mais importante", desc: "O limite que você mesmo escreveu." },
  { emoji: "📈", titulo: "Monte sua hipótese", desc: "O que você espera que aconteça." },
  { emoji: "🎯", titulo: "Simule antes", desc: "Veja a perda máxima em reais." },
  { emoji: "📝", titulo: "Registre por que decidiu", desc: "A tese fica escrita, não na memória." },
  { emoji: "🌙", titulo: "Feche o dia refletindo", desc: "O que o processo te mostrou." },
  { emoji: "📚", titulo: "Amanhã você começa melhor", desc: "O ciclo recomeça com mais clareza." },
];

const MODULOS = [
  { verbo: "Aprenda", desc: "sem jargões.", icon: GraduationCap },
  { verbo: "Defina", desc: "suas próprias regras.", icon: ScrollText },
  { verbo: "Simule", desc: "antes de arriscar dinheiro.", icon: LineChart },
  { verbo: "Registre", desc: "o motivo da decisão.", icon: PenLine },
  { verbo: "Reviva", desc: "qualquer operação.", icon: History },
  { verbo: "Descubra", desc: "seus padrões.", icon: Map },
  { verbo: "Evolua", desc: "comparando quem você era com quem está se tornando.", icon: Sprout },
];

const PILARES = [
  {
    titulo: "Processo antes do lucro",
    desc: "O sistema mede a qualidade da decisão, não apenas o resultado financeiro.",
  },
  { titulo: "Educação antes da execução", desc: "Você aprende antes de arriscar dinheiro." },
  { titulo: "Reflexão antes da repetição", desc: "Toda decisão vira aprendizado." },
  { titulo: "Consciência antes da confiança", desc: "A confiança nasce do processo. Não da sorte." },
];

const ENCONTRA = [
  "Trilha completa de Opções da B3",
  "Simulador visual",
  "Check Cognitivo",
  "Diário de Decisões",
  "Replay das operações",
  "Mapa dos seus padrões",
  "Copilot Educacional",
  "Missões personalizadas",
  "Evolução ao longo do tempo",
];

function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <span className="font-mono text-primary">{n}</span>
      {children}
    </div>
  );
}

function Landing() {
  return (
    <div className="grain relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* fundo: malha técnica + auroras */}
      <div className="pointer-events-none absolute inset-0 grid-mesh opacity-[0.5] [mask-image:radial-gradient(90%_60%_at_50%_0%,#000,transparent)]" />
      <div
        className="zat-aurora pointer-events-none absolute -top-64 left-1/2 h-[620px] w-[1000px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[110px]"
        style={{ background: "radial-gradient(closest-side, oklch(0.78 0.17 65), transparent)" }}
      />
      <div
        className="zat-aurora pointer-events-none absolute top-[70vh] -left-40 h-[520px] w-[720px] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: "radial-gradient(closest-side, oklch(0.72 0.18 155), transparent)" }}
      />


      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary font-mono font-bold text-primary-foreground">
            0→
          </div>
          <div className="font-semibold">Zero ao Trade</div>
        </Link>
        <Link
          to="/auth"
          search={{ mode: "login" }}
          className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Entrar
        </Link>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-6 pt-16 text-center md:pt-24">
        <Reveal>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.06] tracking-tight md:text-6xl">
            Pare de operar por impulso.
            <br />
            <span className="text-primary">Comece a construir um processo.</span>
          </h1>
        </Reveal>

        <Reveal delay={100}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            O Zero ao Trade não prevê o mercado.
            <br />
            Ele ajuda você a desenvolver uma forma melhor de decidir.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground">
            Transforme cada operação em aprendizado através de um ciclo contínuo de reflexão,
            disciplina e evolução.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-xs tracking-wide text-muted-foreground">
            {CICLO_HERO.map((etapa, i) => (
              <span key={etapa} className="flex items-center gap-3">
                <span className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-foreground">
                  {etapa}
                </span>
                {i < CICLO_HERO.length - 1 ? (
                  <span className="text-primary/60">→</span>
                ) : null}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Começar gratuitamente
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#como-funciona"
              className="rounded-xl border border-border bg-card/60 px-8 py-4 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Ver como funciona
            </a>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <div className="mx-auto mt-16 max-w-xl border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
            Mais de 90% das pessoas físicas registram perdas ao operar de forma recorrente no
            mercado.
            <br />
            O problema raramente é falta de informação.
            <br />
            <span className="text-foreground">Quase sempre é falta de processo.</span>
          </div>
        </Reveal>
      </section>

      {/* 02 — MÉTODO x INFORMAÇÃO */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <Eyebrow n="01">O ponto de partida</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Você não precisa de mais informação.
            <br />
            <span className="text-primary">Você precisa de um método.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-7">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Hoje
              </div>
              <ul className="mt-5 space-y-3">
                {HOJE.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                    <X size={16} className="mt-0.5 shrink-0 text-loss" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-success/30 bg-success/5 p-7">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-success">
                Com o Zero ao Trade
              </div>
              <ul className="mt-5 space-y-3">
                {COM_ZAT.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px]">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 03 — O QUE É / FLUXO */}
      <section id="como-funciona" className="relative z-10 mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <Eyebrow n="02">A categoria</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Não é um curso.
            <br />
            Não é uma corretora.
            <br />
            Não é uma IA que manda comprar.
            <br />
            <span className="text-primary">É uma nova forma de aprender a decidir.</span>
          </h2>
        </Reveal>

        <div className="mt-14 space-y-3">
          {FLUXO.map((etapa, i) => (
            <Reveal key={etapa.titulo} delay={i * 60}>
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <etapa.icon size={20} />
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-border bg-card px-6 py-4">
                  <div className="font-semibold">{etapa.titulo}</div>
                  <p className="text-sm text-muted-foreground">{etapa.desc}</p>
                </div>
              </div>
              {i < FLUXO.length - 1 ? (
                <div className="ml-6 h-5 w-px bg-gradient-to-b from-primary/50 to-primary/10" />
              ) : null}
            </Reveal>
          ))}
        </div>
      </section>

      {/* 04 — PERGUNTAS */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <Eyebrow n="03">O momento anterior à ordem</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Antes de clicar em Comprar…
            <br />
            <span className="text-primary">o sistema faz perguntas.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Não entrega respostas.</p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERGUNTAS.map((q, i) => (
            <Reveal key={q} delay={i * 70}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <MessageCircleQuestion size={18} className="text-primary" />
                <p className="mt-4 text-lg leading-snug">{q}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-12 text-center text-xl font-semibold tracking-tight md:text-2xl">
            A maioria das perdas começa antes da ordem ser enviada.
          </p>
        </Reveal>
      </section>

      {/* 05 — UM DIA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <Eyebrow n="04">A rotina</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Veja como um dia acontece.
          </h2>
        </Reveal>

        <div className="mt-12 -mx-6 overflow-x-auto px-6 pb-4">
          <div className="flex min-w-max items-stretch gap-3">
            {DIA.map((m, i) => (
              <Reveal key={m.titulo} delay={i * 60}>
                <div className="flex items-stretch gap-3">
                  <div className="flex w-56 flex-col rounded-2xl border border-border bg-card p-5">
                    <div className="text-2xl">{m.emoji}</div>
                    <div className="mt-3 font-semibold leading-snug">{m.titulo}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                  </div>
                  {i < DIA.length - 1 ? (
                    <div className="flex items-center text-primary/50">→</div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — MÓDULOS NARRATIVOS */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <Eyebrow n="05">O que você faz aqui</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Você não evolui porque ganhou.
            <br />
            <span className="text-primary">Você evolui porque entende suas decisões.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((m, i) => (
            <Reveal key={m.verbo} delay={i * 60}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <m.icon size={20} className="text-primary" />
                <div className="mt-4 text-2xl font-bold tracking-tight">{m.verbo}</div>
                <p className="mt-1 text-[15px] text-muted-foreground">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 07 — PILARES */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <Eyebrow n="06">Os pilares</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            O que torna o Zero ao Trade diferente?
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PILARES.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 70}>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <div className="font-mono text-xs text-primary">0{i + 1}</div>
                <div className="mt-3 text-xl font-semibold tracking-tight">{p.titulo}</div>
                <p className="mt-2 leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 08 — IDENTIDADE */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
        <Reveal>
          <Sparkles size={22} className="mx-auto text-primary" />
          <p className="mt-6 text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Inspirado por uma pergunta simples
          </p>
          <p className="mt-8 text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            E se o problema nunca tivesse sido escolher o ativo…
            <br />
            <span className="text-primary">…mas aprender a decidir melhor?</span>
          </p>
        </Reveal>
      </section>

      {/* 09 — O QUE VOCÊ ENCONTRA */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <Eyebrow n="07">Dentro da plataforma</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            O que você encontrará aqui
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ENCONTRA.map((item, i) => (
            <Reveal key={item} delay={i * 45}>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-[15px]">
                <Check size={16} className="shrink-0 text-success" />
                {item}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 10 — PARA QUEM É */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <Eyebrow n="08">Para quem é</Eyebrow>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-8">
              <Sprout size={20} className="text-primary" />
              <div className="mt-4 text-2xl font-bold tracking-tight">Nunca operou</div>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Aprenda do zero.
                <br />
                Sem jargões.
                <br />
                Sem promessas.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-border bg-card p-8">
              <TrendingUp size={20} className="text-primary" />
              <div className="mt-4 text-2xl font-bold tracking-tight">Já opera</div>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Estruture seu processo.
                <br />
                Descubra padrões.
                <br />
                Melhore sua disciplina.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11 — COMPROMISSO */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-28">
        <Reveal>
          <Eyebrow n="09">O compromisso da plataforma</Eyebrow>
          <ul className="mt-8 space-y-3">
            {[
              "Não prometemos lucro.",
              "Não prometemos acertar o mercado.",
              "Não recomendamos ativos.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-lg text-muted-foreground">
                <X size={18} className="mt-1 shrink-0 text-loss" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xl font-semibold">Prometemos algo diferente.</p>
          <p className="mt-3 text-2xl font-bold leading-snug tracking-tight text-primary md:text-3xl">
            Ajudar você a construir um processo de decisão mais consciente.
          </p>
        </Reveal>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 pt-12 text-center">
        <Reveal>
          <p className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            O mercado continuará sendo incerto.
            <br />
            <span className="text-primary">Sua forma de decidir não precisa ser.</span>
          </p>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
            Comece hoje a construir um processo que você consiga explicar, revisar e melhorar ao
            longo do tempo.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-9 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Começar gratuitamente
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-10 text-xs leading-relaxed text-muted-foreground">
          <p>
            Zero ao Trade — conteúdo educacional. Nada aqui é recomendação de investimento. Dados de
            perdas recorrentes de pessoas físicas baseados em estudos acadêmicos brasileiros (FGV) e
            levantamentos públicos de mercado.
          </p>
        </div>
      </footer>
    </div>
  );
}
