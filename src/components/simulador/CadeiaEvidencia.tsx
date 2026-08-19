import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Flag,
  Lightbulb,
  Plus,
  Scale,
  ShieldAlert,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { CamadaEvidencia, RepresentacaoMercado } from "@/lib/market-reading";
import {
  construirCadeiaEvidencia,
  DECISAO_LABELS,
  DECISOES_CADEIA,
  ETAPAS_CADEIA,
  type CadeiaEvidencia,
  type DecisaoDaCadeia,
  type ValidacaoCadeia,
} from "@/lib/cadeia-evidencia";

/**
 * Cadeia de Evidência — o registro do processo cognitivo que produziu a
 * decisão. Formulário conversacional (mesma linguagem da NarrativaEstrutura,
 * sem tela nova) e visão read-only para o replay. A evidência descreve o que
 * sustenta; a decisão é da pessoa, na etapa `decisao`.
 */

const CAMADAS: { k: CamadaEvidencia; rotulo: string }[] = [
  { k: "tecnico", rotulo: "Técnico" },
  { k: "fundamentalista", rotulo: "Fundamentalista" },
  { k: "derivativos", rotulo: "Derivativos" },
];

type Linha = { camada: CamadaEvidencia; descricao: string };

type EstadoCadeia = {
  representacao: RepresentacaoMercado;
  observacao: string;
  interpretacao: string;
  hipotese: string;
  evidencias: Linha[];
  contraEvidencias: Linha[];
  regra: string;
  risco: string;
  decisao: DecisaoDaCadeia | null;
};

const VAZIO: EstadoCadeia = {
  representacao: "candle",
  observacao: "",
  interpretacao: "",
  hipotese: "",
  evidencias: [],
  contraEvidencias: [],
  regra: "",
  risco: "",
  decisao: null,
};

const PASSO_CLASSE = "rounded-xl border border-border bg-background p-4";
const PASSO_TITULO = "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";

function campo(rotulo: string, value: string, onChange: (v: string) => void) {
  return (
    <div className={PASSO_CLASSE}>
      <div className={PASSO_TITULO}>{rotulo}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="escreva o que aconteceu — sem conclusões, sem ordens"
        className="mt-2 w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none"
      />
    </div>
  );
}

function LinhasEvidencia({
  rotulo,
  itens,
  problemas,
  onChange,
}: {
  rotulo: string;
  itens: Linha[];
  problemas: { indice?: number; motivo: string }[];
  onChange: (itens: Linha[]) => void;
}) {
  return (
    <div className={PASSO_CLASSE}>
      <div className={PASSO_TITULO}>{rotulo}</div>
      <div className="mt-2 space-y-2">
        {itens.map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <select
                value={item.camada}
                onChange={(e) =>
                  onChange(
                    itens.map((x, j) =>
                      j === i ? { ...x, camada: e.target.value as CamadaEvidencia } : x,
                    ),
                  )
                }
                className="rounded border border-border bg-input px-2 py-1 text-xs"
              >
                {CAMADAS.map((c) => (
                  <option key={c.k} value={c.k}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onChange(itens.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-loss"
                aria-label="Remover evidência"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={item.descricao}
              onChange={(e) =>
                onChange(itens.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)))
              }
              rows={2}
              placeholder="ex.: VWAP: preço acima da VWAP. Preço acima do VWAP é força relativa recente — uma observação, não uma ordem."
              className="mt-2 w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none"
            />
            {problemas
              .filter((p) => p.indice === i)
              .map((p, pi) => (
                <p
                  key={pi}
                  className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-loss"
                >
                  <TriangleAlert size={12} className="mt-0.5 shrink-0" />
                  {p.motivo}
                </p>
              ))}
          </div>
        ))}
        <button
          onClick={() => onChange([...itens, { camada: "tecnico", descricao: "" }])}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-accent"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>
    </div>
  );
}

