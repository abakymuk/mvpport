# MVP Port

[![CI](https://github.com/abakymuk/mvpport/actions/workflows/ci.yml/badge.svg)](https://github.com/abakymuk/mvpport/actions/workflows/ci.yml)

Монолитный базис на Next.js 15 (App Router) для быстрого старта проектов.

## Быстрый старт

### Предварительные требования

- Node.js 20.12.2 (указано в `.nvmrc`)
- pnpm 10+

### Установка и запуск

```bash
# Клонирование репозитория
git clone git@github.com:abakymuk/mvpport.git
cd mvpport

# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### Docker (рекомендуется)

```bash
# Запуск всей среды разработки
docker compose up -d

# Просмотр логов
docker compose logs -f web

# Остановка всех сервисов
docker compose down
```

**Доступные сервисы:**

- **Приложение**: http://localhost:3000
- **Mailhog UI**: http://localhost:8025 (просмотр писем)
- **PostgreSQL**: localhost:5432

**Команды для работы с Docker:**

```bash
# Запуск только web сервиса
docker compose up web

# Пересборка образов
docker compose build

# Очистка данных
docker compose down -v

# Просмотр статуса сервисов
docker compose ps
```

### Доступные команды

```bash
pnpm dev          # Запуск сервера разработки
pnpm build        # Сборка для продакшена
pnpm start        # Запуск продакшен сервера
pnpm lint         # Проверка кода ESLint
pnpm typecheck    # Проверка типов TypeScript
pnpm format       # Форматирование кода Prettier

# База данных (Prisma)
pnpm db:generate  # Генерация Prisma клиента
pnpm db:push      # Синхронизация схемы с БД
pnpm db:migrate   # Создание и применение миграций
pnpm db:seed      # Заполнение БД тестовыми данными
pnpm db:studio    # Запуск Prisma Studio
```

### Структура проекта

```
app/
├── api/
│   ├── health/      # Health endpoint
│   └── prisma-test/ # Тест Prisma
├── dashboard/       # Панель управления
├── login/          # Страница входа
└── page.tsx        # Главная страница
config/
└── version.ts      # Версия приложения
components/         # React компоненты
lib/
├── prisma.ts       # Prisma клиент
├── prisma-rls.ts   # Prisma с RLS поддержкой
└── supabase/       # Supabase интеграция
prisma/
├── schema.prisma   # Схема базы данных
└── seed.ts         # Seed данные
supabase/
├── rls-policies.sql # RLS политики
├── rls-tests.sql   # Тесты безопасности
└── schema.sql      # Дополнительная схема
```

### Health Check

Проверка состояния приложения: `GET /api/health`

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

## Разработка

Проект использует:

- **Next.js 15** с App Router
- **TypeScript** в строгом режиме
- **ESLint** + **Prettier** для качества кода
- **Husky** + **lint-staged** для pre-commit хуков

## Архитектурные решения

Важные архитектурные решения документированы в [Architecture Decision Records (ADR)](docs/adr/README.md).

### Правило обновления ADR

**Все существенные архитектурные изменения должны сопровождаться ADR.** Это включает:

- Изменения в архитектуре приложения
- Выбор новых технологий или библиотек
- Изменения в подходе к разработке
- Решения, влияющие на производительность или масштабируемость

### Текущие ADR

- [ADR-0001: Choose Next.js monolith for MVP](docs/adr/0001-monolith-nextjs.md)
- [ADR-0002: Adopt shadcn/ui + Tailwind for UI](docs/adr/0002-ui-shadcn-tailwind.md)

## Troubleshooting

### Частые проблемы

#### Ошибки TypeScript

```bash
# Очистка кэша TypeScript
rm -rf .next
rm -rf node_modules/.cache
pnpm typecheck
```

#### Проблемы с зависимостями

```bash
# Очистка и переустановка
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### Проблемы с Turbopack

```bash
# Отключение Turbopack
pnpm dev --no-turbopack
```

### Дополнительная помощь

- [Runbook](docs/runbook.md) — операционные процедуры
- [CONTRIBUTING.md](CONTRIBUTING.md) — правила участия в разработке
- [GitHub Issues](https://github.com/abakymuk/mvpport/issues) — сообщения о проблемах

## Документация

- [CONTRIBUTING.md](CONTRIBUTING.md) — правила участия в разработке
- [CHANGELOG.md](CHANGELOG.md) — история изменений
- [SECURITY.md](SECURITY.md) — политика безопасности
- [ADR](docs/adr/README.md) — архитектурные решения
- [Runbook](docs/runbook.md) — операционные процедуры
- [Prisma Guide](docs/prisma-guide.md) — работа с базой данных
- [RLS Guide](docs/rls-guide.md) — Row Level Security и безопасность данных

## Следующие шаги

См. документацию в папке `tickets/` для планирования дальнейшей разработки.

## CI/CD Pipeline Test

This section is added to test the GitHub Actions CI/CD pipeline.
