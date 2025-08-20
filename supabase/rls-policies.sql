-- =====================================================
-- RLS Policies для MVP Port
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

-- Функция для проверки членства пользователя в организации с определенной ролью
CREATE OR REPLACE FUNCTION public.is_member(org_id text, required_role text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.memberships m
    WHERE m.org_id = is_member.org_id
      AND m.user_id = auth.user_id()
      AND (
        required_role IS NULL 
        OR m.role::text = required_role
        OR (required_role = 'MEMBER' AND m.role::text IN ('MEMBER', 'ADMIN', 'OWNER'))
        OR (required_role = 'ADMIN' AND m.role::text IN ('ADMIN', 'OWNER'))
        OR (required_role = 'OWNER' AND m.role::text = 'OWNER')
      )
  )
$$;

-- Функция для проверки, является ли пользователь владельцем организации
CREATE OR REPLACE FUNCTION public.is_owner(org_id text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT public.is_member(org_id, 'OWNER')
$$;

-- Функция для проверки, является ли пользователь админом или владельцем
CREATE OR REPLACE FUNCTION public.can_manage(org_id text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT public.is_member(org_id, 'ADMIN')
$$;

-- Функция для получения организаций пользователя
CREATE OR REPLACE FUNCTION public.get_user_orgs()
RETURNS TABLE(org_id text, role text)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT m.org_id, m.role::text
  FROM public.memberships m
  WHERE m.user_id = auth.user_id()
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
-- RLS ПОЛИТИКИ ДЛЯ MEMBERSHIPS
-- =====================================================

-- Члены организации могут видеть всех участников
CREATE POLICY "Org members can view memberships" ON public.memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m2 
      WHERE m2.org_id = memberships.org_id 
        AND m2.user_id = auth.user_id()
    )
  );

-- Админы и владельцы могут управлять участниками (кроме владельца)
CREATE POLICY "Admins can manage memberships" ON public.memberships
  FOR ALL USING (
    -- Админы и владельцы могут управлять
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = auth.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
    -- Но не могут изменить роль владельца
    AND NOT (memberships.role = 'OWNER' AND memberships.user_id != auth.user_id())
  );

-- Пользователи могут покинуть организацию (удалить свое членство)
CREATE POLICY "Users can leave organization" ON public.memberships
  FOR DELETE USING (
    user_id = auth.user_id() 
    AND role != 'OWNER' -- Владелец не может покинуть организацию
  );

-- Владельцы могут приглашать новых участников
CREATE POLICY "Owners can invite members" ON public.memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = memberships.org_id 
        AND m.user_id = auth.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
    -- Нельзя создать второго владельца
    AND NOT (memberships.role = 'OWNER')
  );

-- =====================================================
-- ТРИГГЕРЫ И ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
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

-- Функция для проверки, что в организации всегда есть владелец
CREATE OR REPLACE FUNCTION public.ensure_owner_exists()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- При удалении или обновлении членства
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
    -- Проверяем, не удаляем ли мы последнего владельца
    IF (OLD.role = 'OWNER') THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.memberships 
        WHERE org_id = OLD.org_id 
          AND role = 'OWNER' 
          AND id != OLD.id
      ) THEN
        RAISE EXCEPTION 'Cannot remove the last owner from organization';
      END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Триггер для проверки владельца
DROP TRIGGER IF EXISTS ensure_owner_exists_trigger ON public.memberships;
CREATE TRIGGER ensure_owner_exists_trigger
  BEFORE UPDATE OR DELETE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_owner_exists();

-- =====================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ И ФУНКЦИЯМ
-- =====================================================

COMMENT ON FUNCTION public.is_member(text, text) IS 'Проверяет, является ли текущий пользователь членом организации с указанной ролью или выше';
COMMENT ON FUNCTION public.is_owner(text) IS 'Проверяет, является ли текущий пользователь владельцем организации';
COMMENT ON FUNCTION public.can_manage(text) IS 'Проверяет, может ли текущий пользователь управлять организацией (ADMIN или OWNER)';
COMMENT ON FUNCTION public.get_user_orgs() IS 'Возвращает список организаций текущего пользователя с его ролями';

COMMENT ON TABLE public.profiles IS 'Профили пользователей с дополнительной информацией';
COMMENT ON TABLE public.orgs IS 'Организации в системе';
COMMENT ON TABLE public.memberships IS 'Членство пользователей в организациях с ролями';
