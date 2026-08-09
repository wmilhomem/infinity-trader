-- Rodada L3/L4: ponte Laboratorio -> Simulador -> Diario
-- Origem da hipotese: de qual ficha do Laboratorio partiu a simulacao
alter table public.simulations
  add column if not exists origem jsonb;
