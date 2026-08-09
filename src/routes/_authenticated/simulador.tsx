import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  MoveRight,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScorePanel } from "@/components/ScorePanel";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useCaminho } from "@/lib/use-caminho";
import { FLOW_OPERAR_KEY, type FluxoRetomada } from "@/components/FluxoOperarModal";
import type { Perna } from "@/lib/payoff";
import { payoffCurve, summary } from "@/lib/payoff";
import { PRESETS_ESTRATEGIA } from "@/lib/presets-estrategias";
import { FLOW_LAB_KEY, montarOrigem, type OrigemFicha } from "@/lib/fichas-estrategias";
import {
  CONTRATOS_FUTUROS,
  calcularContratos,
  curvaFuturo,
  interpretarFuturo,
  lucroPorPonto,
  margemEstimada,
  precoStop,
  riscoPorContrato,
  riscoReal as riscoRealFuturo,
  type DirecaoFuturo,
  type MercadoFuturo,
  type TradeFuturo,
} from "@/lib/futuros";
import { interpretar } from "@/engines/simulation-interpreter";
import { explicarRiscos } from "@/engines/risk-explainer";
import { validarRegras, regrasQuePedemConfirmacao, type Regra } from "@/engines/rule-engine";
import { calcularDecisionScore, disciplina } from "@/engines/decision-engine";
import {
  buildDecisionContext,
  type DecisionContext,
  type DecisionContextInput,
} from "@/engines/decision-context";
import { osBus, runSimulationPipeline } from "@/engines/bus";
import { buildOmniscientContext } from "@/engines/omniscient-context";
import {
  narrarMudanca,
  narrarRegraQuebrada,
  narrarThetaCritico,
  type PassoNarrativa,
} from "@/engines/narrator";
import { MockProvider, LiveProvider, ReplayProvider } from "@/market/providers";
import type { MarketDataProvider, ProviderQuote } from "@/market/providers";
import { HttpGateway } from "@/market/http-gateway";
import type { DiaryEntry } from "@/engines/types";
import { DecisionCards } from "@/components/simulador/DecisionCards";
import { CenarioTempo } from "@/components/simulador/CenarioTempo";
import { NarrativaEstrutura } from "@/components/simulador/NarrativaEstrutura";
import { OsStatusBar } from "@/components/simulador/OsStatusBar";

export const Route = createFileRoute("/_authenticated/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador de decisão · Zero ao Trade" },
      {
        name: "description",
        content:
          "Conte o que você acredita, defina quanto pode perder e deixe o simulador construir e explicar a operação para você — antes de qualquer número técnico.",
      },
      { property: "og:title", content: "Simulador de decisão · Zero ao Trade" },
      {
        property: "og:description",
        content:
          "Uma conversa, não uma planilha: você decide o que acredita — o sistema monta e explica a estrutura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Simulador,
});

const PRESETS = PRESETS_ESTRATEGIA;

const PRESET_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(PRESETS_ESTRATEGIA).map(([k, v]) => [k, v.label]),
);

type Crenca = "subir" | "cair" | "lateral" | "aprender";
type Forca = "pouco" | "medio" | "muito";
type Instrumento = "opcoes" | "futuro";
type Etapa = "crenca" | "forca" | "stop" | "risco" | "decisao";

const ETAPAS_OPCOES: { k: Etapa; rotulo: string }[] = [
  { k: "crenca", rotulo: "Direção" },
  { k: "forca", rotulo: "Força" },
  { k: "risco", rotulo: "Risco" },
  { k: "decisao", rotulo: "Decisão" },
];

const ETAPAS_FUTURO: { k: Etapa; rotulo: string }[] = [
  { k: "crenca", rotulo: "Direção" },
  { k: "stop", rotulo: "Stop" },
  { k: "risco", rotulo: "Risco" },
  { k: "decisao", rotulo: "Decisão" },
];

const STOP_PRESETS: Record<MercadoFuturo, number[]> = {
  WIN: [100, 300, 600],
  WDO: [50, 100, 200],
};

const CRENCAS: {
  k: Crenca;
  icone: typeof ArrowUp;
  titulo: string;
  desc: string;
  risco: string;
  exemplo: string;
  classe: string;
}[] = [
  {
    k: "subir",
    icone: ArrowUp,
    titulo: "Acho que vai subir",
    desc: "Você acredita que o preço vai andar para cima nas próximas semanas.",
    risco: "Risco médio",
    exemplo: "Ex.: PETR4 acima de R$ 38",
    classe: "hover:border-success/60 hover:bg-success/5",
  },
  {
    k: "cair",
    icone: ArrowDown,
    titulo: "Acho que vai cair",
    desc: "Você acredita que o preço vai andar para baixo nas próximas semanas.",
    risco: "Risco médio",
    exemplo: "Ex.: PETR4 abaixo de R$ 38",
    classe: "hover:border-loss/60 hover:bg-loss/5",
  },
  {
    k: "lateral",
    icone: MoveRight,
    titulo: "Acho que vai andar de lado",
    desc: "Você acredita que o preço vai ficar parado, sem grande onda para nenhum lado.",
    risco: "Risco baixo a médio",
    exemplo: "Ex.: PETR4 entre R$ 37 e R$ 39",
    classe: "hover:border-primary/60 hover:bg-primary/5",
  },
  {
    k: "aprender",
    icone: GraduationCap,
    titulo: "Só quero aprender",
    desc: "Você ainda não quer arriscar nada — só entender como isso funciona.",
    risco: "Nenhum risco",
    exemplo: "Ex.: uma viagem guiada pela trava de alta",
    classe: "hover:border-border hover:bg-accent",
  },
];

const FORCAS: { k: Forca; titulo: string; desc: string; barras: string[] }[] = [
  {
    k: "pouco",
    titulo: "Pouco",
    desc: "Um movimento suave, devagar. Sem exagero.",
    barras: ["h-3", "h-4", "h-5"],
  },
  {
    k: "medio",
    titulo: "Médio",
    desc: "Um movimento regular — suficiente para uma aposta direcional sem exagero.",
    barras: ["h-5", "h-7", "h-9"],
  },
  {
    k: "muito",
    titulo: "Muito",
    desc: "Um movimento forte e rápido. Você acredita que pode acontecer a qualquer hora.",
    barras: ["h-7", "h-9", "h-11"],
  },
];

const VALORES_RISCO = [100, 300, 500, 1000];

const DIRECAO_LABEL: Record<Crenca, string> = {
  subir: "em uma alta",
  cair: "em uma queda",
  lateral: "na lateralização",
  aprender: "no aprendizado",
};

function estruturar(crenca: Crenca, forca: Forca): { preset: string; porque: string } {
  if (crenca === "subir") {
    if (forca === "muito")
      return {
        preset: "call-sozinha",
        porque:
          "Você espera uma alta forte. Uma call sozinha captura tudo que vier para cima, sem teto. Em troca, se a alta não vier a tempo, o prêmio inteiro pode virar zero — por isso dimensionamos pelo valor que você aceita perder.",
      };
    return {
      preset: "trava-alta",
      porque:
        "Você espera uma alta moderada. A trava de alta une uma call comprada a outra vendida um pouco acima: você ganha se o preço subir, paga menos pelo direito e o risco fica travado. O mercado escolheu o lucro máximo para você — tudo explicado no gráfico.",
    };
  }
  if (crenca === "cair") {
    if (forca === "muito")
      return {
        preset: "put-sozinha",
        porque:
          "Você espera uma queda forte. Uma put sozinha captura tudo que vier para baixo, sem teto. Em troca, se a queda não vier a tempo, o prêmio inteiro pode virar zero — por isso dimensionamos pelo valor que você aceita perder.",
      };
    return {
      preset: "trava-baixa",
      porque:
        "Você espera uma queda moderada. A trava de baixa usa duas puts: uma comprada e outra vendida um pouco abaixo. Você ganha se o preço cair, paga menos pela proteção e o risco fica travado.",
    };
  }
  if (crenca === "lateral") {
    return {
      preset: "iron-condor",
      porque:
        "Você espera que o preço fique parado. O condor desenha um corredor: você recebe dinheiro hoje enquanto o preço ficar dentro dele. Se o preço sair do corredor com força, a perda existe — mas é limitada e conhecida desde o início.",
    };
  }
  return {
    preset: "trava-alta",
    porque:
      "Modo aprender: vamos conhecer a operação mais didática da B3 — a trava de alta. Nenhum dinheiro real está em risco aqui: é um exemplo para você sentir a lógica antes de decidir qualquer coisa.",
  };
}

function escalaParaRisco(pernas: Perna[], centro: number, orcamento: number): Perna[] {
  const base = pernas[0]?.quantidade || 100;
  const perdaMax = Math.min(0, summary(pernas, centro).perdaMax);
  const riscoPor100 = base > 0 ? Math.abs(perdaMax) / (base / 100) : 0;
  const lotes = Math.max(1, Math.round(orcamento / Math.max(riscoPor100, 0.01) / 100));
  return pernas.map((p) => ({ ...p, quantidade: lotes * 100 }));
}

