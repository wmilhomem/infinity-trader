-- Eixo 2: contexto estruturado da simulação (OmniscientContext) anexado à thread
ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS contexto JSONB;
