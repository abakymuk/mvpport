# Настройка базы данных в Supabase

Инструкция по настройке базы данных для MVP Port в Supabase.

## 🎯 Цель

Создать все необходимые таблицы, политики и функции в Supabase для работы с организациями и пользователями.

## 📋 Что нужно сделать

### 1. Создание основных таблиц

Перейдите в **Supabase Dashboard** → **SQL Editor** и выполните следующий скрипт:

```sql
-- Полная схема базы данных для MVP Port
-- Выполните этот файл в Supabase SQL Editor

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание enum для ролей
CREATE TYPE public.role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы организаций
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы членства
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  role public.role DEFAULT 'MEMBER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Уникальный индекс для предотвращения дублирования членства
  UNIQUE(user_id, org_id)
);

-- Создание внешних ключей
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.orgs
ADD CONSTRAINT orgs_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.memberships
ADD CONSTRAINT memberships_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.memberships
ADD CONSTRAINT memberships_org_id_fkey
FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_orgs_owner_id ON public.orgs(owner_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON public.memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON public.memberships(user_id, org_id);

-- Включение Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- RLS политики для profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS политики для orgs
CREATE POLICY "Users can view orgs they are members of" ON public.orgs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE org_id = public.orgs.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their orgs" ON public.orgs
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create orgs" ON public.orgs
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- RLS политики для memberships
CREATE POLICY "Users can view memberships in their orgs" ON public.memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m2
      WHERE m2.org_id = public.memberships.org_id AND m2.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage memberships" ON public.memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.memberships m2
      WHERE m2.org_id = public.memberships.org_id
        AND m2.user_id = auth.uid()
        AND m2.role IN ('ADMIN', 'OWNER')
    )
  );

CREATE POLICY "Users can join orgs" ON public.memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_orgs_updated ON public.orgs;
CREATE TRIGGER on_orgs_updated
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Функция для проверки роли пользователя в организации
CREATE OR REPLACE FUNCTION public.is_member(p_org_id UUID, p_min_role TEXT DEFAULT 'MEMBER')
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.memberships m
    WHERE m.org_id = p_org_id
      AND m.user_id = auth.uid()
      AND (
        (p_min_role = 'VIEWER')
        OR (p_min_role = 'MEMBER' AND m.role IN ('MEMBER','ADMIN','OWNER'))
        OR (p_min_role = 'ADMIN' AND m.role IN ('ADMIN','OWNER'))
        OR (p_min_role = 'OWNER' AND m.role = 'OWNER')
      )
  );
$$;

-- Комментарии к таблицам
COMMENT ON TABLE public.profiles IS 'Профили пользователей';
COMMENT ON TABLE public.orgs IS 'Организации';
COMMENT ON TABLE public.memberships IS 'Членство пользователей в организациях';
COMMENT ON TYPE public.role IS 'Роли пользователей в организациях';
```

### 2. Добавление поля active_org_id

После создания основных таблиц выполните следующий скрипт:

```sql
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
```

## 🧪 Проверка настройки

### 1. Проверьте, что таблицы созданы

В **Supabase Dashboard** → **Table Editor** должны быть видны таблицы:

- `profiles`
- `orgs`
- `memberships`

### 2. Проверьте RLS политики

В **Supabase Dashboard** → **Authentication** → **Policies** должны быть политики для всех таблиц.

### 3. Проверьте функции

В **Supabase Dashboard** → **SQL Editor** выполните:

```sql
-- Проверка функций
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'handle_updated_at', 'is_member');
```

## ⚠️ Troubleshooting

### Ошибка "relation does not exist"

**Причина**: Таблицы еще не созданы
**Решение**: Выполните скрипт создания таблиц

### Ошибка "permission denied"

**Причина**: RLS политики не настроены
**Решение**: Проверьте, что все RLS политики созданы

### Ошибка "foreign key constraint"

**Причина**: Неправильные внешние ключи
**Решение**: Проверьте, что все внешние ключи созданы правильно

## 📚 Полезные ссылки

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/sql-editor)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema](https://supabase.com/docs/guides/database/schema)

## ✅ Checklist

- [ ] Выполнен скрипт создания таблиц
- [ ] Выполнен скрипт добавления active_org_id
- [ ] Проверены RLS политики
- [ ] Проверены функции и триггеры
- [ ] Протестировано создание организаций
