-- Garante schema referenciado pelo código mas ausente dos tipos gerados

-- portfolio_positions (Rodada W)
CREATE TABLE IF NOT EXISTS public.portfolio_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  ativo TEXT NOT NULL,
  lado TEXT NOT NULL CHECK (lado IN ('comprado', 'vendido')),
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  preco_entrada NUMERIC,
  tipo TEXT NOT NULL CHECK (tipo IN ('opcao', 'futuro')),
  opcao_tipo TEXT CHECK (opcao_tipo IN ('call', 'put')),
  strike NUMERIC,
  vencimento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (tipo = 'opcao' AND opcao_tipo IS NOT NULL AND strike IS NOT NULL AND vencimento IS NOT NULL)
    OR (tipo = 'futuro' AND opcao_tipo IS NULL AND strike IS NULL AND vencimento IS NULL)
  )
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_positions TO authenticated;
GRANT ALL ON public.portfolio_positions TO service_role;
ALTER TABLE public.portfolio_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own portfolio_positions" ON public.portfolio_positions;
CREATE POLICY "own portfolio_positions" ON public.portfolio_positions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profiles extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS voz_ativa BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS caminho TEXT NOT NULL DEFAULT 'geral',
  ADD COLUMN IF NOT EXISTS foco_futuros TEXT NOT NULL DEFAULT 'win';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_caminho_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_caminho_check CHECK (caminho IN ('opcoes', 'futuros', 'geral'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_foco_futuros_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_foco_futuros_check CHECK (foco_futuros IN ('win', 'wdo'));
  END IF;
END $$;

-- simulations.origem
ALTER TABLE public.simulations
  ADD COLUMN IF NOT EXISTS origem JSONB;
