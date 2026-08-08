-- Rodada H — Learning Validation
-- Colunas de transferência (aplicação em outro cenário) e coerência da explicação
alter table public.lessons_progress
  add column if not exists transferencia_correta boolean,
  add column if not exists transferencia_opcao smallint,
  add column if not exists explicacao_coerente boolean;
