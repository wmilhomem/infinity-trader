-- Rodada E: ritual diário — fechamento do dia com reflexão.
-- O check abre o dia com a intenção; o ritual fecha com o que ficou.
-- Alinhada ao schema aplicado pelo Lovable (20260807002744): estado NOT NULL,
-- conteudo default '', um registro por dia.
CREATE TABLE IF NOT EXISTS public.reflexoes_diarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  estado text not null,
  conteudo text not null default '',
  created_at timestamptz not null default now(),
  UNIQUE (user_id, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflexoes_diarias TO authenticated;
GRANT ALL ON public.reflexoes_diarias TO service_role;
ALTER TABLE public.reflexoes_diarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflexoes_diarias" ON public.reflexoes_diarias FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
