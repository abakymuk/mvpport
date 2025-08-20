# Preview Deployments

Руководство по работе с автоматическими preview deployments для Pull Requests.

## Обзор

Каждый Pull Request автоматически получает preview deployment на Vercel, что позволяет:

- Тестировать изменения в реальной среде
- Демонстрировать функциональность стейкхолдерам
- Ускорить процесс code review
- Обнаруживать проблемы до merge в main

## Как это работает

### Автоматические Preview

1. **Создание PR** → автоматический запуск Vercel deployment
2. **Новые коммиты** → обновление preview
3. **Smoke тесты** → проверка работоспособности
4. **Комментарий в PR** → ссылка на preview URL

### Preview URL

Формат URL: `https://mvpport-git-{branch}-abakymuk.vercel.app`

Примеры:

- `https://mvpport-git-feature-auth-abakymuk.vercel.app`
- `https://mvpport-git-fix-bug-123-abakymuk.vercel.app`

## Получение Preview

### Для разработчиков

1. Создайте Pull Request
2. Дождитесь завершения CI/CD pipeline
3. Найдите комментарий с preview URL в PR
4. Перейдите по ссылке для тестирования

### Для ревьюеров

1. Откройте Pull Request
2. Найдите секцию "🚀 Preview Deployment"
3. Кликните на preview URL
4. Протестируйте функциональность

## Smoke Tests

Каждый preview автоматически проходит smoke тесты:

### Проверяемые endpoints

- **Health Check**: `GET /api/health`
  - Ожидаемый ответ: `{"status":"ok","version":"0.1.0"}`
- **Main Page**: `GET /`
  - Ожидаемый статус: `200`

### Статус тестов

- ✅ **Passed** - все тесты прошли успешно
- ❌ **Failed** - обнаружены проблемы

## Переменные окружения

### Preview Environment

Preview deployments используют следующие переменные:

```bash
# Обязательные
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Опциональные
NODE_ENV="production"
VERCEL_ENV="preview"
```

### Настройка переменных

1. **Vercel Dashboard**:
   - Перейдите в Project Settings → Environment Variables
   - Добавьте переменные для Preview environment

2. **GitHub Secrets** (альтернатива):
   - Добавьте секреты в репозиторий
   - Используйте в workflow

## Мониторинг и логи

### Vercel Dashboard

- **Deployments**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Logs**: доступны для каждого deployment
- **Analytics**: метрики производительности

### GitHub Actions

- **Smoke Tests**: [Actions Tab](https://github.com/abakymuk/mvpport/actions)
- **Logs**: детальные логи выполнения тестов
- **Status**: статус каждого PR

## Troubleshooting

### Preview не создается

**Возможные причины:**

- Ошибки в build процессе
- Проблемы с переменными окружения
- Ограничения Vercel (rate limits)

**Решение:**

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус GitHub Actions

### Smoke тесты падают

**Возможные причины:**

- Приложение не запустилось
- Проблемы с базой данных
- Неправильные переменные окружения

**Решение:**

1. Проверьте preview URL вручную
2. Убедитесь, что health endpoint работает
3. Проверьте логи приложения

### Preview недоступен

**Возможные причины:**

- Deployment еще не завершен
- Проблемы с DNS
- Ограничения Vercel

**Решение:**

1. Подождите завершения deployment
2. Проверьте статус в Vercel Dashboard
3. Попробуйте обновить страницу

## Ограничения

### Vercel Limits

- **Preview deployments**: ограничены планом Vercel
- **Время жизни**: автоматическое удаление старых preview
- **Размер**: ограничения на размер приложения

### Рекомендации

- Не создавайте слишком много PR одновременно
- Закрывайте PR после merge для освобождения ресурсов
- Используйте draft PR для работы в процессе

## Интеграция с CI/CD

### Workflow

```yaml
name: Preview Smoke Tests
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - name: Wait for Vercel deployment
        # Ожидание завершения deployment

      - name: Test health endpoint
        # Проверка health endpoint

      - name: Comment PR
        # Добавление комментария с URL
```

### Автоматизация

- **Автоматические комментарии** в PR
- **Обновление комментариев** при новых коммитах
- **Уведомления** о статусе тестов

## Безопасность

### Preview Security

- **Публичные URL**: preview доступны всем
- **Временные**: автоматически удаляются
- **Изолированные**: отдельные от production

### Рекомендации

- Не используйте production данные в preview
- Используйте тестовые переменные окружения
- Ограничьте доступ к чувствительным данным

## Ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git)
- [GitHub Actions](https://github.com/abakymuk/mvpport/actions)
- [Vercel Dashboard](https://vercel.com/dashboard)
