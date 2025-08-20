# Vercel Environment Variables Setup

Подробная инструкция по настройке переменных окружения в Vercel для корректной работы приложения.

## Обязательные переменные

### 1. Перейдите в Vercel Dashboard

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Найдите проект `mvpport`
3. Перейдите в **Settings** → **Environment Variables**

### 2. Добавьте переменные для Preview Environment

```bash
# Обязательные переменные
DATABASE_URL=postgresql://postgres:password@localhost:5432/mvpport
NEXT_PUBLIC_SUPABASE_URL=https://wwjysfxdlgmswkcqkfru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3anlzZnhkbGdtc3drY3FrZnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzgyMDcsImV4cCI6MjA3MTExNDIwN30.UCBk0CqIBOq0yfq-631FaTOs11LfaxCu6l6ge_q1b1s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3anlzZnhkbGdtc3drY3FrZnJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzODIwNywiZXhwIjoyMDcxMTE0MjA3fQ.9jvBFBGxQZmjX6FlgtRO1VDEDuI1iTRTWxPsgUHh3uM

# Опциональные переменные
NODE_ENV=production
VERCEL_ENV=preview
```

### 3. Добавьте переменные для Production Environment

Те же переменные, но для Production:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/mvpport
NEXT_PUBLIC_SUPABASE_URL=https://wwjysfxdlgmswkcqkfru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3anlzZnhkbGdtc3drY3FrZnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzgyMDcsImV4cCI6MjA3MTExNDIwN30.UCBk0CqIBOq0yfq-631FaTOs11LfaxCu6l6ge_q1b1s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3anlzZnhkbGdtc3drY3FrZnJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzODIwNywiZXhwIjoyMDcxMTE0MjA3fQ.9jvBFBGxQZmjX6FlgtRO1VDEDuI1iTRTWxPsgUHh3uM
NODE_ENV=production
VERCEL_ENV=production
```

## Пошаговая настройка

### Шаг 1: Добавление переменных

1. В Vercel Dashboard → Project Settings → Environment Variables
2. Нажмите **Add New**
3. Введите **Name** и **Value**
4. Выберите **Environment**: Preview, Production, или Both
5. Нажмите **Save**

### Шаг 2: Проверка настройки

После добавления переменных:

1. Создайте новый PR или обновите существующий
2. Дождитесь завершения Vercel deployment
3. Проверьте endpoints:

```bash
# Health check
curl https://your-preview-url.vercel.app/api/health

# Environment check
curl https://your-preview-url.vercel.app/api/env-check

# Supabase test
curl https://your-preview-url.vercel.app/api/supabase-test
```

### Шаг 3: Ожидаемые результаты

**Health endpoint** должен вернуть:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": {
    "NODE_ENV": "production",
    "VERCEL_ENV": "preview",
    "NEXT_PUBLIC_SUPABASE_URL": "SET",
    "DATABASE_URL": "SET"
  }
}
```

**Supabase test** должен вернуть:

```json
{
  "status": "ok",
  "supabase_connected": true,
  "error": null,
  "data_count": 0
}
```

## Troubleshooting

### Проблема: "DATABASE_URL is NOT_SET"

**Решение:**

1. Проверьте, что переменная добавлена для правильного Environment
2. Убедитесь, что значение корректное
3. Перезапустите deployment

### Проблема: "Supabase connection failed"

**Решение:**

1. Проверьте Supabase URL и ключи
2. Убедитесь, что Supabase проект активен
3. Проверьте RLS политики

### Проблема: "next/headers not available"

**Решение:**

1. Код уже исправлен с динамическим импортом
2. Перезапустите deployment
3. Проверьте логи в Vercel Dashboard

## Важные замечания

### Безопасность

- **NEXT*PUBLIC*** переменные доступны в браузере
- **SUPABASE_SERVICE_ROLE_KEY** должен быть секретным
- Используйте разные ключи для preview и production

### Производительность

- Preview deployments используют те же переменные
- Рекомендуется использовать staging базу для preview
- Production использует production базу

## Ссылки

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)
- [Vercel Dashboard](https://vercel.com/dashboard)
