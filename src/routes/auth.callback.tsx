import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Entrando… · Zero ao Trade" },
      { name: "description", content: "Concluindo seu acesso ao Zero ao Trade." },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const token = hash.get("access_token");
      const refresh = hash.get("refresh_token");
      const code = query.get("code");
      const error = hash.get("error") ?? query.get("error");

      const limparUrl = () => window.history.replaceState({}, "", "/auth/callback");

      try {
        if (error) {
          throw new Error("Login cancelado ou não autorizado. Tente de novo.");
        }
        if (token && refresh) {
          await supabase.auth.setSession({ access_token: token, refresh_token: refresh });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error("Nenhum código de acesso encontrado na URL.");
        }
        limparUrl();
        navigate({ to: "/home", replace: true });
      } catch (e) {
        limparUrl();
        setErro(e instanceof Error ? e.message : "Não foi possível concluir o login.");
      }
    })();
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-sm text-center">
        {erro ? (
          <>
            <h1 className="text-lg font-bold">Não foi possível entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">{erro}</p>
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Tentar de novo
            </Link>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Entrando…</div>
        )}
      </div>
    </div>
  );
}
