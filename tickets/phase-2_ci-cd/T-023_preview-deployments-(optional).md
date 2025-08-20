# [T-023] Preview Deployments (Optional)

## Обоснование

Превью окружения для каждого PR ускоряют ревью UX/фич, позволяют дизайнерам/стейкхолдерам кликать живую версию без локального подъёма. Автоматические превью деплои значительно улучшают процесс разработки и тестирования.

## Область действия

### Входит в scope:

- ✅ Автоматические превью на Vercel
- ✅ Передача переменных окружения (через Doppler или ручную синхронизацию)
- ✅ Комментарий-бот в PR с URL превью
- ✅ Опционально — прогон e2e smoke на превью URL

### Не входит в scope:

- Автодеплой в production
- Сложные базы данных для превью (можно использовать общий staging или ephemeral DB при наличии ресурса)

## Задачи

### 1. Подключение к Vercel

**Требования:**

- Подключить репо к Vercel, проект `mvp-app`
- Настроить Git Integration: каждое `pull_request` → Preview
- Настроить Environment Variables

### 2. Настройка переменных окружения

**Варианты:**

- Интеграция Doppler → Vercel
- Ручная синхронизация через Vercel Dashboard
- Использование GitHub Secrets

### 3. GitHub App интеграция

**Требования:**

- Добавить GitHub App Vercel для комментариев в PR
- Автоматические комментарии с URL превью
- Обновление комментариев при новых коммитах

### 4. Smoke тесты (опционально)

**Файл:** `.github/workflows/preview-smoke.yml`

**Функциональность:**

- Ожидание завершения Vercel deployment
- Проверка health endpoint
- Уведомления о статусе

### 5. Документация

**Требования:**

- Добавить раздел "Preview Deployments" в README
- Инструкции по получению превью
- Информация о логах и мониторинге

## Критерии приемки

- ✅ Каждый PR автоматически получает URL превью в комментарии
- ✅ Превью обновляется при новых коммитах в PR
- ✅ Health-endpoint на превью отвечает 200 и содержит версию
- ✅ (Если включено) Smoke-job зеленый, если превью доступно

## Качество

- ✅ Быстрые деплои (< 5 минут)
- ✅ Стабильные превью окружения
- ✅ Информативные комментарии в PR
- ✅ Простота настройки и использования

## Риски и митигации

### Риски:

- Расхождение env между локальным и превью
- Превью «утекают» в паблик
- Высокая стоимость при частых деплоях

### Митигации:

- Централизовать переменные через Doppler
- Включить защиту (password/require login) при необходимости
- Ограничить количество одновременных превью

## Ссылки и заметки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Doppler Integration](https://docs.doppler.com/docs/vercel)

## Статус выполнения

- ✅ GitHub Actions workflow для smoke тестов создан
- ✅ Vercel конфигурация (vercel.json) создана
- ✅ Документация по preview deployments создана
- ✅ Инструкция по настройке Vercel создана
- ✅ README обновлен с разделом Preview Deployments
- ⏳ Vercel проект требует ручной настройки
- ⏳ GitHub App интеграция требует ручной настройки

## Реализованные компоненты

### GitHub Actions Workflow

- **Файл**: `.github/workflows/preview-smoke.yml`
- **Функциональность**:
  - Автоматические smoke тесты для PR
  - Проверка health endpoint и главной страницы
  - Комментарии в PR с preview URL
  - Обновление комментариев при новых коммитах

### Vercel Configuration

- **Файл**: `vercel.json`
- **Функциональность**:
  - Настройка Next.js deployment
  - CORS headers для API
  - Function timeout настройки
  - Rewrite rules

### Документация

- **Preview Deployments Guide**: `docs/preview-deployments.md`
- **Vercel Setup Guide**: `docs/vercel-setup.md`
- **README Updates**: раздел Preview Deployments

### Требуемая ручная настройка

1. **Подключение к Vercel**:
   - Создать проект в Vercel Dashboard
   - Подключить GitHub репозиторий
   - Настроить переменные окружения

2. **GitHub App**:
   - Установить Vercel GitHub App
   - Настроить комментарии в PR

3. **GitHub Secrets**:
   - Добавить `VERCEL_TOKEN`
   - Добавить `VERCEL_TEAM_ID` (опционально)
