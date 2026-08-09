-- Rodada V — Voz
-- Preferência do usuário: conversa por voz com o copilot
alter table public.profiles
  add column if not exists voz_ativa boolean not null default false;
