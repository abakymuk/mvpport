# [T-013] Prisma + Migrations

## Обоснование

Prisma позволяет безопасно управлять схемой БД и миграциями. Это ключ к стабильной эволюции базы данных.

## Область действия

### Входит в scope:

- ✅ Установить prisma и @prisma/client
- ✅ Настроить DATABASE_URL в .env
- ✅ Создать schema: profiles, orgs, memberships
- ✅ Настроить миграции и seed

### Не входит в scope:

- Сложные отношения между таблицами
- Оптимизация производительности запросов
- Полнотекстовый поиск

## Задачи

### 1. Установка и инициализация

**Требования:**

- Установить Prisma CLI и клиент
- Инициализировать Prisma проект
- Настроить подключение к базе данных

**Команды:**

```bash
pnpm add prisma @prisma/client
pnpm prisma init
```

### 2. Создание схемы

**Модели для создания:**

- **Profile**: id, userId, displayName, avatar, locale
- **Org**: id, name, ownerId
- **Membership**: id, userId, orgId, role

### 3. Миграции

**Требования:**

- Создать первую миграцию
- Настроить автоматическое применение миграций
- Проверить корректность создания таблиц

**Команды:**

```bash
pnpm prisma migrate dev --name init
```

### 4. Seed данные

**Требования:**

- Создать seed.ts с demo данными
- Настроить автоматический запуск seed
- Создать demo-org и demo-user

## Критерии приемки

- ✅ `pnpm prisma migrate dev` работает и создаёт таблицы
- ✅ `pnpm prisma db seed` создаёт demo-org и demo-user
- ✅ Next.js API может читать эти данные

## Качество

- ✅ Правильные типы для TypeScript
- ✅ Валидация данных в моделях
- ✅ Корректные отношения между таблицами
- ✅ Безопасность миграций

## Ссылки и заметки

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Seed](https://www.prisma.io/docs/guides/database/seed-database)

## Статус выполнения

- ✅ Prisma установлен и настроен
- ✅ Схема базы данных создана (profiles, orgs, memberships)
- ✅ Миграции настроены
- ✅ Seed данные созданы
- ✅ API endpoint для тестирования создан (/api/prisma-test)
- ✅ Компонент для отображения данных создан (OrgsList)
- ✅ Интеграция с dashboard завершена

## Реализованные компоненты

### База данных

- **Profile**: id, userId, displayName, avatarUrl, locale, timestamps
- **Org**: id, name, ownerId, timestamps
- **Membership**: id, userId, orgId, role (OWNER/ADMIN/MEMBER/VIEWER)
- **Отношения**: Profile ↔ Membership ↔ Org

### API

- `/api/prisma-test` - тестовый endpoint для проверки работы Prisma

### Скрипты

- `pnpm db:generate` - генерация Prisma клиента
- `pnpm db:push` - синхронизация схемы с БД
- `pnpm db:migrate` - создание и применение миграций
- `pnpm db:seed` - заполнение БД тестовыми данными
- `pnpm db:studio` - запуск Prisma Studio
