# Row Level Security (RLS) Guide

Руководство по Row Level Security в проекте MVP Port.

## Обзор

Row Level Security (RLS) обеспечивает изоляцию данных между организациями в мультитенантном приложении. Каждый пользователь видит только те данные, к которым у него есть доступ через членство в организациях.

## Архитектура безопасности

### Принципы

1. **Изоляция по организациям**: Данные изолированы на уровне организаций
2. **Аутентификация через Supabase**: Используется Supabase Auth для идентификации пользователей
3. **Авторизация через RLS**: PostgreSQL RLS политики контролируют доступ к данным
4. **Роли и разрешения**: Различные роли предоставляют разные уровни доступа

### Роли пользователей

- **VIEWER**: Только чтение данных организации
- **MEMBER**: Чтение + создание некоторых данных
- **ADMIN**: Полный доступ к данным организации (кроме удаления org)
- **OWNER**: Полный контроль над организацией

## Схема базы данных

### Таблицы с RLS

Все основные таблицы имеют включенный RLS:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
```

### Вспомогательные функции

#### `auth.user_id()`

Получает текущий ID пользователя из JWT токена Supabase.

#### `is_member(org_id, required_role)`

Проверяет, является ли пользователь членом организации с определенной ролью или выше.

```sql
SELECT public.is_member('org-123', 'ADMIN'); -- true для ADMIN и OWNER
```

#### `is_owner(org_id)`

Проверяет, является ли пользователь владельцем организации.

#### `can_manage(org_id)`

Проверяет, может ли пользователь управлять организацией (ADMIN или OWNER).

#### `get_user_orgs()`

Возвращает список организаций пользователя с ролями.

## RLS Политики

### Profiles

```sql
-- Пользователи видят только свой профиль
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.user_id());

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.user_id());
```

### Organizations

```sql
-- Члены организации могут видеть информацию об организации
CREATE POLICY "Organization members can view org" ON public.orgs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = orgs.id
        AND m.user_id = auth.user_id()
    )
  );

-- Только владельцы могут обновлять организацию
CREATE POLICY "Only owners can update org" ON public.orgs
  FOR UPDATE USING (is_owner(orgs.id));
```

### Memberships

```sql
-- Члены организации могут видеть всех участников
CREATE POLICY "Org members can view memberships" ON public.memberships
  FOR SELECT USING (is_member(memberships.org_id));

-- Админы и владельцы могут управлять участниками
CREATE POLICY "Admins can manage memberships" ON public.memberships
  FOR ALL USING (can_manage(memberships.org_id));
```

## API с поддержкой RLS

### Использование в коде

#### Создание клиента с RLS

```typescript
import { createPrismaClientWithRLS, OrgService } from '@/lib/prisma-rls';

const { prisma, userId } = await createPrismaClientWithRLS();
const orgService = new OrgService(prisma, userId);
```

#### Работа с организациями

```typescript
// Получить организации пользователя (автоматически фильтруется по RLS)
const orgs = await orgService.getUserOrgs();

// Создать организацию
const newOrg = await orgService.createOrg({ name: 'My Organization' });

// Пригласить участника (только для админов/владельцев)
await orgService.inviteMember(orgId, userId, 'MEMBER');
```

### API Endpoints

#### `GET /api/orgs`

Возвращает организации, к которым у пользователя есть доступ.

#### `POST /api/orgs`

Создает новую организацию. Автоматически делает создателя владельцем.

#### `GET /api/orgs/[orgId]`

Возвращает информацию об организации (только для участников).

#### `PATCH /api/orgs/[orgId]`

Обновляет организацию (только для владельцев).

#### `POST /api/orgs/[orgId]/members`

Приглашает нового участника (только для админов/владельцев).

#### `GET /api/profile`

Возвращает профиль текущего пользователя.

#### `PATCH /api/profile`

Обновляет профиль текущего пользователя.

## Тестирование RLS

### Запуск тестов

```sql
-- Запуск SQL тестов
\i supabase/rls-tests.sql
```

### Тестовые сценарии

1. **Изоляция данных**: Пользователь A не видит данные организации B
2. **Роли и разрешения**: VIEWER не может писать данные
3. **Владение**: OWNER может управлять всеми данными в своей организации
4. **Вспомогательные функции**: Корректная работа `is_member()`, `is_owner()` и других

## Безопасность

### Принципы безопасности

1. **Принцип минимальных привилегий**: Пользователи получают только необходимые права
2. **Защита в глубину**: RLS работает на уровне БД, независимо от приложения
3. **Аудит доступа**: Все операции логируются
4. **Валидация входных данных**: Все API endpoints валидируют входные данные

### Потенциальные уязвимости

1. **Обход RLS**: Никогда не отключайте RLS в продакшене
2. **Утечка данных через агрегацию**: Будьте осторожны с COUNT и другими агрегирующими функциями
3. **Инъекции**: Используйте параметризованные запросы
4. **Логирование**: Не логируйте чувствительные данные

## Производительность

### Оптимизация

1. **Индексы**: Создайте индексы на поля, используемые в RLS политиках
2. **Кэширование**: Кэшируйте результаты `is_member()` на уровне приложения
3. **Мониторинг**: Отслеживайте производительность запросов с RLS

### Рекомендуемые индексы

```sql
-- Индекс для быстрого поиска членства
CREATE INDEX idx_memberships_user_org ON public.memberships(user_id, org_id);

-- Индекс для фильтрации по организациям
CREATE INDEX idx_memberships_org_role ON public.memberships(org_id, role);
```

## Миграция и развертывание

### Применение RLS политик

```bash
# В development
psql $DATABASE_URL -f supabase/rls-policies.sql

# В production
# Используйте миграции Supabase или аналогичный инструмент
```

### Проверка после развертывания

1. Запустите RLS тесты
2. Проверьте работу API endpoints
3. Убедитесь, что изоляция данных работает корректно

## Troubleshooting

### Частые проблемы

#### Пользователь не видит данные

1. Проверьте, что RLS включен для таблицы
2. Убедитесь, что пользователь аутентифицирован
3. Проверьте членство в организации

#### Ошибки доступа при записи

1. Проверьте роль пользователя
2. Убедитесь, что политики UPDATE/INSERT настроены
3. Проверьте ограничения на уровне приложения

#### Низкая производительность

1. Добавьте необходимые индексы
2. Оптимизируйте RLS политики
3. Рассмотрите кэширование на уровне приложения

## Полезные ссылки

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-tenant Patterns](https://docs.microsoft.com/en-us/azure/sql-database/saas-tenancy-app-design-patterns)
