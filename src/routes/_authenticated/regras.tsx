import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import {
  STRUCTURED_TEMPLATES,
  type IndicadorNome,
  type TimeframeUnidade,
} from "@/lib/rule-templates";

export const Route = createFileRoute("/_authenticated/regras")({
  head: () => ({ meta: [{ title: "Regras · Zero ao Trade" }] }),
  component: Regras,
});

const CATEGORIAS = ["risco", "tempo", "rolagem", "disciplina", "trava", "geral"];
const INDICADORES: IndicadorNome[] = ["Média Móvel", "VWAP", "RSI", "outro"];
const TIMEFRAMES: TimeframeUnidade[] = ["minutos", "horas", "diário"];

type RuleRow = {
  id: string;
  ativa: boolean;
  categoria: string;
  texto: string;
  tipo?: string | null;
  nome?: string | null;
  parametros_json?: Record<string, unknown> | null;
};

type Tab = "texto" | "indicador_tecnico" | "padrao_barras";

function Regras() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("personal_rules")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as unknown as RuleRow[]) ?? [];
    },
  });

  const [tab, setTab] = useState<Tab>("texto");

  // texto livre
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("risco");

  // indicador
  const [indNome, setIndNome] = useState("");
  const [indIndicador, setIndIndicador] = useState<IndicadorNome>("Média Móvel");
  const [indPeriodo, setIndPeriodo] = useState<number | "">(200);
  const [indTimeframe, setIndTimeframe] = useState<TimeframeUnidade>("diário");
  const [indCategoria, setIndCategoria] = useState("tendência longo prazo");

  // padrão barras
  const [padNome, setPadNome] = useState("");
  const [padCondicao, setPadCondicao] = useState("");
  const [padDescricao, setPadDescricao] = useState("");
  const [padCategoria, setPadCategoria] = useState("confirmação de direção");

  async function currentUserId() {
    const { data: u } = await supabase.auth.getUser();
    return u.user?.id ?? null;
  }

  async function addTexto() {
    if (!texto.trim()) return;
    const uid = await currentUserId();
    if (!uid) return;
    const payload = {
      user_id: uid,
      texto: texto.trim(),
      categoria,
      tipo: "texto",
    };
    const { error } = await supabase.from("personal_rules").insert(payload as never);
    if (error) return toast.error(error.message);
    setTexto("");
    invalidate();
    toast.success("Regra adicionada!");
  }

  async function addIndicador() {
    const nome = indNome.trim() || defaultIndicadorName();
    if (!nome) return;
    const uid = await currentUserId();
    if (!uid) return;
    const isMM = indIndicador === "Média Móvel";
    const parametros_json: Record<string, unknown> = { indicador: indIndicador };
    if (isMM) {
      parametros_json.periodo = Number(indPeriodo) || 0;
      parametros_json.timeframe = indTimeframe;
    }
    const payload = {
      user_id: uid,
      tipo: "indicador_tecnico",
      nome,
      categoria: indCategoria || "geral",
      texto: describeIndicador(nome, parametros_json),
      parametros_json,
    };
    const { error } = await supabase.from("personal_rules").insert(payload as never);
    if (error) return toast.error(error.message);
    setIndNome("");
    invalidate();
    toast.success("Indicador salvo!");
  }

  function defaultIndicadorName() {
    if (indIndicador === "Média Móvel") return `Média Móvel ${indPeriodo}`;
    return indIndicador;
  }

  async function addPadrao() {
    if (!padCondicao.trim()) return;
    const uid = await currentUserId();
    if (!uid) return;
    const parametros_json = {
      condicao: padCondicao.trim(),
      descricao: padDescricao.trim() || undefined,
    };
    const payload = {
      user_id: uid,
      tipo: "padrao_barras",
      nome: padNome.trim() || padCondicao.trim().slice(0, 60),
      categoria: padCategoria || "geral",
      texto: padDescricao.trim() || padCondicao.trim(),
      parametros_json,
    };
    const { error } = await supabase.from("personal_rules").insert(payload as never);
    if (error) return toast.error(error.message);
    setPadNome("");
    setPadCondicao("");
    setPadDescricao("");
    invalidate();
    toast.success("Padrão salvo!");
  }

  async function seedStructured() {
    const uid = await currentUserId();
    if (!uid) return;
    const rows = STRUCTURED_TEMPLATES.map((t) => ({
      user_id: uid,
      tipo: t.tipo,
      nome: t.nome,
      categoria: t.categoria,
      texto:
        t.tipo === "indicador_tecnico"
          ? describeIndicador(t.nome, t.parametros as unknown as Record<string, unknown>)
          : (t.parametros.descricao ?? t.parametros.condicao),
      parametros_json: t.parametros as unknown as Record<string, unknown>,
    }));
    const { error } = await supabase.from("personal_rules").insert(rows as never);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success("Exemplos adicionados!");
  }

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["rules"] });
    qc.invalidateQueries({ queryKey: ["rules-count"] });
  }

  async function toggle(id: string, ativa: boolean) {
    await supabase.from("personal_rules").update({ ativa: !ativa }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["rules"] });
  }
  async function remove(id: string) {
    await supabase.from("personal_rules").delete().eq("id", id);
    invalidate();
  }

  const rules = q.data ?? [];

  return (
    <AppShell title="Minhas regras">
      <p className="mb-6 text-sm text-muted-foreground">
        Suas regras são <span className="text-primary">suas</span>. O copilot vai lembrar delas
        quando você registrar uma decisão — nunca decidir por você.
      </p>

      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase text-muted-foreground">Nova regra</div>
          <button
            onClick={seedStructured}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            title="Popular com indicadores e padrões de exemplo"
          >
            <Sparkles size={12} /> Adicionar exemplos
          </button>
        </div>

        <div className="mb-3 flex gap-1 border-b border-border">
          {(
            [
              ["texto", "Texto livre"],
              ["indicador_tecnico", "Indicador técnico"],
              ["padrao_barras", "Padrão de barras"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-sm border-b-2 -mb-px ${
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "texto" && (
          <>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ex: Nunca aloco mais que 2% em uma estrutura."
              maxLength={280}
              rows={2}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            />
            <div className="mt-2 flex gap-2">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={addTexto}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </>
        )}

        {tab === "indicador_tecnico" && (
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">
                Indicador
                <select
                  value={indIndicador}
                  onChange={(e) => setIndIndicador(e.target.value as IndicadorNome)}
                  className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                >
                  {INDICADORES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-muted-foreground">
                Nome amigável (opcional)
                <input
                  value={indNome}
                  onChange={(e) => setIndNome(e.target.value)}
                  placeholder={defaultIndicadorName()}
                  className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                />
              </label>
            </div>
            {indIndicador === "Média Móvel" && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  Período
                  <input
                    type="number"
                    min={1}
                    value={indPeriodo}
                    onChange={(e) =>
                      setIndPeriodo(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Timeframe
                  <select
                    value={indTimeframe}
                    onChange={(e) => setIndTimeframe(e.target.value as TimeframeUnidade)}
                    className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                  >
                    {TIMEFRAMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <label className="text-xs text-muted-foreground">
              Categoria
              <input
                value={indCategoria}
                onChange={(e) => setIndCategoria(e.target.value)}
                placeholder="tendência longo prazo"
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
            </label>
            <button
              onClick={addIndicador}
              className="mt-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={14} /> Salvar indicador
            </button>
          </div>
        )}

        {tab === "padrao_barras" && (
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">
              Nome (opcional)
              <input
                value={padNome}
                onChange={(e) => setPadNome(e.target.value)}
                placeholder="Ex: Verde com verde"
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Condição
              <input
                value={padCondicao}
                onChange={(e) => setPadCondicao(e.target.value)}
                placeholder="Ex: volume da 2ª barra menor que da 1ª"
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Descrição (opcional)
              <textarea
                value={padDescricao}
                onChange={(e) => setPadDescricao(e.target.value)}
                rows={2}
                placeholder="Quando/como você usa esse padrão"
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Categoria
              <input
                value={padCategoria}
                onChange={(e) => setPadCategoria(e.target.value)}
                placeholder="confirmação de direção"
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
            </label>
            <button
              onClick={addPadrao}
              className="mt-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={14} /> Salvar padrão
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {rules.map((r) => (
          <div
            key={r.id}
            className={`flex items-start gap-3 rounded-md border p-4 ${
              r.ativa ? "border-border bg-card" : "border-border bg-card/40 opacity-60"
            }`}
          >
            <input
              type="checkbox"
              checked={r.ativa}
              onChange={() => toggle(r.id, r.ativa)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase text-primary">{r.categoria}</span>
                {r.tipo && r.tipo !== "texto" && (
                  <span className="rounded bg-secondary/30 px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    {r.tipo === "indicador_tecnico" ? "indicador" : "padrão"}
                  </span>
                )}
              </div>
              {r.nome && <div className="text-sm font-semibold mt-0.5">{r.nome}</div>}
              <div className="text-sm mt-0.5">{r.texto}</div>
              {r.parametros_json && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatParams(r.tipo, r.parametros_json)}
                </div>
              )}
            </div>
            <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-loss">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma regra ainda. Escreva a primeira acima.
          </div>
        )}
      </div>
    </AppShell>
  );
}

function describeIndicador(nome: string, params: Record<string, unknown>) {
  const parts: string[] = [nome];
  if (params.periodo) parts.push(`período ${params.periodo}`);
  if (params.timeframe) parts.push(`${params.timeframe}`);
  return parts.join(" · ");
}

function formatParams(tipo: string | null | undefined, p: Record<string, unknown>) {
  if (tipo === "indicador_tecnico") {
    const bits: string[] = [];
    if (p.indicador) bits.push(String(p.indicador));
    if (p.periodo) bits.push(`período ${p.periodo}`);
    if (p.timeframe) bits.push(`tf ${p.timeframe}`);
    return bits.join(" · ");
  }
  if (tipo === "padrao_barras") {
    return `condição: ${String(p.condicao ?? "")}`;
  }
  return null;
}
