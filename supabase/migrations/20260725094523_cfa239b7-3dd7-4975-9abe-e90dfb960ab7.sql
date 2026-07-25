
ALTER TABLE public.personal_rules
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'texto',
  ADD COLUMN IF NOT EXISTS nome text,
  ADD COLUMN IF NOT EXISTS parametros_json jsonb;

ALTER TABLE public.personal_rules
  DROP CONSTRAINT IF EXISTS personal_rules_tipo_check;
ALTER TABLE public.personal_rules
  ADD CONSTRAINT personal_rules_tipo_check
  CHECK (tipo IN ('texto', 'indicador_tecnico', 'padrao_barras'));
