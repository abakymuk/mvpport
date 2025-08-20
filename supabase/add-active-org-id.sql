-- Добавление поля active_org_id в профиль пользователя
-- Это поле будет хранить ID активной организации для каждого пользователя

-- Добавляем поле active_org_id в таблицу profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL;

-- Создаем индекс для быстрого поиска по active_org_id
CREATE INDEX IF NOT EXISTS idx_profiles_active_org_id ON public.profiles(active_org_id);

-- Обновляем существующие профили, устанавливая active_org_id на первую организацию пользователя
UPDATE public.profiles 
SET active_org_id = (
  SELECT m.org_id 
  FROM public.memberships m 
  WHERE m.user_id = profiles.user_id 
  ORDER BY m.created_at ASC 
  LIMIT 1
)
WHERE active_org_id IS NULL 
AND EXISTS (
  SELECT 1 FROM public.memberships m WHERE m.user_id = profiles.user_id
);

-- Добавляем комментарий к полю
COMMENT ON COLUMN public.profiles.active_org_id IS 'ID активной организации пользователя. Если NULL, пользователь не выбрал активную организацию.';
