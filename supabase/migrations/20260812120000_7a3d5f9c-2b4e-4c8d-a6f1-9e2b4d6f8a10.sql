-- Rodada N: segmentacao por mercado de interesse (caminho do usuario)
-- opcoes = mundo de opcoes (calls/puts) | futuros = day trade (WIN/WDO) | geral = ambos
alter table public.profiles
  add column if not exists caminho text not null default 'geral';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_caminho_check'
  ) then
    alter table public.profiles
      add constraint profiles_caminho_check check (caminho in ('opcoes', 'futuros', 'geral'));
  end if;
end $$;