export function CadeiaEvidenciaForm({
  hipoteseInicial,
  onChange,
}: {
  hipoteseInicial?: string;
  onChange: (cadeia: CadeiaEvidencia | null, iniciada: boolean) => void;
}) {
  const [estado, setEstado] = useState<EstadoCadeia>(() =>
    hipoteseInicial ? { ...VAZIO, hipotese: hipoteseInicial } : VAZIO,
  );
  const [aberto, setAberto] = useState(true);

  const iniciada = useMemo(() => {
    const textos = [
      estado.observacao,
      estado.interpretacao,
      estado.hipotese,
      estado.regra,
      estado.risco,
    ];
    return (
      textos.some((t) => t.trim().length > 0) ||
      estado.evidencias.some((e) => e.descricao.trim()) ||
      estado.contraEvidencias.some((e) => e.descricao.trim()) ||
      estado.decisao !== null
    );
  }, [estado]);

  const construida = useMemo<{
    cadeia: CadeiaEvidencia | null;
    validacao: ValidacaoCadeia | null;
  }>(() => {
    if (!iniciada) return { cadeia: null, validacao: null };
    const entrada: CadeiaEvidencia = {
      representacao: estado.representacao,
      observacao: estado.observacao,
      interpretacao: estado.interpretacao,
      hipotese: estado.hipotese,
      evidencias: estado.evidencias.filter((e) => e.descricao.trim()),
      contraEvidencias: estado.contraEvidencias.filter((e) => e.descricao.trim()),
      regra: estado.regra,
      risco: estado.risco,
      decisao: estado.decisao ?? "observar",
    };
    const resultado = construirCadeiaEvidencia(entrada);
    return { cadeia: resultado.cadeia, validacao: resultado.validacao };
  }, [estado, iniciada]);

  useEffect(() => {
    onChange(iniciada && construida.validacao?.ok ? construida.cadeia : null, iniciada);
  }, [iniciada, construida, onChange]);

  function limpar() {
    setEstado(VAZIO);
    onChange(null, false);
  }

  const problemas = construida.validacao?.problemas ?? [];
  const problemasDe = (campo: string) => problemas.filter((p) => p.campo === campo);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between gap-3 p-6 text-left md:p-8"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Scale size={14} className="text-primary" /> Cadeia de evidência
        </div>
        <div className="flex items-center gap-2">
          {iniciada && construida.validacao?.ok ? (
            <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-semibold text-success">
              <Check size={11} /> completa
            </span>
          ) : (
            iniciada && (
              <span className="rounded-full bg-loss/15 px-2.5 py-1 text-[10px] font-semibold text-loss">
                incompleta
              </span>
            )
          )}
          {aberto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>
      {aberto && (
        <div className="space-y-4 border-t border-border p-6 pt-5 md:p-8 md:pt-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            O registro de <span className="text-foreground">como você chegou a esta decisão</span>:
            da representação que você escolheu até a decisão que você toma. Uma evidência descreve o
            que sustenta — nunca vira recomendação.
          </p>

          <div className={PASSO_CLASSE}>
            <div className={PASSO_TITULO}>{ETAPAS_CADEIA[0].pergunta}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(["candle", "renko"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setEstado((e) => ({ ...e, representacao: r }))}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    estado.representacao === r
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {r === "candle" ? "Candle" : "Renko"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              {estado.representacao === "renko"
                ? "Renko filtra tempo e ruído: a sequência de blocos é observação, não previsão."
                : "Candle mostra abertura, fechamento, máxima e mínima do período."}
            </p>
          </div>

          {campo(ETAPAS_CADEIA[1].pergunta, estado.observacao, (v) =>
            setEstado((e) => ({ ...e, observacao: v })),
          )}
          {campo(ETAPAS_CADEIA[2].pergunta, estado.interpretacao, (v) =>
            setEstado((e) => ({ ...e, interpretacao: v })),
          )}
          {campo(ETAPAS_CADEIA[3].pergunta, estado.hipotese, (v) =>
            setEstado((e) => ({ ...e, hipotese: v })),
          )}

          <LinhasEvidencia
            rotulo={ETAPAS_CADEIA[4].pergunta}
            itens={estado.evidencias}
            problemas={problemasDe("evidencias")}
            onChange={(evidencias) => setEstado((e) => ({ ...e, evidencias }))}
          />
          <LinhasEvidencia
            rotulo={ETAPAS_CADEIA[5].pergunta}
            itens={estado.contraEvidencias}
            problemas={problemasDe("contraEvidencias")}
            onChange={(contraEvidencias) => setEstado((e) => ({ ...e, contraEvidencias }))}
          />

          {campo(ETAPAS_CADEIA[6].pergunta, estado.regra, (v) =>
            setEstado((e) => ({ ...e, regra: v })),
          )}
          {campo(ETAPAS_CADEIA[7].pergunta, estado.risco, (v) =>
            setEstado((e) => ({ ...e, risco: v })),
          )}

          <div className={PASSO_CLASSE}>
            <div className={PASSO_TITULO}>{ETAPAS_CADEIA[8].pergunta}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DECISOES_CADEIA.map((d) => (
                <button
                  key={d}
                  onClick={() => setEstado((e) => ({ ...e, decisao: d }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    estado.decisao === d
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {DECISAO_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
            {iniciada && construida.validacao?.ok ? (
              <>
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-success">
                    Cadeia de evidência completa
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Ela será registrada no snapshot cognitivo desta decisão.
                  </p>
                </div>
              </>
            ) : iniciada ? (
              <>
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-loss" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-loss">
                    A cadeia ainda não está coerente
                  </div>
                  <ul className="mt-1 space-y-1 text-xs leading-relaxed text-muted-foreground">
                    {problemas.map((p, i) => (
                      <li key={i}>• {p.motivo}</li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Complete-a — ou limpe-a, e a decisão será registrada sem cadeia (como as
                    antigas).
                  </p>
                </div>
              </>
            ) : (
              <>
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Opcional — e honesta</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Registrar a cadeia é opcional: sem ela, a decisão segue como as antigas. Se você
                    começar, ela precisa terminar coerente.
                  </p>
                </div>
              </>
            )}
            <button
              onClick={limpar}
              className="shrink-0 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PassoVisao({ rotulo, texto }: { rotulo: string; texto: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </div>
      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{texto}</p>
    </div>
  );
}

export function CadeiaEvidenciaVisao({ cadeia }: { cadeia: CadeiaEvidencia }) {
  const tomDecisao =
    cadeia.decisao === "seguir"
      ? "bg-success/15 text-success"
      : cadeia.decisao === "nao-seguir"
        ? "bg-loss/15 text-loss"
        : "bg-primary/20 text-primary";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye size={12} /> Representação
        </span>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium">
          {cadeia.representacao === "renko" ? "Renko" : "Candle"}
        </span>
      </div>
      <PassoVisao rotulo="Observação" texto={cadeia.observacao} />
      <PassoVisao rotulo="Interpretação" texto={cadeia.interpretacao} />
      <PassoVisao rotulo="Hipótese" texto={cadeia.hipotese} />
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          O que sustentava
        </div>
        {cadeia.evidencias.length === 0 ? (
          <p className="mt-0.5 text-xs italic text-muted-foreground">nada foi listado</p>
        ) : (
          <ul className="mt-1 space-y-1.5">
            {cadeia.evidencias.map((e, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                <span className="mr-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                  {e.camada === "tecnico"
                    ? "técnico"
                    : e.camada === "fundamentalista"
                      ? "fundamentalista"
                      : "derivativos"}
                </span>
                {e.descricao}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          O que contradizia
        </div>
        {cadeia.contraEvidencias.length === 0 ? (
          <p className="mt-0.5 text-xs italic text-muted-foreground">nada foi listado</p>
        ) : (
          <ul className="mt-1 space-y-1.5">
            {cadeia.contraEvidencias.map((e, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                {e.descricao}
              </li>
            ))}
          </ul>
        )}
      </div>
      <PassoVisao rotulo="Regra" texto={cadeia.regra} />
      <PassoVisao rotulo="Risco" texto={cadeia.risco} />
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Flag size={12} /> Decisão
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tomDecisao}`}>
          {DECISAO_LABELS[cadeia.decisao]}
        </span>
      </div>
    </div>
  );
}
