-- =====================================================
-- Создание таблицы invites для системы приглашений
-- =====================================================

-- Создаем таблицу invites
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN', 'VIEWER')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS invites_org_id_idx ON public.invites(org_id);
CREATE INDEX IF NOT EXISTS invites_email_idx ON public.invites(email);
CREATE INDEX IF NOT EXISTS invites_token_idx ON public.invites(token);
CREATE INDEX IF NOT EXISTS invites_status_idx ON public.invites(status);
CREATE INDEX IF NOT EXISTS invites_expires_at_idx ON public.invites(expires_at);

-- Включаем RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS ПОЛИТИКИ ДЛЯ INVITES
-- =====================================================

-- Админы и владельцы могут читать приглашения своей организации
CREATE POLICY "Admins can view invites" ON public.invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = invites.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Админы и владельцы могут создавать приглашения
CREATE POLICY "Admins can create invites" ON public.invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = invites.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Админы и владельцы могут обновлять приглашения (для отзыва)
CREATE POLICY "Admins can update invites" ON public.invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = invites.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- Админы и владельцы могут удалять приглашения
CREATE POLICY "Admins can delete invites" ON public.invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.org_id = invites.org_id 
        AND m.user_id = public.user_id()
        AND m.role IN ('ADMIN', 'OWNER')
    )
  );

-- =====================================================
-- ФУНКЦИИ ДЛЯ РАБОТЫ С ПРИГЛАШЕНИЯМИ
-- =====================================================

-- Функция для генерации токена приглашения
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
AS $$
  SELECT encode(gen_random_bytes(32), 'hex')
$$;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_invites_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_invites_updated_at_trigger ON public.invites;
CREATE TRIGGER update_invites_updated_at_trigger
  BEFORE UPDATE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invites_updated_at();

-- Функция для автоматического истечения приглашений
CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.invites 
  SET status = 'EXPIRED'
  WHERE status = 'PENDING' 
    AND expires_at < now();
END;
$$;

-- Комментарии к таблице и функциям
COMMENT ON TABLE public.invites IS 'Приглашения в организации';
COMMENT ON COLUMN public.invites.org_id IS 'ID организации';
COMMENT ON COLUMN public.invites.email IS 'Email приглашенного пользователя';
COMMENT ON COLUMN public.invites.role IS 'Роль в организации (MEMBER, ADMIN, VIEWER)';
COMMENT ON COLUMN public.invites.status IS 'Статус приглашения (PENDING, ACCEPTED, DECLINED, EXPIRED)';
COMMENT ON COLUMN public.invites.token IS 'Уникальный токен для принятия приглашения';
COMMENT ON COLUMN public.invites.expires_at IS 'Дата истечения приглашения';
COMMENT ON FUNCTION public.generate_invite_token() IS 'Генерирует уникальный токен для приглашения';
COMMENT ON FUNCTION public.expire_old_invites() IS 'Автоматически истекает старые приглашения';
