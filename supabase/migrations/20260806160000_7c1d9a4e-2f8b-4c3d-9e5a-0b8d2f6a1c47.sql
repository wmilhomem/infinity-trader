-- Rodada E: ritual diário — fechamento do dia com reflexão.
-- O check abre o dia com a intenção; o ritual fecha com o que ficou.
CREATE TABLE public.reflexoes_diarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data date not null,
  estado text,
  conteudo text not null,
  created_at timestamptz not null default now(),
  UNIQUE (user_id, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflexoes_diarias TO authenticated;
GRANT ALL ON public.reflexoes_diarias TO service_role;
ALTER TABLE public.reflexoes_diarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflexoes_diarias" ON public.reflexoes_diarias FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
