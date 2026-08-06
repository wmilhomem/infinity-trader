import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";

export const FLOW_OPERAR_KEY = "flow-operar";

export type FluxoRetomada = {
  tese: string;
  regraId: string | null;
  regraTexto: string | null;
};

type Tela = "hipotese" | "regra" | "resumo" | "parou" | "parou-hoje";

export function FluxoOperarModal({
  aberto,
  rules,
  telaInicial = "hipotese",
  retomada,
  onClose,
}: {
  aberto: boolean;
  rules: { id: string; texto: string }[];
  telaInicial?: "hipotese" | "resumo" | "parou-hoje";
  retomada?: FluxoRetomada;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [tela, setTela] = useState<Tela>(telaInicial);
  const [tese, setTese] = useState("");
  const [regraId, setRegraId] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<"permite" | "nao" | null>(null);

  useEffect(() => {
    if (aberto) {
      if (telaInicial === "parou-hoje") {
        setTela("parou-hoje");
      } else if (telaInicial === "resumo" && retomada) {
        setTela("resumo");
        setTese(retomada.tese);
        setRegraId(retomada.regraId);
      } else {
        setTela("hipotese");
        setTese("");
        setRegraId(null);
        setEscolha(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, telaInicial]);

  if (!aberto) return null;

  const regraEscolhida = rules.find((r) => r.id === regraId) ?? null;
  const regraTexto = regraEscolhida?.texto ?? retomada?.regraTexto ?? null;

  function fechar() {
    onClose();
  }

  function abrirSimulador() {
    try {
      sessionStorage.setItem(
        FLOW_OPERAR_KEY,
        JSON.stringify({ tese, regraId: regraId ?? null, regraTexto }),
      );
    } catch {
      /* storage indisponível — o fluxo simplesmente não retoma */
    }
    onClose();
    navigate({ to: "/simulador" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">
            {tela === "hipotese" && "Fluxo contínuo · sua hipótese"}
            {tela === "regra" && "Fluxo contínuo · sua regra"}
            {tela === "resumo" && "Fluxo contínuo · resumo"}
            {tela === "parou" && "Fluxo contínuo"}
            {tela === "parou-hoje" && "Fluxo contínuo"}
          </div>
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {tela === "hipotese" && (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
              O que chamou sua atenção?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Descreva o que você vê no mercado. A estrutura vem depois — primeiro o “por quê”.
            </p>
            <textarea
              value={tese}
              onChange={(e) => setTese(e.target.value)}
              rows={4}
              placeholder="Ex.: PETR4 segurou o suporte dos R$ 38 e o IV caiu junto."
              className="mt-5 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-primary"
              autoFocus
            />
            <div className="mt-2 text-right text-[11px] text-muted-foreground">
              {tese.trim().length} caracteres · mínimo 10 para seguir
            </div>
            <button
              onClick={() => setTela("regra")}
              disabled={tese.trim().length < 10}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              Continuar
            </button>
          </>
        )}

        {tela === "regra" && (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
              Sua regra permite?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tese.trim().length >= 10 && (
                <span className="mb-2 block rounded-lg border border-border bg-background px-4 py-3 italic">
                  “{tese.trim()}”
                </span>
              )}
              Qual das suas regras se aplica a esta operação?
            </p>
            <div className="mt-4 space-y-2">
              {rules.length === 0 ? (
                <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  Você ainda não tem regras escritas — e sem regra não dá para saber se essa
                  operação é sua ou é do impulso. Escreva a primeira antes de operar.
                </p>
              ) : (
                rules.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRegraId(r.id);
                      setEscolha(null);
                    }}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      regraId === r.id
                        ? "border-primary bg-primary/15 font-medium"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {r.texto}
                  </button>
                ))
              )}
            </div>

            {regraEscolhida && (
              <div className="mt-5 rounded-lg border border-border bg-background p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Esta operação respeita essa regra?
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEscolha("permite")}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      escolha === "permite"
                        ? "border-success bg-success/10 text-success"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    Permite
                  </button>
                  <button
                    onClick={() => setEscolha("nao")}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      escolha === "nao"
                        ? "border-loss bg-loss/10 text-loss"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    Não permite
                  </button>
                </div>
              </div>
            )}

            {rules.length === 0 ? (
              <button
                onClick={fechar}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Entendi
              </button>
            ) : (
              <button
                onClick={() => setTela(escolha === "nao" ? "parou" : "resumo")}
                disabled={!regraEscolhida || !escolha}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {escolha === "nao" ? "Seguir para a resposta" : "Continuar"}
              </button>
            )}
          </>
        )}

        {tela === "resumo" && (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">Vamos simular.</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Sua hipótese
                </div>
                <p className="mt-1.5 text-sm leading-relaxed italic">“{tese}”</p>
              </div>
              {regraTexto && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Regra que você vai honrar
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed">{regraTexto}</p>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              No simulador você monta a estrutura e vê o prejuízo máximo antes de decidir. Sua
              hipótese já entra preenchida.
            </p>
            <button
              onClick={abrirSimulador}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Abrir o simulador <ArrowRight size={16} />
            </button>
          </>
        )}

        {tela === "parou" && (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
              O fluxo para aqui.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Você acabou de se proteger: a sua regra pesou mais que o seu impulso. Quem para por
              causa de uma regra não está perdendo oportunidade — está evitando a ruína. Sem
              obrigação de operar hoje.
            </p>
            <button
              onClick={fechar}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Entendi
            </button>
          </>
        )}

        {tela === "parou-hoje" && (
          <>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
              Tudo bem não operar.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Não operar também é uma decisão — e das boas. O mercado continua aqui amanhã. Quando
              quiser, é só voltar e dizer: “hoje eu penso em operar”.
            </p>
            <button
              onClick={fechar}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
