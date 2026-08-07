CREATE TABLE IF NOT EXISTS public.cheques_cognitivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  emocao TEXT NOT NULL,
  motivo TEXT NOT NULL,
  regra_id UUID,
  sinal JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cheques_cognitivos TO authenticated;
GRANT ALL ON public.cheques_cognitivos TO service_role;
ALTER TABLE public.cheques_cognitivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cheques_cognitivos" ON public.cheques_cognitivos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reflexoes_diarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT current_date,
  estado TEXT NOT NULL,
  conteudo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflexoes_diarias TO authenticated;
GRANT ALL ON public.reflexoes_diarias TO service_role;
ALTER TABLE public.reflexoes_diarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflexoes_diarias" ON public.reflexoes_diarias FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.chat_threads ADD COLUMN IF NOT EXISTS contexto JSONB;