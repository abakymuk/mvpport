-- =====================================================
-- Добавление поля onboarding_state в таблицу profiles
-- =====================================================

-- Добавляем поле onboarding_state в таблицу profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_state JSONB DEFAULT '{}'::jsonb;

-- Создаем индекс для быстрого поиска по onboarding_state
CREATE INDEX IF NOT EXISTS profiles_onboarding_state_idx 
ON public.profiles USING GIN (onboarding_state);

-- Комментарий к полю
COMMENT ON COLUMN public.profiles.onboarding_state IS 'Состояние онбординга пользователя в формате JSON';

-- =====================================================
-- Создание таблицы для аналитики событий (опционально)
-- =====================================================

-- Создаем таблицу для хранения событий аналитики
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Индексы для производительности
  CONSTRAINT analytics_events_event_name_check CHECK (event_name <> '')
);

-- Создаем индексы для аналитики
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS analytics_events_properties_idx ON public.analytics_events USING GIN (properties);

-- Включаем RLS для аналитики
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS политики для аналитики
CREATE POLICY "Users can view their own analytics events" ON public.analytics_events
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can insert their own analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (user_id = public.user_id());

-- Комментарии
COMMENT ON TABLE public.analytics_events IS 'События аналитики пользователей';
COMMENT ON COLUMN public.analytics_events.event_name IS 'Название события';
COMMENT ON COLUMN public.analytics_events.properties IS 'Свойства события в формате JSON';
COMMENT ON COLUMN public.analytics_events.user_agent IS 'User-Agent браузера';
COMMENT ON COLUMN public.analytics_events.ip_address IS 'IP адрес пользователя';

-- =====================================================
-- Функции для работы с онбордингом
-- =====================================================

-- Функция для обновления состояния онбординга
CREATE OR REPLACE FUNCTION public.update_onboarding_state(
  user_id uuid,
  step_key text,
  step_value boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_state jsonb;
  new_state jsonb;
BEGIN
  -- Получаем текущее состояние
  SELECT onboarding_state INTO current_state
  FROM public.profiles
  WHERE profiles.user_id = update_onboarding_state.user_id;
  
  -- Если состояние не найдено, создаем пустое
  IF current_state IS NULL THEN
    current_state := '{}'::jsonb;
  END IF;
  
  -- Обновляем конкретный шаг
  new_state := current_state || jsonb_build_object(step_key, step_value);
  
  -- Сохраняем новое состояние
  UPDATE public.profiles
  SET onboarding_state = new_state
  WHERE profiles.user_id = update_onboarding_state.user_id;
END;
$$;

-- Функция для получения прогресса онбординга
CREATE OR REPLACE FUNCTION public.get_onboarding_progress(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  state jsonb;
  completed_steps integer;
  total_steps integer;
BEGIN
  -- Получаем состояние онбординга
  SELECT onboarding_state INTO state
  FROM public.profiles
  WHERE profiles.user_id = get_onboarding_progress.user_id;
  
  -- Если состояние не найдено, возвращаем 0
  IF state IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Подсчитываем выполненные шаги
  completed_steps := 0;
  total_steps := 0;
  
  -- Проверяем каждый шаг
  IF state ? 'created_org' THEN
    total_steps := total_steps + 1;
    IF (state->>'created_org')::boolean THEN
      completed_steps := completed_steps + 1;
    END IF;
  END IF;
  
  IF state ? 'completed_profile' THEN
    total_steps := total_steps + 1;
    IF (state->>'completed_profile')::boolean THEN
      completed_steps := completed_steps + 1;
    END IF;
  END IF;
  
  IF state ? 'invited_member' THEN
    total_steps := total_steps + 1;
    IF (state->>'invited_member')::boolean THEN
      completed_steps := completed_steps + 1;
    END IF;
  END IF;
  
  IF state ? 'viewed_dashboard' THEN
    total_steps := total_steps + 1;
    IF (state->>'viewed_dashboard')::boolean THEN
      completed_steps := completed_steps + 1;
    END IF;
  END IF;
  
  IF state ? 'connected_integration' THEN
    total_steps := total_steps + 1;
    IF (state->>'connected_integration')::boolean THEN
      completed_steps := completed_steps + 1;
    END IF;
  END IF;
  
  IF state ? 'viewed_demo_data' THEN
    total_steps := total_steps + 1;
    IF (state->>'viewed_demo_data')::boolean THEN
      completed_steps := completed_steps + 1;
    END IF;
  END IF;
  
  -- Возвращаем процент выполнения
  IF total_steps = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_steps::float / total_steps::float) * 100);
  END IF;
END;
$$;

-- Комментарии к функциям
COMMENT ON FUNCTION public.update_onboarding_state IS 'Обновляет состояние онбординга пользователя';
COMMENT ON FUNCTION public.get_onboarding_progress IS 'Возвращает процент выполнения онбординга (0-100)';
