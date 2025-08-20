-- =====================================================
-- RLS Policies для MVP Port (ИСПРАВЛЕННЫЕ)
-- Обеспечивает изоляцию данных между организациями
-- =====================================================

-- Включение RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
-- =====================================================

-- Функция для получения текущего user_id из Supabase Auth
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS text 
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::text
$$;

-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ PROFILES
-- =====================================================

-- Пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.user_id());

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.user_id());

-- Пользователи могут создавать только свой профиль
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ ORGS
-- =====================================================

-- Члены организации могут видеть информацию об организации
CREATE POLICY "Organization members can view org" ON public.orgs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = orgs.id 
        AND m.user_id = auth.user_id()
    )
  );

-- Только владельцы могут обновлять организацию
CREATE POLICY "Only owners can update org" ON public.orgs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = orgs.id 
        AND m.user_id = auth.user_id()
        AND m.role = 'OWNER'
    )
  );

-- Аутентифицированные пользователи могут создавать организации
CREATE POLICY "Authenticated users can create orgs" ON public.orgs
  FOR INSERT WITH CHECK (auth.user_id() IS NOT NULL AND owner_id = auth.user_id());

-- Только владельцы могут удалять организации
CREATE POLICY "Only owners can delete org" ON public.orgs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = orgs.id 
        AND m.user_id = auth.user_id()
        AND m.role = 'OWNER'
    )
  );

-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ MEMBERSHIPS (УПРОЩЕННЫЕ)
-- =====================================================

-- Пользователи могут видеть членства в организациях, где они состоят
CREATE POLICY "Users can view memberships in their orgs" ON public.memberships
  FOR SELECT USING (
    user_id = auth.user_id() -- Свои членства
    OR 
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = auth.user_id()
    ) -- Членства в своих организациях
  );

-- Пользователи могут создавать членства (для приглашений)
CREATE POLICY "Users can create memberships" ON public.memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = auth.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Пользователи могут обновлять членства (для изменения ролей)
CREATE POLICY "Users can update memberships" ON public.memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = auth.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Пользователи могут удалять членства
CREATE POLICY "Users can delete memberships" ON public.memberships
  FOR DELETE USING (
    user_id = auth.user_id() -- Свои членства
    OR 
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = auth.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    ) -- Админы и владельцы могут удалять
  );

-- =====================================================
-- ТРИГГЕРЫ
-- =====================================================

-- Функция для автоматического создания членства владельца при создании организации
CREATE OR REPLACE FUNCTION public.create_owner_membership()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.memberships (user_id, org_id, role)
  VALUES (NEW.owner_id, NEW.id, 'OWNER');
  RETURN NEW;
END;
$$;

-- Триггер для создания членства владельца
DROP TRIGGER IF EXISTS create_owner_membership_trigger ON public.orgs;
CREATE TRIGGER create_owner_membership_trigger
  AFTER INSERT ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION public.create_owner_membership();
