# Prisma Guide

Руководство по работе с Prisma в проекте MVP Port.

## Установка и настройка

Prisma уже установлен и настроен в проекте. Основные файлы:

- `prisma/schema.prisma` - схема базы данных
- `prisma/seed.ts` - seed данные
- `lib/prisma.ts` - клиент Prisma

## Команды

### Основные команды

```bash
# Генерация Prisma клиента
pnpm db:generate

# Синхронизация схемы с БД (без миграций)
pnpm db:push

# Создание и применение миграций
pnpm db:migrate

# Заполнение БД тестовыми данными
pnpm db:seed

# Запуск Prisma Studio (GUI для БД)
pnpm db:studio
```

### Дополнительные команды

```bash
# Сброс базы данных (удаляет все данные!)
pnpm prisma migrate reset

# Просмотр статуса миграций
pnpm prisma migrate status

# Создание новой миграции
pnpm prisma migrate dev --name migration_name

# Применение миграций в продакшене
pnpm prisma migrate deploy
```

## Схема базы данных

### Модели

#### Profile

```prisma
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  displayName String?
  avatarUrl   String?
  locale      String?  @default("en")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memberships Membership[]
}
```

#### Org

```prisma
model Org {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships Membership[]
}
```

#### Membership

```prisma
model Membership {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())

  org     Org     @relation(fields: [orgId], references: [id])
  profile Profile @relation(fields: [userId], references: [userId])

  @@unique([userId, orgId])
}
```

#### Role Enum

```prisma
enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

## Использование в коде

### Импорт клиента

```typescript
import { prisma } from '@/lib/prisma';
```

### Примеры запросов

#### Получение всех организаций с участниками

```typescript
const orgs = await prisma.org.findMany({
  include: {
    memberships: {
      include: {
        profile: true,
      },
    },
  },
});
```

#### Создание нового профиля

```typescript
const profile = await prisma.profile.create({
  data: {
    userId: 'user-id',
    displayName: 'User Name',
    locale: 'ru',
  },
});
```

#### Обновление профиля

```typescript
const profile = await prisma.profile.update({
  where: { userId: 'user-id' },
  data: {
    displayName: 'New Name',
  },
});
```

#### Создание организации с владельцем

```typescript
const org = await prisma.org.create({
  data: {
    name: 'Organization Name',
    ownerId: 'user-id',
    memberships: {
      create: {
        userId: 'user-id',
        role: 'OWNER',
      },
    },
  },
});
```

## API Endpoints

### `/api/prisma-test`

Тестовый endpoint для проверки работы Prisma.

**GET** - возвращает данные из всех таблиц:

```json
{
  "success": true,
  "data": {
    "profiles": [...],
    "orgs": [...],
    "totalProfiles": 2,
    "totalOrgs": 2,
    "totalMemberships": 3
  }
}
```

## Seed данные

Seed файл (`prisma/seed.ts`) создает:

- 2 demo пользователей
- 2 demo организации
- Соответствующие членства

Для запуска seed данных:

```bash
pnpm db:seed
```

## Интеграция с Supabase

Prisma работает с PostgreSQL базой данных Supabase. Убедитесь, что:

1. `DATABASE_URL` настроен в переменных окружения
2. База данных доступна
3. Схема синхронизирована

## Troubleshooting

### Ошибка подключения к БД

1. Проверьте `DATABASE_URL` в `.env`
2. Убедитесь, что база данных запущена
3. Проверьте права доступа

### Ошибки миграций

1. Сбросьте базу: `pnpm prisma migrate reset`
2. Примените миграции заново: `pnpm db:migrate`

### Ошибки типов

1. Перегенерируйте клиент: `pnpm db:generate`
2. Проверьте схему на ошибки

## Полезные ссылки

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma Studio](https://www.prisma.io/docs/concepts/tools/prisma-studio)
