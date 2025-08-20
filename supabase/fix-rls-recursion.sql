-- =====================================================
-- Исправление рекурсии в RLS политиках
-- =====================================================

-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Organization members can view org" ON public.orgs;
DROP POLICY IF EXISTS "Only owners can update org" ON public.orgs;
DROP POLICY IF EXISTS "Authenticated users can create orgs" ON public.orgs;
DROP POLICY IF EXISTS "Only owners can delete org" ON public.orgs;

DROP POLICY IF EXISTS "Org members can view memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can leave organization" ON public.memberships;
DROP POLICY IF EXISTS "Owners can invite members" ON public.memberships;

-- Удаляем функции, которые могут вызывать рекурсию
DROP FUNCTION IF EXISTS public.is_member(text, text);
DROP FUNCTION IF EXISTS public.is_owner(text);
DROP FUNCTION IF EXISTS public.can_manage(text);
DROP FUNCTION IF EXISTS public.get_user_orgs();
DROP FUNCTION IF EXISTS public.ensure_owner_exists();

-- Удаляем существующую функцию user_id
DROP FUNCTION IF EXISTS public.user_id();

-- Удаляем триггеры
DROP TRIGGER IF EXISTS ensure_owner_exists_trigger ON public.memberships;

-- Создаем функцию для получения текущего user_id (возвращает uuid)
CREATE OR REPLACE FUNCTION public.user_id() 
RETURNS uuid 
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid
$$;

-- Применяем новые политики
-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ PROFILES
-- =====================================================

-- Пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = public.user_id());

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = public.user_id());

-- Пользователи могут создавать только свой профиль
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = public.user_id());

-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ ORGS
-- =====================================================

-- Члены организации могут видеть информацию об организации
CREATE POLICY "Organization members can view org" ON public.orgs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = orgs.id 
        AND m.user_id = public.user_id()
    )
  );

-- Только владельцы могут обновлять организацию
CREATE POLICY "Only owners can update org" ON public.orgs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = orgs.id 
        AND m.user_id = public.user_id()
        AND m.role = 'OWNER'
    )
  );

-- Аутентифицированные пользователи могут создавать организации
CREATE POLICY "Authenticated users can create orgs" ON public.orgs
  FOR INSERT WITH CHECK (public.user_id() IS NOT NULL AND owner_id = public.user_id());

-- Только владельцы могут удалять организации
CREATE POLICY "Only owners can delete org" ON public.orgs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = orgs.id 
        AND m.user_id = public.user_id()
        AND m.role = 'OWNER'
    )
  );

-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ MEMBERSHIPS (УПРОЩЕННЫЕ)
-- =====================================================

-- Пользователи могут видеть членства в организациях, где они состоят
CREATE POLICY "Users can view memberships in their orgs" ON public.memberships
  FOR SELECT USING (
    user_id = public.user_id() -- Свои членства
    OR 
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = public.user_id()
    ) -- Членства в своих организациях
  );

-- Пользователи могут создавать членства (для приглашений)
CREATE POLICY "Users can create memberships" ON public.memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Пользователи могут обновлять членства (для изменения ролей)
CREATE POLICY "Users can update memberships" ON public.memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Пользователи могут удалять членства
CREATE POLICY "Users can delete memberships" ON public.memberships
  FOR DELETE USING (
    user_id = public.user_id() -- Свои членства
    OR 
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    ) -- Админы и владельцы могут удалять
  );
