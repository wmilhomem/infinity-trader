ALTER TABLE public.lessons_progress
  ADD COLUMN IF NOT EXISTS missao_correta boolean,
  ADD COLUMN IF NOT EXISTS missao_opcao integer,
  ADD COLUMN IF NOT EXISTS missao_explicacao text,
  ADD COLUMN IF NOT EXISTS explicacao_coerente boolean,
  ADD COLUMN IF NOT EXISTS transferencia_correta boolean,
  ADD COLUMN IF NOT EXISTS transferencia_opcao integer;