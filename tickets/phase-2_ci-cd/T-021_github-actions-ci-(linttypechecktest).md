# [T-021] GitHub Actions: CI (lint + typecheck + test)

## Обоснование

Жёсткие гейты качества на каждом PR предотвращают регрессии и поддерживают единый стандарт кода с первого дня. Автоматизированная проверка кода обеспечивает стабильность и качество проекта.

## Область действия

### Входит в scope:

- ✅ Workflow ci.yml на push и pull_request
- ✅ Узлы: setup Node + pnpm, install, lint, typecheck, test
- ✅ Кэш зависимостей pnpm
- ✅ Артефакты отчётов (coverage, если есть тесты)
- ✅ Минимальный badge статуса в README

### Не входит в scope:

- E2E/Playwright (позже)
- Сборка Docker (в T-022)
- Развертывание (в других задачах)

## Задачи

### 1. Создание GitHub Actions Workflow

**Требования:**

- Автоматический запуск на push в main и pull requests
- Использование последних версий actions
- Оптимизация с кэшированием

**Файл:** `.github/workflows/ci.yml`

### 2. Настройка скриптов в package.json

**Требования:**

- Убедиться, что есть все необходимые скрипты
- Настроить тестовый фреймворк (если тестов нет, использовать --if-present)
- Добавить coverage отчеты

### 3. Добавление CI Badge

**Требования:**

- Badge в README.md отображает текущий статус CI
- Корректная ссылка на workflow

### 4. Обновление PR Template

**Требования:**

- Добавить чек-лист для проверки качества кода
- Включить проверки: линтер, типы, тесты, ADR

## Критерии приемки

- ✅ Любой PR запускает CI и блокируется при ошибках lint/typecheck/test
- ✅ Кэш pnpm сокращает время сборки на повторных прогонах
- ✅ Coverage-артефакт (если тесты есть) доступен в Actions
- ✅ Бейдж в README отображает текущее состояние CI

## Качество

- ✅ Workflow использует последние стабильные версии actions
- ✅ Оптимизированное кэширование для быстрой сборки
- ✅ Понятные сообщения об ошибках
- ✅ Надежная обработка ошибок

## Риски и митигации

### Риски:

- Долгий install на холодном кэше
- Типизация падает из-за внешних типов
- Flaky тесты блокируют CI

### Митигации:

- pnpm cache + lockfile для быстрой установки
- Временно ослабить strict в проблемных местах, но не в CI
- Настроить retry для нестабильных тестов

## Ссылки и заметки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm GitHub Action](https://github.com/pnpm/action-setup)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoveragefrom-array)

## Статус выполнения

- ✅ GitHub Actions workflow создан (.github/workflows/ci.yml)
- ✅ Тестовый фреймворк настроен (Vitest + Testing Library)
- ✅ CI badge добавлен в README.md
- ✅ PR template обновлен с чек-листом качества

## Реализованные компоненты

### GitHub Actions Workflow

- **Два job'а**: quality (основные проверки) и security (дополнительные проверки безопасности)
- **Кэширование**: pnpm store и node_modules для быстрой сборки
- **Артефакты**: coverage reports и test results
- **Безопасность**: audit зависимостей и проверка на утечки секретов

### Тестовый фреймворк

- **Vitest**: быстрый тестовый фреймворк с поддержкой TypeScript
- **Testing Library**: утилиты для тестирования React компонентов
- **Coverage**: автоматическая генерация отчетов о покрытии
- **Mocks**: настройки для Next.js router, image и других компонентов

### Скрипты package.json

- `pnpm test` - запуск тестов
- `pnpm test:watch` - запуск тестов в режиме watch
- `pnpm test:ui` - запуск UI для тестов
- `pnpm test:coverage` - запуск тестов с отчетом о покрытии

### Конфигурация

- **vitest.config.ts** - основная конфигурация тестов
- **vitest.setup.ts** - настройки окружения и моков
- ****tests**/health.test.ts** - пример теста
