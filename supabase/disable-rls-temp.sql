-- =====================================================
-- ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ RLS ДЛЯ ТЕСТИРОВАНИЯ
-- ВНИМАНИЕ: Это отключает безопасность данных!
-- Используйте только для отладки!
-- =====================================================

-- Отключаем RLS для всех таблиц
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;

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

-- Создаем простую функцию для получения user_id из JWT (возвращает uuid)
CREATE OR REPLACE FUNCTION public.user_id() 
RETURNS uuid 
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid
$$;

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
