# Настройка схемы данных в Supabase

Пошаговая инструкция по загрузке модели данных в Supabase для MVP Port.

## Предварительные требования

1. Созданный проект в Supabase
2. Доступ к Supabase Dashboard
3. URL и API ключи проекта

## Шаг 1: Откройте Supabase Dashboard

1. Перейдите на [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект `mvpport`
3. Перейдите в раздел **SQL Editor**

## Шаг 2: Загрузите основную схему

1. В SQL Editor нажмите **New Query**
2. Скопируйте содержимое файла `supabase/full-schema.sql`
3. Вставьте в редактор
4. Нажмите **Run** для выполнения

### Что создается:

- ✅ Таблицы: `profiles`, `orgs`, `memberships`
- ✅ Enum тип: `role` (OWNER, ADMIN, MEMBER, VIEWER)
- ✅ Индексы для производительности
- ✅ Внешние ключи
- ✅ Row Level Security (RLS) политики
- ✅ Триггеры для автоматического создания профилей
- ✅ Функции для проверки ролей

## Шаг 3: Проверьте созданные таблицы

1. Перейдите в **Table Editor**
2. Убедитесь, что созданы таблицы:
   - `profiles`
   - `orgs`
   - `memberships`

## Шаг 4: Настройте аутентификацию (опционально)

1. Перейдите в **Authentication** → **Settings**
2. Настройте:
   - **Site URL**: `https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app`
   - **Redirect URLs**:
     - `https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/auth/callback`
     - `https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/login`

## Шаг 5: Проверьте RLS политики

1. Перейдите в **Authentication** → **Policies**
2. Убедитесь, что для каждой таблицы включен RLS
3. Проверьте созданные политики

## Шаг 6: Тестирование

### Создание тестового пользователя

1. Перейдите в **Authentication** → **Users**
2. Нажмите **Add User**
3. Введите email и пароль
4. Создайте пользователя

### Проверка автоматического создания профиля

1. После создания пользователя перейдите в **Table Editor**
2. Откройте таблицу `profiles`
3. Убедитесь, что профиль создался автоматически

## Шаг 7: Демо данные (опционально)

Если хотите добавить демо данные:

1. В SQL Editor создайте новый запрос
2. Скопируйте содержимое `supabase/demo-data.sql`
3. **ВАЖНО**: Измените `user_id` на реальные ID пользователей
4. Выполните запрос

## Проверка работоспособности

### API тесты

1. Проверьте health endpoint:

   ```
   GET https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/api/health
   ```

2. Проверьте Supabase подключение:
   ```
   GET https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/api/supabase-test
   ```

### Тестирование аутентификации

1. Перейдите на `/signup`
2. Создайте новую учетную запись
3. Войдите в систему
4. Проверьте доступ к dashboard

## Troubleshooting

### Ошибка "relation does not exist"

**Причина**: Таблицы не созданы
**Решение**: Выполните `full-schema.sql` заново

### Ошибка "permission denied"

**Причина**: RLS политики блокируют доступ
**Решение**: Проверьте настройки RLS в Supabase Dashboard

### Ошибка "foreign key constraint"

**Причина**: Неправильные ссылки на auth.users
**Решение**: Убедитесь, что пользователи существуют в auth.users

### Профиль не создается автоматически

**Причина**: Триггер не работает
**Решение**: Проверьте функцию `handle_new_user()` и триггер

## Структура данных

### Таблица `profiles`

```sql
- id: TEXT (Primary Key)
- user_id: TEXT (Foreign Key → auth.users.id)
- display_name: TEXT
- avatar_url: TEXT
- locale: TEXT (default: 'en')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Таблица `orgs`

```sql
- id: TEXT (Primary Key)
- name: TEXT
- owner_id: TEXT (Foreign Key → auth.users.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Таблица `memberships`

```sql
- id: TEXT (Primary Key)
- user_id: TEXT (Foreign Key → auth.users.id)
- org_id: TEXT (Foreign Key → orgs.id)
- role: ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')
- created_at: TIMESTAMP
```

## Следующие шаги

После успешной настройки схемы:

1. ✅ Обновите переменные окружения в Vercel
2. ✅ Перезапустите деплой
3. ✅ Протестируйте регистрацию и вход
4. ✅ Проверьте работу dashboard

## Полезные команды

### Проверка структуры таблиц

```sql
\d public.profiles
\d public.orgs
\d public.memberships
```

### Проверка RLS политик

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### Проверка триггеров

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```
