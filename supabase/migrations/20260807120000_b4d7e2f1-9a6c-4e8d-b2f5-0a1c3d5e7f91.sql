-- Rodada G: Learning Quality na Academy.
-- A missão (decisão antes do quiz) passa a ser registrada no progresso da lição
-- para alimentar o perfil cognitivo e o Decision OS.

ALTER TABLE public.lessons_progress
  ADD COLUMN IF NOT EXISTS missao_correta boolean,
  ADD COLUMN IF NOT EXISTS missao_opcao smallint,
  ADD COLUMN IF NOT EXISTS missao_explicacao text;