const CHECK_KEYS = ["perda", "crenca", "influencia", "regras", "recuperar"] as const;

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function Simulador() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState<Etapa>("crenca");
  const [crenca, setCrenca] = useState<Crenca | null>(null);
  const [forca, setForca] = useState<Forca | null>(null);
  const [orcamento, setOrcamento] = useState<number | null>(null);
  const [orcamentoCustom, setOrcamentoCustom] = useState("");
  const [porque, setPorque] = useState("");
  const [preset, setPreset] = useState("trava-alta");
  const [ativo, setAtivo] = useState("PETR4");
  const [centro, setCentro] = useState(38);
  const [pernas, setPernas] = useState<Perna[]>(PRESETS["trava-alta"].pernas);
  const [dias, setDias] = useState(45);
  const [iv, setIv] = useState(35);
  const [tecnico, setTecnico] = useState(false);
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const [confirmacoes, setConfirmacoes] = useState<Record<string, boolean>>({});
  const [tesePartes, setTesePartes] = useState({
    motivo: "",
    expectativa: "",
    erro: "",
    risco: "",
  });
  const { caminho } = useCaminho();
  const [instrumento, setInstrumento] = useState<Instrumento>(() =>
    caminho === "futuros" ? "futuro" : "opcoes",
  );
  const [mercadoFuturo, setMercadoFuturo] = useState<MercadoFuturo>("WIN");
  const [direcaoFuturo, setDirecaoFuturo] = useState<DirecaoFuturo | null>(null);
  const [stopPontos, setStopPontos] = useState<number | null>(null);
  const [stopCustom, setStopCustom] = useState("");
  const [entradaFuturo, setEntradaFuturo] = useState(CONTRATOS_FUTUROS.WIN.precoRef);
  const [contratosManual, setContratosManual] = useState<number | null>(null);
  const [tecnicoFuturo, setTecnicoFuturo] = useState(false);

  const fluxo = useMemo<FluxoRetomada | null>(() => {
    try {
      const raw = sessionStorage.getItem(FLOW_OPERAR_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as Partial<FluxoRetomada>;
      if (typeof p.tese !== "string" || !p.tese.trim()) return null;
      return { tese: p.tese, regraId: p.regraId ?? null, regraTexto: p.regraTexto ?? null };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (fluxo?.tese && !tesePartes.motivo.trim()) {
      setTesePartes((t) => ({ ...t, motivo: fluxo.tese }));
    }
  }, [fluxo, tesePartes.motivo]);

  // Ponte do Laboratório de Estratégias: uma ficha pré-carrega a estrutura escolhida.
  const labBridge = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(FLOW_LAB_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as {
        preset?: string;
        tese?: string;
        fichaId?: string;
        fichaNome?: string;
        hipotese?: string;
      };
      return p && p.preset && PRESETS[p.preset] ? p : null;
    } catch {
      return null;
    }
  }, []);

  const origemRef = useRef<OrigemFicha | null>(null);

  useEffect(() => {
    if (!labBridge) return;
    sessionStorage.removeItem(FLOW_LAB_KEY);
    loadPreset(labBridge.preset!);
    setEtapa("decisao");
    const motivoLab = labBridge.tese?.trim();
    if (motivoLab) {
      setTesePartes((t) => ({ ...t, motivo: motivoLab }));
    }
    origemRef.current =
      typeof labBridge.fichaId === "string" ? montarOrigem(labBridge.fichaId) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labBridge]);

  const ETAPAS = instrumento === "opcoes" ? ETAPAS_OPCOES : ETAPAS_FUTURO;
  const etapaIdx = ETAPAS.findIndex((e) => e.k === etapa);
  const aprendizado = crenca === "aprender";
  const orcamentoEfetivo = orcamento ?? 300;
  const direcao = crenca ?? "subir";

  const trade = useMemo<TradeFuturo | null>(() => {
    if (instrumento !== "futuro" || !direcaoFuturo || !stopPontos || stopPontos <= 0) return null;
    const valorPonto = CONTRATOS_FUTUROS[mercadoFuturo].valorPonto;
    const n = contratosManual ?? calcularContratos(orcamentoEfetivo, stopPontos, valorPonto);
    return {
      mercado: mercadoFuturo,
      direcao: direcaoFuturo,
      entrada: entradaFuturo,
      stop: stopPontos,
      contratos: n,
    };
  }, [
    instrumento,
    direcaoFuturo,
    stopPontos,
    orcamentoEfetivo,
    contratosManual,
    mercadoFuturo,
    entradaFuturo,
  ]);

  const leituraFuturo = useMemo(() => (trade ? interpretarFuturo(trade) : null), [trade]);

  function trocarInstrumento(i: Instrumento) {
    if (i === instrumento) return;
    recomecar();
    setInstrumento(i);
    setMercadoFuturo("WIN");
    setEntradaFuturo(CONTRATOS_FUTUROS.WIN.precoRef);
    setTecnicoFuturo(false);
  }

  function montarFuturo() {
    setContratosManual(null);
    setCheck({});
    setConfirmacoes({});
    setTesePartes({ motivo: "", expectativa: "", erro: "", risco: "" });
    setEtapa("decisao");
  }

  function montar() {
    if (!crenca) return;
    if (instrumento === "futuro") return montarFuturo();
    const f = forca ?? "medio";
    const { preset: p, porque: pq } = estruturar(crenca, f);
    setPreset(p);
    setPorque(pq);
    setAtivo(PRESETS[p].ativo);
    setCentro(PRESETS[p].centro);
    dispatchPernas(escalaParaRisco(PRESETS[p].pernas, PRESETS[p].centro, orcamentoEfetivo));
    setCheck({});
    setConfirmacoes({});
    setTesePartes({ motivo: "", expectativa: "", erro: "", risco: "" });
    setEtapa("decisao");
  }

  function loadPreset(p: string) {
    setPreset(p);
    setAtivo(PRESETS[p].ativo);
    setCentro(PRESETS[p].centro);
    dispatchPernas(PRESETS[p].pernas.map((x) => ({ ...x })));
  }

  function updatePerna(i: number, patch: Partial<Perna>) {
    dispatchPernas(pernas.map((p, j) => (i === j ? { ...p, ...patch } : p)));
  }

  function recomecar() {
    setEtapa("crenca");
    setCrenca(null);
    setForca(null);
    setOrcamento(null);
    setOrcamentoCustom("");
    setCheck({});
    setConfirmacoes({});
    setTesePartes({ motivo: "", expectativa: "", erro: "", risco: "" });
    setTecnico(false);
    setDirecaoFuturo(null);
    setStopPontos(null);
    setStopCustom("");
    setContratosManual(null);
    setTecnicoFuturo(false);
  }

  const curve = useMemo(() => payoffCurve(pernas, centro, 0.3, 101), [pernas, centro]);
  const stats = useMemo(() => summary(pernas, centro), [pernas, centro]);
  const leitura = useMemo(() => interpretar(pernas, centro, ativo), [pernas, centro, ativo]);
  const riscos = useMemo(
    () => explicarRiscos(pernas, centro, ativo, leitura),
    [pernas, centro, ativo, leitura],
  );

  const regras = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("personal_rules")
        .select("id, texto, nome, categoria, ativa, tipo, parametros_json");
      return (data as unknown as Regra[]) ?? [];
    },
  });

  const historico = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as unknown as DiaryEntry[]) ?? [];
    },
  });

  const pedemConfirmacao = useMemo(
    () => regrasQuePedemConfirmacao(regras.data ?? []),
    [regras.data],
  );

  const alertas = useMemo(
    () => validarRegras(pernas, regras.data ?? [], leitura, { confirmacoes }),
    [pernas, regras.data, leitura, confirmacoes],
  );

  const disciplinaHistorica = useMemo(() => disciplina(historico.data ?? []), [historico.data]);

  const tese = useMemo(() => {
    const { motivo, expectativa, erro, risco: riscoT } = tesePartes;
    return [motivo, expectativa, erro, riscoT]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  }, [tesePartes]);

  const riscoReal =
    instrumento === "futuro"
      ? trade
        ? riscoRealFuturo(trade)
        : 0
      : Math.abs(Math.min(0, stats.perdaMax));
  const alertasVisiveis = useMemo(
    () => (instrumento === "futuro" ? [] : alertas),
    [instrumento, alertas],
  );
  const leituraVisivel =
    instrumento === "futuro" ? (leituraFuturo as ReturnType<typeof interpretar>) : leitura;
  const checklistEmocional = useMemo(
    () => [
      { k: "perda" as const, label: `Aceito perder até ${brl(riscoReal)} nesta operação` },
      {
        k: "crenca" as const,
        label: `Estou fazendo esta operação porque acredito ${DIRECAO_LABEL[direcao]}`,
      },
      { k: "influencia" as const, label: "Não estou entrando porque alguém falou" },
      { k: "regras" as const, label: "Minha estratégia respeita as regras que eu mesmo criei" },
      { k: "recuperar" as const, label: "Se eu perder, não vou tentar recuperar imediatamente" },
    ],
    [riscoReal, direcao],
  );

  const score = useMemo(
    () =>
      calcularDecisionScore({
        simulou: true,
        tese,
        checklist: Object.fromEntries(checklistEmocional.map((c) => [c.k, !!check[c.k]])),
        alertas: alertasVisiveis,
        interpretacao: leituraVisivel,
        disciplinaHistorica,
      }),
    [tese, check, checklistEmocional, alertasVisiveis, leituraVisivel, disciplinaHistorica],
  );

  const checkOk = checklistEmocional.every((c) => check[c.k]);

  const [contexto, setContexto] = useState<DecisionContext | null>(null);
  const [quote, setQuote] = useState<ProviderQuote | null>(null);
  const [fonte, setFonte] = useState<"mock" | "live">("mock");
  const inputRef = useRef<DecisionContextInput | null>(null);
  const [passosNarrativa, setPassosNarrativa] = useState<PassoNarrativa[]>([]);
  const pernasRef = useRef<Perna[]>(PRESETS["trava-alta"].pernas);
  const passosRef = useRef<PassoNarrativa[]>([]);

  // O Narrator transforma cada intenção do usuário em um passo da história.
  function appendPasso(passo: PassoNarrativa) {
    const ultimo = passosRef.current[passosRef.current.length - 1];
    const igual =
      ultimo &&
      ultimo.titulo === passo.titulo &&
      ultimo.linhas.join("|") === passo.linhas.join("|");
    if (igual) return;
    const novos = [...passosRef.current, passo];
    passosRef.current = novos;
    setPassosNarrativa(novos);
  }

  // Sandbox = dados didáticos (mock); B3 ao vivo = mercado real via /api/market.
  // Qualquer fonte passa pela auditoria do Confidence Engine (sinal DADOS).
  const mercado = useMemo<MarketDataProvider>(
    () => (fonte === "mock" ? new MockProvider() : new LiveProvider(new HttpGateway())),
    [fonte],
  );

  // A UI emite intenções; o Bus orquestra a cascata:
  // Pricing → Greeks → Volatility → Behavior → Decision.
  function dispatchPernas(novas: Perna[]) {
    osBus.dispatchAction({ type: "LEGS_UPDATED", payload: { pernas: novas } });
  }

  useEffect(() => {
    const unsubAction = osBus.subscribeToAction((a) => {
      if (!inputRef.current) return;
      if (a.type === "TIME_TRAVEL_REQUESTED") {
        runSimulationPipeline(osBus, { ...inputRef.current, dias: a.payload.targetDTE });
      } else if (a.type === "IV_LEVEL_REQUESTED") {
        runSimulationPipeline(osBus, { ...inputRef.current, iv: a.payload.targetIV });
      } else if (a.type === "LEGS_UPDATED") {
        const prev = pernasRef.current;
        pernasRef.current = a.payload.pernas;
        const passo = narrarMudanca(
          prev,
          a.payload.pernas,
          inputRef.current.ativo,
          inputRef.current.centro,
        );
        if (passo) appendPasso(passo);
        setPernas(a.payload.pernas);
        runSimulationPipeline(osBus, { ...inputRef.current, pernas: a.payload.pernas });
      }
    });
    const unsubEvent = osBus.subscribeToEvent((e) => {
      if (e.type === "RULE_BROKEN") {
        const criticos = (inputRef.current?.alertas ?? []).filter(
          (al) => al.severidade === "critico",
        );
        if (criticos.length > 0) appendPasso(narrarRegraQuebrada(criticos.map((al) => al.regra)));
        return;
      }
      if (e.type === "THETA_CRITICAL") {
        const dias = inputRef.current?.dias ?? 0;
        appendPasso(narrarThetaCritico(dias, e.payload.dailyBleed));
        return;
      }
      if (e.type !== "CONTEXT_READY") return;
      setContexto(e.payload);
      setDias(e.payload.technical.time.daysToMaturity);
      setIv(e.payload.technical.volatility.iv);
    });
    return () => {
      unsubAction();
      unsubEvent();
    };
  }, []);

  // B3 ao vivo: o simulador ancora no mercado real (spot e IV observados).
  useEffect(() => {
    if (fonte !== "live" || !quote) return;
    const spotAlvo = quote.spot;
    const ivAlvo = quote.ivAtm;
    if (spotAlvo > 0)
      setCentro((prev) =>
        Math.abs(spotAlvo - prev) > 0.001 ? Math.round(spotAlvo * 100) / 100 : prev,
      );
    if (ivAlvo !== null && ivAlvo > 0)
      setIv((prev) => (Math.abs(ivAlvo - prev) > 0.5 ? Math.round(ivAlvo * 100) / 100 : prev));
  }, [fonte, quote]);

  useEffect(() => {
    if (instrumento === "futuro") return;
    inputRef.current = {
      pernas,
      centro,
      ativo,
      dias,
      iv,
      quote,
      entries: (historico.data ?? []) as DiaryEntry[],
      alertas,
      userScoreInput: {
        simulou: true,
        tese,
        checklist: Object.fromEntries(checklistEmocional.map((c) => [c.k, !!check[c.k]])),
        alertas,
        disciplinaHistorica,
      },
    };
    runSimulationPipeline(osBus, inputRef.current);
  }, [
    instrumento,
    pernas,
    centro,
    ativo,
    dias,
    iv,
    quote,
    alertas,
    tese,
    check,
    checklistEmocional,
    disciplinaHistorica,
    historico.data,
  ]);

  // Observação de mercado: o provedor entrega o quote e o pipeline o audita.
  useEffect(() => {
    if (instrumento === "futuro") return;
    let vivo = true;
    mercado.fetchQuote(ativo).then((q) => {
      if (vivo) setQuote(q);
    });
    return () => {
      vivo = false;
    };
  }, [ativo, centro, fonte, mercado, instrumento]);

  async function perguntarCopilot() {
    if (!contexto) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: u.user.id,
        context_type: "simulacao",
        titulo: `${leitura.nome} · ${ativo}`,
        contexto: buildOmniscientContext(contexto) as unknown as Json,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/copilot/$threadId", params: { threadId: data.id } });
  }

  async function salvar() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const respostas = Object.fromEntries(checklistEmocional.map((c) => [c.k, !!check[c.k]]));
    const nome =
      instrumento === "futuro" ? (leituraFuturo?.nome ?? "Operação futura") : leitura.nome;
    const ativoSalvo = instrumento === "futuro" ? (trade?.mercado ?? "WIN") : ativo;
    const precoSalvo = instrumento === "futuro" ? (trade?.entrada ?? 0) : centro;
    const pernasSalvas =
      instrumento === "futuro" && trade ? (trade as unknown as Json) : (pernas as unknown as Json);
    const { data, error } = await supabase
      .from("simulations")
      .insert({
        user_id: u.user.id,
        tipo_estrategia: nome,
        ativo: ativoSalvo,
        preco_atual: precoSalvo,
        origem: origemRef.current as Json | null,
        pernas: pernasSalvas,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);

    await supabase.from("checklists").insert({
      user_id: u.user.id,
      simulation_id: data.id,
      respostas,
      completo: checkOk,
    });
    await supabase.from("timeline_events").insert({
      user_id: u.user.id,
      tipo: "simulacao",
      titulo: `Simulou ${nome} em ${ativoSalvo}`,
      descricao: leituraVisivel?.resumo ?? "",
      meta: {
        simulation_id: data.id,
        score: score.score,
        risco: leituraVisivel?.risco ?? null,
      } as Json,
    });

    try {
      sessionStorage.setItem(`sim-tese:${data.id}`, JSON.stringify({ tese, checklist: respostas }));
      sessionStorage.removeItem(FLOW_OPERAR_KEY);
      if (instrumento === "opcoes" && quote) {
        sessionStorage.setItem(
          `sim-quote:${data.id}`,
          JSON.stringify({
            ivAtm: quote.ivAtm,
            ivRank: quote.ivRank,
            spot: quote.spot,
            liquidityScore: quote.liquidityScore,
            eventsImminent: quote.eventsImminent,
          }),
        );
      }
    } catch {
      /* sessionStorage indisponível — o diário pede a tese novamente */
    }

    toast.success("Simulação registrada — feche a decisão no diário.");
    qc.invalidateQueries();
    navigate({ to: "/diario", search: { sim: data.id } });
  }

  function proximo() {
    if (etapa === "crenca") {
      if (aprendizado) return montar();
      return setEtapa(instrumento === "futuro" ? "stop" : "forca");
    }
    if (etapa === "forca" || etapa === "stop") return setEtapa("risco");
    if (etapa === "risco") return montar();
  }

  function voltar() {
    if (etapa === "forca" || etapa === "stop") return setEtapa("crenca");
    if (etapa === "risco") return setEtapa(instrumento === "futuro" ? "stop" : "forca");
    if (etapa === "decisao") {
      setEtapa(aprendizado ? "crenca" : "risco");
    }
  }

  const podeContinuar =
    etapa === "crenca"
      ? crenca !== null
      : etapa === "forca"
        ? forca !== null
        : etapa === "stop"
          ? (stopPontos ?? 0) > 0
          : orcamento !== null;

  return (
    <AppShell title="Simulador de decisão">
      <div className="mx-auto max-w-5xl">
        <div className="sticky top-0 z-20 -mx-1 mb-8 bg-background/90 px-1 pb-3 pt-1 backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {etapa === "decisao" ? "Operação montada" : `Pergunta ${etapaIdx + 1} de 3`}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex shrink-0 rounded-lg border border-border bg-background p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => trocarInstrumento("opcoes")}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    instrumento === "opcoes"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Opções
                </button>
                <button
                  onClick={() => trocarInstrumento("futuro")}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    instrumento === "futuro"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Futuros WIN/WDO
                </button>
              </div>
              <button
                onClick={recomecar}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw size={12} /> Recomeçar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ETAPAS.map((e, i) => {
              const estado =
                i < etapaIdx ? "bg-success" : i === etapaIdx ? "bg-primary" : "bg-muted";
              return (
                <div key={e.k} className="min-w-0">
                  <div className={`h-1 rounded-full ${estado} transition-colors`} />
                  <div
                    className={`mt-1.5 truncate text-[10px] uppercase tracking-wide ${
                      i === etapaIdx ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {e.rotulo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {etapa !== "decisao" && (
          <div key={etapa} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {etapa === "crenca" && (
              <PassoCrenca
                crenca={crenca}
                onSelect={(c) => {
                  setCrenca(c);
                  if (c === "subir") setDirecaoFuturo("comprado");
                  if (c === "cair") setDirecaoFuturo("vendido");
                }}
                instrumento={instrumento}
              />
            )}
            {etapa === "forca" && <PassoForca forca={forca} onSelect={setForca} crenca={crenca} />}
            {etapa === "stop" && (
              <PassoStop
                mercado={mercadoFuturo}
                stop={stopPontos}
                custom={stopCustom}
                onSelect={(v) => {
                  setStopPontos(v);
                  setStopCustom(String(v));
                }}
                onCustom={(v) => {
                  setStopCustom(v);
                  const n = Math.round(Number(v));
                  setStopPontos(Number.isFinite(n) && n > 0 ? n : null);
                }}
              />
            )}
            {etapa === "risco" && (
              <PassoRisco
                orcamento={orcamento}
                custom={orcamentoCustom}
                instrumento={instrumento}
                onSelect={setOrcamento}
                onCustom={(v) => {
                  setOrcamentoCustom(v);
                  const n = Math.round(Number(v));
                  setOrcamento(Number.isFinite(n) && n > 0 ? n : null);
                }}
              />
            )}

            <div className="mt-10 flex items-center gap-3">
              <button
                onClick={voltar}
                disabled={etapa === "crenca"}
                className="rounded-lg border border-border p-3 text-muted-foreground hover:bg-accent disabled:opacity-30"
                aria-label="Voltar"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={proximo}
                disabled={!podeContinuar}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {aprendizado && etapa === "crenca"
                  ? "Começar a aprender"
                  : etapa === "risco"
                    ? "Montar minha operação"
                    : "Continuar"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {etapa === "decisao" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {aprendizado && (
              <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <GraduationCap size={16} /> Modo aprender
                </div>
                <p className="mt-1 text-muted-foreground">
                  Nada aqui envolve dinheiro real: esta é uma operação de exemplo para você sentir a
                  lógica antes de qualquer decisão.
                </p>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-6">
                {instrumento === "opcoes" && (
                  <CardOperacao
                    porque={porque}
                    leituraNome={leitura.nome}
                    leituraRisco={leitura.risco}
                    leituraComplexidade={leitura.complexidade}
                    leituraResumo={leitura.resumo}
                    objetivoLabel={leitura.objetivoLabel}
                    stats={stats}
                    leitura={leitura}
                    crenca={direcao}
                    forca={forca ?? "medio"}
                    orcamentoEfetivo={orcamentoEfetivo}
                    riscoReal={riscoReal}
                    aprendizado={aprendizado}
                  />
                )}

                {instrumento === "futuro" && trade && (
                  <CardOperacaoFuturo
                    trade={trade}
                    porqueFuturo={`Você aceita perder até ${brl(orcamentoEfetivo)}. Com o stop de ${trade.stop} pontos (R$ ${riscoPorContrato(trade.stop, CONTRATOS_FUTUROS[trade.mercado].valorPonto).toFixed(2)} por contrato), o cálculo mecânico diz: contratos = ${brl(orcamentoEfetivo)} ÷ (${trade.stop} pts × R$ ${CONTRATOS_FUTUROS[trade.mercado].valorPonto.toFixed(2)}) = ${trade.contratos}. Nada de adivinhar tamanho: o risco define o tamanho, nunca o contrário.`}
                  />
                )}

                {instrumento === "opcoes" && <NarrativaEstrutura passos={passosNarrativa} />}

                {instrumento === "opcoes" && <PernasExplicadas pernas={pernas} ativo={ativo} />}

                {instrumento === "opcoes" && (
                  <GraficoEducativo
                    pernas={pernas}
                    centro={centro}
                    ativo={ativo}
                    leitura={leitura}
                  />
                )}

                {instrumento === "futuro" && trade && <GraficoFuturo trade={trade} />}

                {contexto && instrumento === "opcoes" && <OsStatusBar contexto={contexto} />}

                {instrumento === "opcoes" && (
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Fonte de dados
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {fonte === "mock"
                          ? "Sandbox didático: cenários estáveis para aprender sem surpresas."
                          : "B3 ao vivo: spot e volatilidade reais; book real quando a fonte expõe, chain modelada com transparência."}{" "}
                        O sinal DADOS mostra o veredito da auditoria.
                      </p>
                    </div>
                    <div className="flex shrink-0 rounded-xl border border-border bg-background p-0.5 text-xs font-medium">
                      <button
                        onClick={() => setFonte("mock")}
                        className={`rounded-lg px-3 py-1.5 transition-colors ${
                          fonte === "mock"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Sandbox
                      </button>
                      <button
                        onClick={() => setFonte("live")}
                        className={`rounded-lg px-3 py-1.5 transition-colors ${
                          fonte === "live"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        B3 ao vivo
                      </button>
                    </div>
                  </div>
                )}

                {contexto && instrumento === "opcoes" && (
                  <DecisionCards contexto={contexto} alertas={alertas} />
                )}

                {instrumento === "opcoes" && (
                  <CenarioTempo
                    pernas={pernas}
                    centro={centro}
                    ativo={ativo}
                    dias={dias}
                    iv={iv}
                    onDias={(d) =>
                      osBus.dispatchAction({
                        type: "TIME_TRAVEL_REQUESTED",
                        payload: { targetDTE: d },
                      })
                    }
                    onIv={(v) =>
                      osBus.dispatchAction({ type: "IV_LEVEL_REQUESTED", payload: { targetIV: v } })
                    }
                  />
                )}

                {instrumento === "opcoes" && (
                  <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Sparkles size={14} /> O que pode acontecer
                    </div>
                    <ul className="mt-4 space-y-3">
                      {riscos.map((r, i) => (
                        <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
                          <span
                            className={`mt-1.5 size-2 shrink-0 rounded-full ${
                              r.tom === "ruim"
                                ? "bg-loss"
                                : r.tom === "bom"
                                  ? "bg-success"
                                  : "bg-muted-foreground"
                            }`}
                          />
                          <span>
                            <span className="font-medium">{r.cenario}</span>
                            <span className="text-muted-foreground"> — {r.consequencia}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {instrumento === "futuro" && trade && <CenariosFuturo trade={trade} />}

                {instrumento === "opcoes" && (
                  <CardDozeAnos
                    analogia={leitura.analogia}
                    objetivo={leitura.objetivo}
                    licaoSlug={leitura.licaoSlug}
                  />
                )}

                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <ShieldCheck size={14} /> Checklist emocional
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Não é sobre números — é sobre você estar no controle da decisão.
                  </p>
                  <div className="mt-4 space-y-3">
                    {checklistEmocional.map((c) => (
                      <label
                        key={c.k}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-accent/40"
                      >
                        <input
                          type="checkbox"
                          checked={!!check[c.k]}
                          onChange={(e) => setCheck({ ...check, [c.k]: e.target.checked })}
                          className="mt-1 size-4 accent-[oklch(0.78_0.17_65)]"
                        />
                        <span
                          className={`text-sm leading-snug ${
                            check[c.k] ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {c.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <Lightbulb size={14} /> Complete a sua tese
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Uma decisão com nome é uma decisão que você entende.
                  </p>
                  {fluxo && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                        Hipótese vinda da sua conversa
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed italic">“{fluxo.tese}”</p>
                      {fluxo.regraTexto && (
                        <p className="mt-2 border-t border-primary/20 pt-2 text-xs leading-relaxed text-muted-foreground">
                          Regra que você se comprometeu a honrar:{" "}
                          <span className="font-medium text-foreground">{fluxo.regraTexto}</span>
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 space-y-3">
                    <TeseCampo
                      prefixo="Estou fazendo essa operação porque"
                      value={tesePartes.motivo}
                      onChange={(v) => setTesePartes((t) => ({ ...t, motivo: v }))}
                    />
                    <TeseCampo
                      prefixo="Espero que o ativo"
                      value={tesePartes.expectativa}
                      onChange={(v) => setTesePartes((t) => ({ ...t, expectativa: v }))}
                    />
                    <TeseCampo
                      prefixo="Se eu estiver errado"
                      value={tesePartes.erro}
                      onChange={(v) => setTesePartes((t) => ({ ...t, erro: v }))}
                    />
                    <TeseCampo
                      prefixo="Meu risco máximo será"
                      value={tesePartes.risco}
                      onChange={(v) => setTesePartes((t) => ({ ...t, risco: v }))}
                    />
                  </div>
                  <div className="mt-3 text-right text-[11px] text-muted-foreground">
                    {tese.trim().length} caracteres{" "}
                    {tese.trim().length < 40 && "· mínimo 40 para pontuar"}
                  </div>
                </div>

                {instrumento === "opcoes" && (
                  <DetalhesTecnicos
                    aberto={tecnico}
                    onToggle={() => setTecnico((v) => !v)}
                    pernas={pernas}
                    ativo={ativo}
                    centro={centro}
                    preset={preset}
                    onPreset={loadPreset}
                    onAtivo={setAtivo}
                    onCentro={setCentro}
                    onPernas={dispatchPernas}
                    updatePerna={updatePerna}
                    pedemConfirmacao={pedemConfirmacao}
                    confirmacoes={confirmacoes}
                    setConfirmacoes={setConfirmacoes}
                    alertas={alertas}
                  />
                )}

                {instrumento === "futuro" && trade && (
                  <DetalhesTecnicosFuturo
                    aberto={tecnicoFuturo}
                    onToggle={() => setTecnicoFuturo((v) => !v)}
                    trade={trade}
                    mercado={mercadoFuturo}
                    onMercado={(m) => {
                      setMercadoFuturo(m);
                      setEntradaFuturo(CONTRATOS_FUTUROS[m].precoRef);
                      setContratosManual(null);
                      setStopPontos(null);
                      setStopCustom("");
                    }}
                    direcaoFuturo={direcaoFuturo}
                    onDirecao={setDirecaoFuturo}
                    entrada={entradaFuturo}
                    onEntrada={setEntradaFuturo}
                    stop={stopPontos}
                    onStop={(v) => {
                      setStopPontos(v);
                      setStopCustom(String(v));
                    }}
                    contratos={trade.contratos}
                    onContratos={setContratosManual}
                    calculado={trade.contratos}
                  />
                )}

                <ScorePanel score={score} />

                <button
                  onClick={salvar}
                  disabled={!checkOk && !aprendizado}
                  className="w-full rounded-xl bg-primary py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  {aprendizado ? "Registrar como exercício" : "Levar esta decisão para o Diário"}
                </button>
                {!checkOk && !aprendizado && (
                  <p className="text-center text-xs text-muted-foreground">
                    Responda o checklist inteiro para registrar a decisão.
                  </p>
                )}
              </div>

              {instrumento === "opcoes" && (
                <CopilotPanel
                  pernas={pernas}
                  ativo={ativo}
                  leitura={leitura}
                  onAbrir={perguntarCopilot}
                />
              )}

              {instrumento === "futuro" && trade && <CopilotFuturo trade={trade} />}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PassoCrenca({
  crenca,
  onSelect,
  instrumento,
}: {
  crenca: Crenca | null;
  onSelect: (c: Crenca) => void;
  instrumento: Instrumento;
}) {
  const cartoes = instrumento === "futuro" ? CRENCAS.filter((c) => c.k !== "lateral") : CRENCAS;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
          O que você acredita que vai acontecer?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Não precisa acertar. Essa resposta define{" "}
          <span className="text-foreground">qual lado do mercado faz sentido</span> — não qual lucro
          você terá. O simulador monta e explica o resto.
        </p>
      </div>
      {instrumento === "futuro" && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
          <div className="font-semibold text-primary">Por que não existe “parado” aqui</div>
          No futuro não há estrutura para ganhar com lateralização: ou você tem direção, ou não há
          operação. Se hoje não há direção, ficar de fora também é uma decisão — e o simulador
          respeita isso.
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cartoes.map((c) => {
          const Icon = c.icone;
          const ativo = crenca === c.k;
          return (
            <button
              key={c.k}
              onClick={() => onSelect(c.k)}
              className={`group rounded-2xl border p-6 text-left transition-all ${
                ativo
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : `border-border bg-card ${c.classe}`
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`grid size-12 place-items-center rounded-xl ${
                    ativo ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"
                  }`}
                >
                  <Icon size={24} />
                </div>
                <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {c.risco}
                </span>
              </div>
              <div className="mt-4 text-lg font-semibold">
                {instrumento === "futuro" && c.k === "subir"
                  ? "Comprar (comprado)"
                  : instrumento === "futuro" && c.k === "cair"
                    ? "Vender (vendido)"
                    : c.titulo}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <p className="mt-3 text-xs text-muted-foreground">{c.exemplo}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PassoForca({
  forca,
  onSelect,
  crenca,
}: {
  forca: Forca | null;
  onSelect: (f: Forca) => void;
  crenca: Crenca | null;
}) {
  const pergunta =
    crenca === "cair"
      ? "Quanto de queda você espera?"
      : crenca === "lateral"
        ? "Com que força você acha que o preço foge dessa faixa?"
        : "Quanto de alta você espera?";
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">{pergunta}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground">
          A força do movimento esperado muda a estrutura. Estruturas para movimento forte são
          diferentes das de movimento suave.
        </p>
      </div>
      <div className="mt-8 space-y-3">
        {FORCAS.map((f) => {
          const ativo = forca === f.k;
          return (
            <button
              key={f.k}
              onClick={() => onSelect(f.k)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                ativo
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex h-12 items-end gap-1">
                {f.barras.map((h, bi) => (
                  <div
                    key={bi}
                    className={`w-4 rounded-sm ${h} ${bi === 1 ? "bg-primary" : bi === 0 ? "bg-primary/70" : "bg-primary/40"}`}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{f.titulo}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{f.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PassoStop({
  mercado,
  stop,
  custom,
  onSelect,
  onCustom,
}: {
  mercado: MercadoFuturo;
  stop: number | null;
  custom: string;
  onSelect: (v: number) => void;
  onCustom: (v: string) => void;
}) {
  const c = CONTRATOS_FUTUROS[mercado];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
          Se você estiver errado, em quantos pontos você admite o erro?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Este é o seu stop: o lugar onde a sua hipótese morreu. O tamanho da posição será calculado
          a partir dele — quem define o risco é você, não o mercado.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {STOP_PRESETS[mercado].map((v) => {
          const ativo = stop === v;
          return (
            <button
              key={v}
              onClick={() => onSelect(v)}
              className={`rounded-2xl border p-5 text-center transition-all ${
                ativo
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="text-xl font-bold">{v}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">pontos</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                = R$ {riscoPorContrato(v, c.valorPonto).toFixed(2)}/contrato
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/50 p-5">
        <label className="block text-sm">
          Outro stop? Escolha você (em pontos):
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={c.tick}
              step={c.tick}
              value={custom}
              onChange={(e) => onCustom(e.target.value)}
              placeholder={`ex.: ${STOP_PRESETS[mercado][1]}`}
              className="w-32 rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm"
            />
            <span className="text-xs text-muted-foreground">
              Lembra: o stop define quanto cada contrato pode custar.
            </span>
          </div>
        </label>
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            {mercado}: 1 ponto ={" "}
            <span className="font-mono text-foreground">R$ {c.valorPonto.toFixed(2)}</span>
          </span>
          <span>
            tick mínimo:{" "}
            <span className="font-mono text-foreground">
              {c.tick} pts = R$ {c.valorTick.toFixed(2)}
            </span>
          </span>
        </div>
        <p className="mt-2">
          O stop não é garantia de execução exata: em notícia forte o preço pode pular o seu nível
          (slippage). Você decide onde ele fica — e o simulador dimensiona para caber no risco que
          você aceita.
        </p>
      </div>
    </div>
  );
}

function PassoRisco({
  orcamento,
  custom,
  instrumento,
  onSelect,
  onCustom,
}: {
  orcamento: number | null;
  custom: string;
  instrumento: Instrumento;
  onSelect: (v: number) => void;
  onCustom: (v: string) => void;
}) {
  const max = 1000;
  const visivel = orcamento ?? 0;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
          Quanto dinheiro você aceita perder se estiver errado?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground">
          {instrumento === "futuro"
            ? "Esse é o valor que você coloca em risco — e nunca mais. O tamanho em contratos será calculado para caber dentro dele."
            : "Esse é o valor que você coloca em risco — e nunca mais. A estrutura será dimensionada para caber dentro dele."}
        </p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {VALORES_RISCO.map((v) => {
          const ativo = orcamento === v;
          return (
            <button
              key={v}
              onClick={() => onSelect(v)}
              className={`rounded-2xl border p-5 text-center transition-all ${
                ativo
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="text-xl font-bold">R${v}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {v === 100
                  ? "um jantar fora"
                  : v === 300
                    ? "uma compra de mercado"
                    : v === 500
                      ? "um fim de semana"
                      : "uma parcela do aluguel"}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/50 p-5">
        <label className="block text-sm">
          Outro valor? Escolha você:
          <div className="mt-2 flex items-center gap-2">
            <CircleDollarSign size={16} className="text-muted-foreground" />
            <input
              type="number"
              min={10}
              step={50}
              value={custom}
              onChange={(e) => onCustom(e.target.value)}
              placeholder="R$ 250"
              className="w-32 rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm"
            />
            <span className="text-xs text-muted-foreground">
              Lembra: é dinheiro que pode virar zero.
            </span>
          </div>
        </label>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Você aceita colocar em risco
          </div>
          <div className="font-mono text-2xl font-bold text-loss">R${visivel}</div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-loss/80 transition-all duration-300"
            style={{ width: `${Math.min(100, (visivel / max) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {instrumento === "futuro"
            ? "Esse número vira o teto da posição: o tamanho é consequência, a perda é sempre limitada por esse valor."
            : "Esse número vira o teto da estrutura: lucro é consequência, perda é sempre limitada por esse valor."}
        </p>
      </div>
    </div>
  );
}

function CardOperacaoFuturo({ trade, porqueFuturo }: { trade: TradeFuturo; porqueFuturo: string }) {
  const c = CONTRATOS_FUTUROS[trade.mercado];
  const leitura = interpretarFuturo(trade);
  const comprado = trade.direcao === "comprado";
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-6 md:p-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
        Essa é a operação que construímos
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-2xl font-bold tracking-tight md:text-3xl">{leitura.nome}</h3>
        <span className="rounded-full bg-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary">
          Risco médio
        </span>
        <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] text-muted-foreground">
          direcional · {comprado ? "comprado" : "vendido"}
        </span>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed">{porqueFuturo}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Risco máximo
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-loss">
            {brl(riscoRealFuturo(trade))}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {trade.stop} pts × R$ {c.valorPonto.toFixed(2)} × {trade.contratos}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Lucro por ponto
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-success">
            {brl(lucroPorPonto(trade))}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">sem teto</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Stop</div>
          <div className="mt-1 font-mono text-lg font-bold">{trade.stop} pts</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {comprado ? "abaixo" : "acima"} de {precoStop(trade).toLocaleString("pt-BR")} pts
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Tamanho</div>
          <div className="mt-1 font-mono text-lg font-bold">
            {trade.contratos} {trade.contratos === 1 ? "contrato" : "contratos"}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            margem ≈ {brl(margemEstimada(trade))}
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-primary/20 pt-4 text-sm leading-relaxed text-muted-foreground">
        {leitura.resumo}
      </p>
    </div>
  );
}

function GraficoFuturo({ trade }: { trade: TradeFuturo }) {
  const curve = useMemo(() => curvaFuturo(trade), [trade]);
  const comprado = trade.direcao === "comprado";
  const stopAbs = precoStop(trade);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          A história do seu dinheiro
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-[oklch(0.78_0.17_65)]" /> entrada
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-success" /> ganho
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-loss" /> stop
          </span>
        </div>
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer>
          <AreaChart data={curve}>
            <defs>
              <linearGradient id="pgf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.6} />
                <stop offset="50%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="preco"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
              tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
            />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12 }}
              formatter={(v: number) => [brl(v), "Resultado"]}
              labelFormatter={(l) => `Preço: ${Number(l).toLocaleString("pt-BR")} pts`}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            <ReferenceLine
              x={trade.entrada}
              stroke="oklch(0.78 0.17 65)"
              strokeDasharray="4 4"
              label={{
                value: "entrada",
                position: "top",
                fill: "oklch(0.78 0.17 65)",
                fontSize: 11,
              }}
            />
            <ReferenceLine
              x={stopAbs}
              stroke="oklch(0.63 0.24 27)"
              strokeDasharray="4 4"
              label={{ value: "stop", position: "top", fill: "oklch(0.63 0.24 27)", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="resultado"
              stroke={comprado ? "oklch(0.72 0.18 155)" : "oklch(0.78 0.17 65)"}
              fill="url(#pgf)"
              baseValue={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-2.5">
        <li className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-success" />
          <span className="text-muted-foreground">
            {comprado
              ? `Cada ponto acima da entrada vale ${brl(lucroPorPonto(trade))} — sem teto.`
              : `Cada ponto abaixo da entrada vale ${brl(lucroPorPonto(trade))} — sem teto.`}
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-loss" />
          <span className="text-muted-foreground">
            {comprado
              ? `Se o preço cair até ${stopAbs.toLocaleString("pt-BR")} pontos, o stop é tocado: perda máxima de ${brl(riscoRealFuturo(trade))}.`
              : `Se o preço subir até ${stopAbs.toLocaleString("pt-BR")} pontos, o stop é tocado: perda máxima de ${brl(riscoRealFuturo(trade))}.`}
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">
            Sem stop, esta reta não teria limite — por isso o stop faz parte do tamanho, não é um
            detalhe.
          </span>
        </li>
      </ul>
    </div>
  );
}

function CenariosFuturo({ trade }: { trade: TradeFuturo }) {
  const comprado = trade.direcao === "comprado";
  const c = CONTRATOS_FUTUROS[trade.mercado];
  const itens: { tom: "ruim" | "bom" | "neutro"; cenario: string; consequencia: string }[] = [
    {
      tom: "ruim",
      cenario: "O stop é tocado",
      consequencia: `${trade.mercado} anda contra você até ${trade.stop} pontos: a perda chega a ${brl(riscoRealFuturo(trade))} — o valor exato que você aceitou antes de entrar.`,
    },
    {
      tom: "bom",
      cenario: "Anda a favor",
      consequencia: `Cada ponto a favor vale ${brl(lucroPorPonto(trade))}. Sem teto: quanto mais andar na sua direção, mais você ganha.`,
    },
    {
      tom: "neutro",
      cenario: "Fica parado",
      consequencia: `No futuro não há theta — não há perda só por esperar. Mas o ajuste diário liquida a posição todo pregão, e cada dia parado é custo de oportunidade.`,
    },
    {
      tom: "neutro",
      cenario: "Pula o stop",
      consequencia: `Em notícia forte, o preço pode saltar o seu nível e a saída sair pior que o planejado (slippage). Por isso o risco nunca ocupa o capital inteiro.`,
    },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles size={14} /> O que pode acontecer
      </div>
      <ul className="mt-4 space-y-3">
        {itens.map((r, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${
                r.tom === "ruim"
                  ? "bg-loss"
                  : r.tom === "bom"
                    ? "bg-success"
                    : "bg-muted-foreground"
              }`}
            />
            <span>
              <span className="font-medium">{r.cenario}</span>
              <span className="text-muted-foreground"> — {r.consequencia}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        {comprado ? "Você compra" : "Você vende"} a variação direta de {trade.mercado}: o resultado
        é liquidado em dinheiro todo fim de pregão (ajuste diário), mesmo sem fechar a posição.
      </p>
    </div>
  );
}

function DetalhesTecnicosFuturo({
  aberto,
  onToggle,
  trade,
  mercado,
  onMercado,
  direcaoFuturo,
  onDirecao,
  entrada,
  onEntrada,
  stop,
  onStop,
  contratos,
  onContratos,
  calculado,
}: {
  aberto: boolean;
  onToggle: () => void;
  trade: TradeFuturo;
  mercado: MercadoFuturo;
  onMercado: (m: MercadoFuturo) => void;
  direcaoFuturo: DirecaoFuturo | null;
  onDirecao: (d: DirecaoFuturo) => void;
  entrada: number;
  onEntrada: (v: number) => void;
  stop: number | null;
  onStop: (v: number) => void;
  contratos: number;
  onContratos: (v: number) => void;
  calculado: number;
}) {
  const c = CONTRATOS_FUTUROS[mercado];
  const riscoAtual = riscoRealFuturo(trade);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 p-5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Settings2 size={15} className="text-muted-foreground" />
          Detalhes técnicos <span className="text-muted-foreground">(opcional)</span>
        </span>
        {aberto ? (
          <ChevronUp size={15} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground" />
        )}
      </button>
      {aberto && (
        <div className="space-y-4 border-t border-border p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Mercado</span>
            {(Object.keys(CONTRATOS_FUTUROS) as MercadoFuturo[]).map((m) => (
              <button
                key={m}
                onClick={() => onMercado(m)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  mercado === m
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Direção</span>
            <button
              onClick={() => onDirecao("comprado")}
              className={`rounded-full border px-3 py-1 text-xs ${
                direcaoFuturo === "comprado"
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              Comprado (compra)
            </button>
            <button
              onClick={() => onDirecao("vendido")}
              className={`rounded-full border px-3 py-1 text-xs ${
                direcaoFuturo === "vendido"
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              Vendido (venda)
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-muted-foreground">
              Entrada (pontos)
              <input
                type="number"
                step={c.tick}
                value={entrada}
                onChange={(e) => onEntrada(+e.target.value || 0)}
                className="mt-1 w-full rounded-md border border-border bg-input px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Stop (pontos)
              <input
                type="number"
                step={c.tick}
                min={c.tick}
                value={stop ?? ""}
                onChange={(e) => {
                  const n = +e.target.value;
                  onStop(Number.isFinite(n) && n > 0 ? n : 0);
                }}
                className="mt-1 w-full rounded-md border border-border bg-input px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Contratos
              <input
                type="number"
                min={1}
                value={contratos}
                onChange={(e) => onContratos(Math.max(1, Math.round(+e.target.value || 1)))}
                className="mt-1 w-full rounded-md border border-border bg-input px-2 py-1 font-mono text-sm"
              />
            </label>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 text-xs leading-relaxed">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span>
                Calculado pela sua regra:{" "}
                <span className="font-mono text-foreground">{calculado} contratos</span>
              </span>
              <span>
                {contratos !== calculado && (
                  <span className="text-loss">
                    risco real agora: {brl(riscoAtual)} (diferente do planejado)
                  </span>
                )}
                {contratos === calculado && (
                  <span>
                    risco real: <span className="font-mono text-foreground">{brl(riscoAtual)}</span>
                  </span>
                )}
              </span>
              <span>
                margem estimada:{" "}
                <span className="font-mono text-foreground">{brl(margemEstimada(trade))}</span>
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">
              {c.descricao} Margem mínima B3: {brl(c.margemMinima)}/contrato em day trade — sua
              corretora pode exigir mais. Margem é garantia do ajuste diário, não é perda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CopilotFuturo({ trade }: { trade: TradeFuturo }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const c = CONTRATOS_FUTUROS[trade.mercado];
  const perguntas: { k: string; q: string; a: string }[] = [
    {
      k: "formula",
      q: "Por que o tamanho é calculado assim?",
      a: `Contratos = risco ÷ (stop em pontos × valor do ponto). No seu caso: risco ${brl(riscoRealFuturo(trade))} ÷ (${trade.stop} pts × R$ ${c.valorPonto.toFixed(2)}) = ${trade.contratos} contratos. O risco que você aceitou vira o teto do tamanho: se o stop for tocado, a perda é a que você definiu antes de entrar. Quem define o tamanho é o seu risco, nunca o achismo.`,
    },
    {
      k: "margem",
      q: "O que é a margem?",
      a: `É a garantia que a corretora retém para cobrir o ajuste diário — não é perda e não é custo. Cada contrato de ${trade.mercado} exige no mínimo ${brl(c.margemMinima)} (valor B3; sua corretora pode exigir mais). Se o ajuste consumir a margem, a corretora faz chamada de margem para você aportar.`,
    },
    {
      k: "ajuste",
      q: "O que é o ajuste diário?",
      a: 'Todo fim de pregão o resultado da sua posição é liquidado na conta: ganhou, credita; perdeu, debita. No futuro não dá para "segurar até recuperar" como numa ação — o mercado cobra todos os dias. É por isso que o stop e o tamanho importam tanto aqui.',
    },
    {
      k: "slippage",
      q: "E se o preço pular o meu stop?",
      a: "Em notícia forte, o preço pode saltar o seu nível e a saída sai pior que o planejado (slippage). Por isso o dimensionamento nunca ocupa o seu risco inteiro em um único trade: sobra espaço para o inesperado.",
    },
    {
      k: "teto",
      q: "O lucro tem teto?",
      a: `Não. Futuro é direcional puro: cada ponto a favor vale ${brl(lucroPorPonto(trade))}, sem limite. O inverso também é verdade — sem stop, a perda não tem teto. Por isso o stop faz parte do tamanho, não é um detalhe.`,
    },
    {
      k: "horario",
      q: "Quando posso operar?",
      a: "O pregão do mini índice e do minidólar vai das 9h às 18h. Fora dele não há negociação — e notícias fora do horário podem abrir o preço longe do seu stop (gap na abertura), outra razão para não arriscar o capital inteiro.",
    },
  ];
  return (
    <aside className="lg:sticky lg:top-24 h-fit space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <HelpCircle size={14} /> Copilot — seu mentor
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Eu não escolho por você. Só explico, na hora, o que cada coisa significa nesta operação.
        </p>
        <div className="mt-4 space-y-2">
          {perguntas.map((p) => (
            <div key={p.k} className="rounded-xl border border-border bg-card">
              <button
                onClick={() => setAberto(aberto === p.k ? null : p.k)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm"
              >
                <MessageCircle size={14} className="mt-0.5 shrink-0 text-primary" />
                <span className="flex-1 leading-snug">{p.q}</span>
                {aberto === p.k ? (
                  <ChevronUp size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {aberto === p.k && (
                <p className="border-t border-border px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
                  {p.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest">
          <Wallet size={14} /> Lembrete
        </div>
        <p className="mt-2">
          O resultado já está decidido antes de você apertar o botão. A bolsa só entrega o gráfico
          que você já viu aqui — e o ajuste diário cobra todo pregão.
        </p>
      </div>
    </aside>
  );
}

function CardOperacao({
  porque,
  leituraNome,
  leituraRisco,
  leituraComplexidade,
  leituraResumo,
  objetivoLabel,
  stats,
  leitura,
  crenca,
  forca,
  orcamentoEfetivo,
  riscoReal,
  aprendizado,
}: {
  porque: string;
  leituraNome: string;
  leituraRisco: string;
  leituraComplexidade: string;
  leituraResumo: string;
  objetivoLabel: string;
  stats: ReturnType<typeof summary>;
  leitura: ReturnType<typeof interpretar>;
  crenca: Crenca;
  forca: Forca;
  orcamentoEfetivo: number;
  riscoReal: number;
  aprendizado: boolean;
}) {
  const riscoCor =
    leituraRisco === "baixo"
      ? "bg-success/15 text-success"
      : leituraRisco === "medio"
        ? "bg-primary/20 text-primary"
        : "bg-loss/15 text-loss";
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-6 md:p-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
        Essa é a operação que construímos
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-2xl font-bold tracking-tight md:text-3xl">{leituraNome}</h3>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${riscoCor}`}>
          Risco {leituraRisco === "medio" ? "médio" : leituraRisco}
        </span>
        <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] text-muted-foreground">
          {leituraComplexidade}
        </span>
      </div>
      {!aprendizado && (
        <p className="mt-4 rounded-xl bg-card/80 p-4 text-sm leading-relaxed text-muted-foreground">
          Você disse: <span className="text-foreground">acredito {DIRECAO_LABEL[crenca]}</span>, com
          força <span className="text-foreground">{forca}</span>, aceitando perder até{" "}
          <span className="text-foreground">{brl(orcamentoEfetivo)}</span>. A partir disso
          escolhemos esta estrutura:
        </p>
      )}
      <p className="mt-4 text-[15px] leading-relaxed">{porque}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Risco máximo
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-loss">
            {leitura.perdaLimitada ? brl(riscoReal) : "sem teto"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Lucro máximo
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-success">
            {leitura.lucroLimitado ? brl(Math.max(0, stats.lucroMax)) : "ilimitado"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Breakeven</div>
          <div className="mt-1 font-mono text-lg font-bold">
            {leitura.breakevens.length
              ? leitura.breakevens.map((b) => b.toFixed(2)).join(" / ")
              : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Objetivo</div>
          <div className="mt-1 text-sm font-semibold leading-snug">{objetivoLabel}</div>
        </div>
      </div>

      <p className="mt-5 border-t border-primary/20 pt-4 text-sm leading-relaxed text-muted-foreground">
        {leituraResumo}
      </p>
    </div>
  );
}

function descricaoPerna(p: Perna, ativo: string, i: number) {
  const badge = `Perna ${i + 1} · ${p.acao === "compra" ? "Compra" : "Venda"} de ${p.tipo.toUpperCase()}`;
  let texto = "";
  if (p.tipo === "call" && p.acao === "compra")
    texto = `Você compra o direito de comprar ${ativo} por R$${p.strike.toFixed(2)} até o vencimento. Essa perna ganha valor se ${ativo} subir.`;
  else if (p.tipo === "call" && p.acao === "venda")
    texto = `Você vende esse direito para outra pessoa e recebe em troca. Em troca, você aceita limitar o ganho acima de R$${p.strike.toFixed(2)}.`;
  else if (p.tipo === "put" && p.acao === "compra")
    texto = `Você compra o direito de vender ${ativo} por R$${p.strike.toFixed(2)} até o vencimento. Essa perna ganha valor se ${ativo} cair.`;
  else
    texto = `Você vende esse direito para outra pessoa e recebe em troca. Em troca, você aceita comprar ${ativo} por R$${p.strike.toFixed(2)} se o preço cair.`;
  return { badge, texto };
}

function PernasExplicadas({ pernas, ativo }: { pernas: Perna[]; ativo: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Como funciona, perna por perna
      </div>
      <div className="mt-4 space-y-4">
        {pernas.map((p, i) => {
          const { badge, texto } = descricaoPerna(p, ativo, i);
          return (
            <div key={i} className="rounded-xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {badge}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Strike R${p.strike.toFixed(2)} · Prêmio R${p.premio.toFixed(2)} · {p.quantidade}{" "}
                  opções
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">{texto}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GraficoEducativo({
  pernas,
  centro,
  ativo,
  leitura,
}: {
  pernas: Perna[];
  centro: number;
  ativo: string;
  leitura: ReturnType<typeof interpretar>;
}) {
  const curve = useMemo(() => payoffCurve(pernas, centro, 0.3, 101), [pernas, centro]);
  const stats = useMemo(() => summary(pernas, centro), [pernas, centro]);

  let maxP = curve[0];
  let minP = curve[0];
  for (const c of curve) {
    if (c.resultado > maxP.resultado) maxP = c;
    if (c.resultado < minP.resultado) minP = c;
  }

  const primeiroBe = leitura.breakevens[0];
  const captions: { tom: "bom" | "ruim" | "neutro"; texto: string }[] = [];

  if (primeiroBe !== undefined) {
    captions.push({
      tom: "bom",
      texto:
        leitura.objetivo === "baixa"
          ? `Começa a ganhar: abaixo de R$${primeiroBe.toFixed(2)} no vencimento você está no azul.`
          : leitura.objetivo === "lateralizacao"
            ? `A zona de ganho fica dentro do corredor: de R$${primeiroBe.toFixed(2)} em diante, enquanto o preço não sair dele.`
            : `Começa a ganhar: acima de R$${primeiroBe.toFixed(2)} no vencimento você está no azul.`,
    });
  }
  captions.push({
    tom: "neutro",
    texto: leitura.lucroLimitado
      ? `Lucro travado: depois de R$${maxP.preco.toFixed(2)}, seu ganho não sobe mais — essa é a troca que barateou a operação.`
      : `Sem teto de lucro: quanto mais o preço andar na direção que você espera, mais você ganha.`,
  });
  captions.push({
    tom: "ruim",
    texto:
      minP.resultado < 0
        ? `Perda máxima de ${brl(Math.abs(minP.resultado))}: só acontece se o vencimento te pegar no pior ponto do gráfico.`
        : `Esta estrutura não tem perda se ficar parada — mas o tempo ainda corrói o valor antes do vencimento.`,
  });
  captions.push({
    tom: "neutro",
    texto: `Hoje ${ativo} está em R$${centro.toFixed(2)} — a marcação "hoje" no gráfico mostra onde a operação nasceu.`,
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          A história do seu dinheiro
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-[oklch(0.78_0.17_65)]" /> hoje
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-success" /> lucro máximo
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-loss" /> perda máxima
          </span>
        </div>
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer>
          <AreaChart data={curve}>
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.6} />
                <stop offset="50%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="preco" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12 }}
              formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Resultado"]}
              labelFormatter={(l) => `Preço: R$ ${l}`}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            <ReferenceLine
              x={centro}
              stroke="oklch(0.78 0.17 65)"
              strokeDasharray="4 4"
              label={{ value: "hoje", position: "top", fill: "oklch(0.78 0.17 65)", fontSize: 11 }}
            />
            {leitura.breakevens.map((b) => (
              <ReferenceLine
                key={b}
                x={b}
                stroke="rgba(255,255,255,0.35)"
                strokeDasharray="2 2"
                label={{
                  value: `BE ${b}`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "rgba(255,255,255,0.6)",
                }}
              />
            ))}
            {leitura.lucroLimitado && maxP.resultado > 0 && (
              <>
                <ReferenceLine
                  x={maxP.preco}
                  stroke="oklch(0.72 0.18 155)"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
                <ReferenceDot
                  x={maxP.preco}
                  y={maxP.resultado}
                  r={5}
                  fill="oklch(0.72 0.18 155)"
                  stroke="none"
                  label={{
                    value: "lucro máximo",
                    position: "top",
                    fill: "oklch(0.72 0.18 155)",
                    fontSize: 10,
                  }}
                />
              </>
            )}
            {minP.resultado < 0 && (
              <>
                <ReferenceLine
                  x={minP.preco}
                  stroke="oklch(0.63 0.24 27)"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
                <ReferenceDot
                  x={minP.preco}
                  y={minP.resultado}
                  r={5}
                  fill="oklch(0.63 0.24 27)"
                  stroke="none"
                  label={{
                    value: "perda máxima",
                    position: "bottom",
                    fill: "oklch(0.63 0.24 27)",
                    fontSize: 10,
                  }}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="resultado"
              stroke="oklch(0.72 0.18 155)"
              fill="url(#pg)"
              baseValue={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-2.5">
        {captions.map((c, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${
                c.tom === "bom"
                  ? "bg-success"
                  : c.tom === "ruim"
                    ? "bg-loss"
                    : "bg-muted-foreground"
              }`}
            />
            <span className="text-muted-foreground">{c.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardDozeAnos({
  analogia,
  objetivo,
  licaoSlug,
}: {
  analogia: string;
  objetivo: string;
  licaoSlug?: string;
}) {
  const funciona =
    objetivo === "baixa"
      ? "Se o preço cair na direção que você espera antes do vencimento."
      : objetivo === "lateralizacao"
        ? "Se o preço ficar dentro do corredor até o vencimento."
        : objetivo === "renda"
          ? "Se o preço não andar contra você."
          : objetivo === "protecao"
            ? "Se o preço cair, a sua proteção entra em ação."
            : "Se o preço subir na direção que você espera antes do vencimento.";
  const falha =
    objetivo === "baixa"
      ? "Se o preço subir ou ficar parado, a estrutura perde valor aos poucos."
      : objetivo === "lateralizacao"
        ? "Se o preço sair do corredor com força, a perda chega ao limite conhecido."
        : objetivo === "renda"
          ? "Se o preço atravessar o strike vendido."
          : objetivo === "protecao"
            ? "Se o preço subir muito, você abre mão de parte da alta."
            : "Se o preço ficar parado ou cair, a estrutura perde valor aos poucos.";
  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <BookOpen size={14} /> Explique como se eu tivesse 12 anos
      </div>
      <p className="mt-4 text-xl leading-relaxed md:text-2xl">{analogia}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-success">
            Quando funciona
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{funciona}</p>
        </div>
        <div className="rounded-xl border border-loss/30 bg-loss/5 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-loss">
            Quando falha
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{falha}</p>
        </div>
      </div>
      {licaoSlug && (
        <Link
          to="/licao/$slug"
          params={{ slug: licaoSlug }}
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Ver a lição correspondente na trilha →
        </Link>
      )}
    </div>
  );
}

function TeseCampo({
  prefixo,
  value,
  onChange,
}: {
  prefixo: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <label className="block text-sm">
        <span className="text-muted-foreground">{prefixo}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="complete a frase..."
          className="ml-2 w-[calc(100%-4rem)] border-b border-dashed border-border bg-transparent py-1 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
      </label>
    </div>
  );
}

function DetalhesTecnicos({
  aberto,
  onToggle,
  pernas,
  ativo,
  centro,
  preset,
  onPreset,
  onAtivo,
  onCentro,
  onPernas,
  updatePerna,
  pedemConfirmacao,
  confirmacoes,
  setConfirmacoes,
  alertas,
}: {
  aberto: boolean;
  onToggle: () => void;
  pernas: Perna[];
  ativo: string;
  centro: number;
  preset: string;
  onPreset: (p: string) => void;
  onAtivo: (v: string) => void;
  onCentro: (v: number) => void;
  onPernas: (p: Perna[]) => void;
  updatePerna: (i: number, patch: Partial<Perna>) => void;
  pedemConfirmacao: { id: string; nome?: string | null; texto: string }[];
  confirmacoes: Record<string, boolean>;
  setConfirmacoes: (r: Record<string, boolean>) => void;
  alertas: { regra: string; severidade: string; motivo: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 p-5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Settings2 size={15} className="text-muted-foreground" />
          Detalhes técnicos <span className="text-muted-foreground">(opcional)</span>
        </span>
        {aberto ? (
          <ChevronUp size={15} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground" />
        )}
      </button>
      {aberto && (
        <div className="space-y-4 border-t border-border p-5">
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((k) => (
              <button
                key={k}
                onClick={() => onPreset(k)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  preset === k
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {PRESET_LABEL[k]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted-foreground">
              Ativo
              <input
                value={ativo}
                onChange={(e) => onAtivo(e.target.value.toUpperCase())}
                className="ml-2 w-24 rounded-md border border-border bg-input px-2 py-1 text-sm font-mono"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Preço atual
              <input
                type="number"
                step="0.1"
                value={centro}
                onChange={(e) => onCentro(+e.target.value || 0)}
                className="ml-2 w-24 rounded-md border border-border bg-input px-2 py-1 text-sm font-mono"
              />
            </label>
          </div>

          <div className="space-y-3">
            {pernas.map((p, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs uppercase text-muted-foreground">Perna {i + 1}</div>
                  <button onClick={() => onPernas(pernas.filter((_, j) => j !== i))}>
                    <Trash2 size={14} className="text-muted-foreground hover:text-loss" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    value={p.acao}
                    onChange={(e) => updatePerna(i, { acao: e.target.value as Perna["acao"] })}
                    className="rounded border border-border bg-input px-2 py-1"
                  >
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                  </select>
                  <select
                    value={p.tipo}
                    onChange={(e) => updatePerna(i, { tipo: e.target.value as Perna["tipo"] })}
                    className="rounded border border-border bg-input px-2 py-1"
                  >
                    <option value="call">Call</option>
                    <option value="put">Put</option>
                  </select>
                  <label>
                    Strike
                    <input
                      type="number"
                      step="0.5"
                      value={p.strike}
                      onChange={(e) => updatePerna(i, { strike: +e.target.value || 0 })}
                      className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                    />
                  </label>
                  <label>
                    Prêmio
                    <input
                      type="number"
                      step="0.05"
                      value={p.premio}
                      onChange={(e) => updatePerna(i, { premio: +e.target.value || 0 })}
                      className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                    />
                  </label>
                  <label className="col-span-2">
                    Qtd
                    <input
                      type="number"
                      step="100"
                      value={p.quantidade}
                      onChange={(e) => updatePerna(i, { quantidade: +e.target.value || 0 })}
                      className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                pernas.length < 4 &&
                onPernas([
                  ...pernas,
                  { tipo: "call", acao: "compra", strike: centro, premio: 1, quantidade: 100 },
                ])
              }
              disabled={pernas.length >= 4}
              className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-accent disabled:opacity-40"
            >
              <Plus size={14} /> Nova perna ({pernas.length}/4)
            </button>
          </div>

          {pedemConfirmacao.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase text-muted-foreground">
                Confirmações técnicas das suas regras
              </div>
              <div className="mt-2 space-y-2">
                {pedemConfirmacao.map((r) => (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-start gap-2 text-sm leading-snug"
                  >
                    <input
                      type="checkbox"
                      checked={!!confirmacoes[r.id]}
                      onChange={(e) =>
                        setConfirmacoes({ ...confirmacoes, [r.id]: e.target.checked })
                      }
                      className="mt-0.5 accent-[oklch(0.78_0.17_65)]"
                    />
                    <span
                      className={confirmacoes[r.id] ? "text-foreground" : "text-muted-foreground"}
                    >
                      {r.nome ? `${r.nome} — ` : ""}
                      {r.texto}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {alertas.length > 0 && (
            <div className="rounded-lg border border-loss/40 bg-loss/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-loss">
                <AlertTriangle size={15} /> Atenção às suas regras
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {alertas.map((a, i) => (
                  <li key={i}>
                    <div className="italic">
                      “{a.regra}”
                      {a.severidade === "critico" && (
                        <span className="ml-2 rounded bg-loss/20 px-1.5 py-0.5 text-[10px] uppercase not-italic text-loss">
                          crítico
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.motivo}</div>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                O copilot não decide por você — mas registra que você foi avisado.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CopilotPanel({
  pernas,
  ativo,
  leitura,
  onAbrir,
}: {
  pernas: Perna[];
  ativo: string;
  leitura: ReturnType<typeof interpretar>;
  onAbrir: () => void;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const perguntas: { k: string; q: string; a: string }[] = [
    {
      k: "porque-perna",
      q: "Por que existe uma segunda perna nesta operação?",
      a:
        pernas.length >= 2
          ? `A perna vendida funciona como um "desconto": outra pessoa te paga por ela. Com isso você paga menos pela proteção — mas em troca abre mão de parte do lucro. É a troca que torna a operação mais barata e o risco travado.`
          : `Aqui usamos só uma perna: você paga o prêmio inteiro e fica com o potencial completo do movimento. Não há segunda perna para baratear — nem para limitar o lucro.`,
    },
    {
      k: "breakeven",
      q: "O que significa breakeven?",
      a: leitura.breakevens.length
        ? `É o preço em que você empata: nem ganha, nem perde. Se ${ativo} terminar em R$${leitura.breakevens[0].toFixed(2)} no vencimento, você recebe exatamente o que pagou. Acima disso, começa a ganhar; abaixo, começa a perder.`
        : "Esta estrutura não tem um ponto exato de equilíbrio — acompanhe o gráfico para ver onde o resultado vira positivo.",
    },
    {
      k: "parada",
      q: `O que acontece se ${ativo} ficar parada?`,
      a: `Se o preço não se mexer até o vencimento, as opções compradas perdem valor com o tempo. Na nossa estrutura, isso está contado no risco máximo que você aceitou: o pior cenário já está precificado ali em cima.`,
    },
    {
      k: "risco",
      q: "Qual é exatamente o meu risco máximo?",
      a: `Seu risco máximo nesta estrutura é de ${brl(leitura.capitalEmRisco)} — é o teto da perda, conhecido antes de você entrar. Nada na bolsa pode fazer esse número subir, salvo mexer na operação no meio do caminho.`,
    },
    {
      k: "lucro",
      q: `Onde eu ganho dinheiro?`,
      a: leitura.lucroLimitado
        ? `Você ganha se ${ativo} andar na direção que você acredita e passar do ponto de equilíbrio. O ganho é limitado e conhecido — depois dele, a perna vendida segura o resto (foi isso que barateou a operação).`
        : `Você ganha se ${ativo} andar na direção que você acredita. Como não há perna vendida limitando, o ganho não tem teto — quanto mais longe o preço for, mais você ganha.`,
    },
  ];
  return (
    <aside className="lg:sticky lg:top-24 h-fit space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <HelpCircle size={14} /> Copilot — seu mentor
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Eu não escolho por você. Só explico, na hora, o que cada coisa significa nesta operação.
        </p>
        <div className="mt-4 space-y-2">
          {perguntas.map((p) => (
            <div key={p.k} className="rounded-xl border border-border bg-card">
              <button
                onClick={() => setAberto(aberto === p.k ? null : p.k)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm"
              >
                <MessageCircle size={14} className="mt-0.5 shrink-0 text-primary" />
                <span className="flex-1 leading-snug">{p.q}</span>
                {aberto === p.k ? (
                  <ChevronUp size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {aberto === p.k && (
                <p className="border-t border-border px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
                  {p.a}
                </p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onAbrir}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs hover:bg-accent"
        >
          <MessageCircle size={13} /> Abrir conversa completa no Copilot
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest">
          <Wallet size={14} /> Lembrete
        </div>
        <p className="mt-2">
          O resultado já está decidido antes de você apertar o botão. A bolsa só entrega o gráfico
          que você já viu aqui.
        </p>
      </div>
    </aside>
  );
}
