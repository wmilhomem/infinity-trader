import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { padronizarFoco, type FocoFuturos } from "@/lib/foco";

export function useFoco() {
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
    foco: padronizarFoco(q.data?.foco_futuros),
    perfil: q.data,
    carregando: q.isLoading,
  };
}

export async function definirFoco(foco: FocoFuturos): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  const { error } = await supabase
    .from("profiles")
    .update({ foco_futuros: foco })
    .eq("id", user.user.id);
  return !error;
}

export function useAtualizarFoco() {
  const qc = useQueryClient();
  return async (foco: FocoFuturos) => {
    const ok = await definirFoco(foco);
    if (ok) qc.invalidateQueries({ queryKey: ["profile"] });
    return ok;
  };
}
