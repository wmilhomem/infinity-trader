-- diary extensions
ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS interpretacao jsonb,
  ADD COLUMN IF NOT EXISTS decision_score integer,
  ADD COLUMN IF NOT EXISTS checklist jsonb,
  ADD COLUMN IF NOT EXISTS emocao text,
  ADD COLUMN IF NOT EXISTS licao_aprendida text;

CREATE TABLE public.decision_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  diary_entry_id uuid references public.diary_entries(id) on delete cascade,
  simulation_id uuid references public.simulations(id) on delete set null,
  estrategia text,
  motivo text,
  contexto jsonb,
  resultado numeric,
  emocao text,
  licao_aprendida text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_memory TO authenticated;
GRANT ALL ON public.decision_memory TO service_role;
ALTER TABLE public.decision_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own decision_memory" ON public.decision_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  simulation_id uuid references public.simulations(id) on delete cascade,
  diary_entry_id uuid references public.diary_entries(id) on delete cascade,
  respostas jsonb not null default '{}'::jsonb,
  completo boolean not null default false,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklists TO authenticated;
GRANT ALL ON public.checklists TO service_role;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own checklists" ON public.checklists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.decision_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  diary_entry_id uuid references public.diary_entries(id) on delete cascade,
  score integer not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_scores TO authenticated;
GRANT ALL ON public.decision_scores TO service_role;
ALTER TABLE public.decision_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own decision_scores" ON public.decision_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tipo text not null,
  titulo text not null,
  descricao text,
  meta jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, tipo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own timeline_events" ON public.timeline_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text not null,
  titulo text not null,
  descricao text,
  earned_at timestamptz not null default now(),
  unique (user_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own badges" ON public.badges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  period_start date not null,
  resumo text,
  metricas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, period_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly_reviews" ON public.weekly_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  period_start date not null,
  resumo text,
  metricas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, period_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_reviews TO authenticated;
GRANT ALL ON public.monthly_reviews TO service_role;
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own monthly_reviews" ON public.monthly_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.behavior_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pattern_key text not null,
  titulo text not null,
  descricao text,
  severidade text not null default 'info',
  metricas jsonb,
  detected_at timestamptz not null default now(),
  unique (user_id, pattern_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.behavior_patterns TO authenticated;
GRANT ALL ON public.behavior_patterns TO service_role;
ALTER TABLE public.behavior_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own behavior_patterns" ON public.behavior_patterns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lesson_slug text not null,
  motivo text,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  unique (user_id, lesson_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_recommendations TO authenticated;
GRANT ALL ON public.learning_recommendations TO service_role;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own learning_recommendations" ON public.learning_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_decision_memory_updated_at BEFORE UPDATE ON public.decision_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();