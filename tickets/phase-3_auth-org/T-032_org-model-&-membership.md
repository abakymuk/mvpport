# [T-032] Org model & membership (RBAC + переключатель орг)

## 🎯 Цель

Мульти-тенантность — основа B2B. Пользователь может состоять в нескольких организациях, роли определяют доступ.

## 📋 Scope (входит)

### ✅ Реализовано

- [x] Таблицы: orgs, memberships (есть в Prisma базис)
- [x] Роли: OWNER, ADMIN, MEMBER, VIEWER
- [x] Базовые API endpoints для организаций
- [x] RLS политики для безопасности

### 🔄 Требует реализации

- [ ] Контекст текущей организации: хранение active_org_id у пользователя
- [ ] UI переключателя организаций в сайдбаре
- [ ] Серверные проверки доступа к данным
- [ ] Страницы: /settings/organization, /members
- [ ] Создание новых организаций

## 🚫 Out of scope

- Трансфер владения и архив/удаление org (можно добавить позже)
- Ограничения тарифа по кол-ву org (для биллинга позже)

## 📝 Tasks

### 1. Prisma модели

- [x] Убедиться, что модели соответствуют схеме
- [x] Миграции + сид демо‑данных
- [ ] Добавить поле active_org_id в профиль пользователя

### 2. Контекст организации

- [ ] Создать lib/org.ts с функциями управления активной организацией
- [ ] Реализовать getActiveOrgId и setActiveOrgId
- [ ] Добавить middleware для проверки членства

### 3. UI компоненты

- [ ] Переключатель организаций в сайдбаре
- [ ] Страница /settings/organization
- [ ] Страница /members с таблицей участников
- [ ] Форма создания новой организации

### 4. Серверные проверки

- [ ] Создать lib/access.ts с функциями проверки доступа
- [ ] Добавить assertMember функцию
- [ ] Интегрировать проверки в API endpoints

## ✅ Acceptance Criteria

### Реализовано

- [x] Модели данных для организаций и членства
- [x] RLS политики для безопасности данных

### Требует реализации

- [ ] Пользователь может создать новую org, стать её OWNER
- [ ] Переключать текущую org через сайдбар; выбранная org сохраняется и восстанавливается при входе
- [ ] Страница Members показывает участников и их роли (read‑only, до инвайтов)
- [ ] Любой API требует org_id и валидирует, что пользователь — член этой org

## ⚠️ Risks & Mitigations

### Решенные проблемы

- [x] RLS политики настроены для безопасности данных
- [x] Модели данных соответствуют требованиям

### Потенциальные риски

- Дублирование логики с RLS → оставить проверки на сервере, а RLS — как «последнюю линию обороны»
- Ошибки с «активной org» (теряется) → хранить в профиле и в cookie/URL (?org=...) как запасной вариант

## 📚 Notes/Links

- Совместимо с T‑014 (RLS)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

## 🔧 Текущая реализация

### Структура данных

```sql
-- Организации
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Членство в организациях
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  org_id UUID NOT NULL REFERENCES public.orgs(id),
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);
```

### API Endpoints

- `GET /api/orgs` - список организаций пользователя
- `GET /api/orgs/[orgId]` - информация об организации
- `PATCH /api/orgs/[orgId]` - обновление организации
- `GET /api/orgs/[orgId]/members` - список участников
- `POST /api/orgs/[orgId]/members` - добавление участника

### RLS Политики

- Пользователи видят только организации, в которых состоят
- Владельцы могут управлять организацией
- Администраторы могут управлять участниками

## 🚀 Следующие шаги

### 1. Добавить поле active_org_id в профиль

```sql
ALTER TABLE public.profiles ADD COLUMN active_org_id UUID REFERENCES public.orgs(id);
```

### 2. Создать lib/org.ts

```typescript
export async function getActiveOrgId(userId: string) {
  // Чтение из профиля или первой организации
}

export async function setActiveOrgId(userId: string, orgId: string) {
  // Обновление профиля
}
```

### 3. Создать lib/access.ts

```typescript
export async function assertMember(
  orgId: string,
  minRole: 'VIEWER' | 'MEMBER' | 'ADMIN' | 'OWNER'
) {
  // Проверка членства и роли
}
```

### 4. UI компоненты

- Переключатель организаций в сайдбаре
- Страницы управления организацией
- Таблица участников

## 🎯 Статус реализации

- ✅ **Модели данных**: Полностью реализовано
- ✅ **RLS политики**: Настроено
- ✅ **API endpoints**: Базовая реализация готова
- 🔄 **UI компоненты**: Требует реализации
- 🔄 **Контекст организации**: Требует реализации
- 🔄 **Серверные проверки**: Требует реализации
