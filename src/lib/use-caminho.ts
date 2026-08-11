import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { padronizarCaminho, type Caminho } from "@/lib/caminho";

export function useCaminho() {
  const q = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .maybeSingle();
      return data;
    },
  });
  return {
    caminho: padronizarCaminho(q.data?.caminho),
    perfil: q.data,
    carregando: q.isLoading,
  };
}

export async function definirCaminho(caminho: Caminho): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  const { data: atualizados, error } = await supabase
    .from("profiles")
    .update({ caminho })
    .eq("id", user.user.id)
    .select("id");
  if (error || !atualizados || atualizados.length === 0) return false;
  return true;
}

export function useAtualizarCaminho() {
  const qc = useQueryClient();
  return async (caminho: Caminho) => {
    const ok = await definirCaminho(caminho);
    if (ok) qc.invalidateQueries({ queryKey: ["profile"] });
    return ok;
  };
}
