# Vercel Setup Guide

Пошаговая инструкция по настройке Vercel для автоматических preview deployments.

## Предварительные требования

- GitHub репозиторий подключен к Vercel
- Vercel аккаунт (можно через GitHub)
- Доступ к настройкам репозитория

## Шаг 1: Подключение репозитория

### Через Vercel Dashboard

1. Перейдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "New Project"
3. Выберите "Import Git Repository"
4. Найдите `abakymuk/mvpport`
5. Нажмите "Import"

### Настройки проекта

- **Project Name**: `mvpport`
- **Framework Preset**: Next.js
- **Root Directory**: `./` (по умолчанию)
- **Build Command**: `pnpm build` (автоматически)
- **Output Directory**: `.next` (автоматически)

## Шаг 2: Переменные окружения

### Обязательные переменные

В Project Settings → Environment Variables добавьте:

```bash
# Preview Environment
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Production Environment (опционально)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Настройка окружений

- **Preview**: для всех preview deployments
- **Production**: для production deployments
- **Development**: для локальной разработки

## Шаг 3: Git Integration

### Настройка автоматических deployments

1. В Project Settings → Git
2. Убедитесь, что включены:
   - ✅ **Production Branch**: `main`
   - ✅ **Preview Deployment**: `All branches`
   - ✅ **Auto-assign Preview URLs**: включено

### Настройка комментариев

1. Установите [Vercel GitHub App](https://github.com/apps/vercel)
2. Разрешите доступ к репозиторию
3. Включите "Comment on Pull Requests"

## Шаг 4: GitHub Secrets

### Добавление секретов

В GitHub репозитории → Settings → Secrets and variables → Actions:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_team_id (опционально)
VERCEL_PROJECT_ID=your_project_id
```

### Получение токена

1. Перейдите в [Vercel Account Settings](https://vercel.com/account/tokens)
2. Создайте новый токен
3. Скопируйте токен в GitHub Secrets

## Шаг 5: Проверка настройки

### Тестовый PR

1. Создайте новую ветку
2. Внесите небольшое изменение
3. Создайте Pull Request
4. Проверьте, что:
   - Vercel deployment запустился
   - Preview URL доступен
   - Комментарий добавлен в PR

### Проверка smoke тестов

1. Дождитесь завершения GitHub Actions
2. Проверьте статус smoke тестов
3. Убедитесь, что health endpoint работает

## Шаг 6: Оптимизация

### Build оптимизации

В `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### Кэширование

- **Build Cache**: автоматически включен
- **Edge Cache**: для статических файлов
- **Function Cache**: для API routes

## Troubleshooting

### Deployment не запускается

**Возможные причины:**

- Неправильные переменные окружения
- Ошибки в build процессе
- Проблемы с Git integration

**Решение:**

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все переменные настроены
3. Проверьте статус GitHub integration

### Preview URL недоступен

**Возможные причины:**

- Deployment еще не завершен
- Проблемы с DNS
- Ограничения Vercel

**Решение:**

1. Подождите завершения deployment
2. Проверьте статус в Vercel Dashboard
3. Попробуйте обновить страницу

### Smoke тесты падают

**Возможные причины:**

- Приложение не запустилось
- Проблемы с базой данных
- Неправильные переменные окружения

**Решение:**

1. Проверьте preview URL вручную
2. Убедитесь, что health endpoint работает
3. Проверьте логи приложения

## Мониторинг

### Vercel Dashboard

- **Deployments**: статус всех deployments
- **Analytics**: метрики производительности
- **Logs**: детальные логи

### GitHub Actions

- **Smoke Tests**: статус тестов
- **Logs**: логи выполнения
- **Notifications**: уведомления о статусе

## Ограничения

### Vercel Limits

- **Preview deployments**: ограничены планом
- **Build time**: ограничения на время сборки
- **Function execution**: ограничения на API routes

### Рекомендации

- Используйте эффективные build команды
- Оптимизируйте размер приложения
- Мониторьте использование ресурсов

## Ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel GitHub App](https://github.com/apps/vercel)
