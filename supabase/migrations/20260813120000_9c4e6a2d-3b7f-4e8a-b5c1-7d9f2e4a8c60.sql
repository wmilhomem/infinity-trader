-- Rodada P: foco de estudo no Academy de futuros (WIN = mini indice | WDO = mini dolar)
-- o usuario escolhe qual contrato quer estudar e aprofundar; o default e WIN.
alter table public.profiles
  add column if not exists foco_futuros text not null default 'win';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_foco_futuros_check'
  ) then
    alter table public.profiles
      add constraint profiles_foco_futuros_check check (foco_futuros in ('win', 'wdo'));
  end if;
end $$;
