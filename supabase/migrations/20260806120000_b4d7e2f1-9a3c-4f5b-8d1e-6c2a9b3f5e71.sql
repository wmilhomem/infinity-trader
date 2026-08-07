-- Rodada A: check cognitivo diário — estado, intenção e regra do dia
-- A pergunta ouro: "Por que você quer operar hoje?" Intenção precede comportamento.
-- Alinhada ao schema aplicado pelo Lovable (20260807002744): sinal nullable.
CREATE TABLE IF NOT EXISTS public.cheques_cognitivos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emocao text not null,
  motivo text not null,
  regra_id uuid,
  sinal jsonb,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cheques_cognitivos TO authenticated;
GRANT ALL ON public.cheques_cognitivos TO service_role;
ALTER TABLE public.cheques_cognitivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cheques_cognitivos" ON public.cheques_cognitivos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
