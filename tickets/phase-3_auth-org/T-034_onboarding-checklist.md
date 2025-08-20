# [T-034] Onboarding Checklist & Empty States

## 📋 Overview

**Why:** Ускоряем «Time To First Value». Чёткий чеклист и грамотные пустые состояния направляют пользователя к ключевым действиям.

**Priority:** High  
**Status:** ✅ Completed  
**Assignee:** Development Team  
**Estimate:** 3-4 days  
**Completed:** 2024-01-XX

## 🎯 Scope

### ✅ Входит в scope:

- **Модель онбординга:** хранение статусов шагов (profiles.onboarding_state JSON)
- **Чеклист (4-6 шагов):**
  1. Создать организацию
  2. Заполнить профиль (имя/аватар)
  3. Пригласить коллегу
  4. (Опц.) Подключить интеграцию/демо-данные
  5. Перейти на Dashboard и увидеть первые KPI
- **Виджет прогресса** на /dashboard (shadcn Card + Progress)
- **Пустые состояния списков** → CTA кнопки (Create org / Invite member / View demo data)
- **Кнопка «View demo data»** (создаёт demo-org или сидит данные в текущую)

### ❌ Out of scope:

- Полноценный туториал в несколько экранов
- Продуктовый тур (можно добавить позже)

## 🏗️ Technical Implementation

### 1. Структура хранения

```sql
-- profiles.onboarding_state JSON:
{
  "created_org": true,
  "completed_profile": false,
  "invited_member": false,
  "viewed_dashboard": true,
  "connected_integration": false,
  "viewed_demo_data": false
}
```

### 2. Хелперы для отметки шага

```typescript
export async function markOnboardingStep(
  userId: string,
  key: string,
  value = true
) {
  // update JSON
}
```

### 3. Виджет в /dashboard

- Карточка «Getting started» с Progress и списком шагов
- Кнопки: «Create organization», «Invite member», «Upload logo»/«Complete profile», «Add demo data»

### 4. Пустые состояния

- Если !orgs.length → экран «Create your first organization»
- Если members.length === 1 → блок с CTA «Invite your first teammate»

### 5. Demo-data

- Серверный action POST /api/demo/seed — добавить безопасные демонстрационные записи под org_id
- UI: «View demo data» → подтверждение → сид → перезагрузка карточек KPI

### 6. События аналитики

- onboarding_step_completed
- onboarding_viewed
- demo_seeded

## ✅ Acceptance Criteria

- [x] Новый пользователь видит чеклист с 4-6 шагами
- [x] Выполнение шага обновляет прогресс (persist)
- [x] Пустые состояния содержат понятный CTA
- [x] Кнопка «View demo data» работает и заполняет дашборд
- [x] В аналитике фиксируются события завершения шагов

## ⚠️ Risks & Mitigations

| Risk                             | Mitigation                                                 |
| -------------------------------- | ---------------------------------------------------------- |
| Слишком сложный онбординг        | 4-6 шагов максимум; каждый — ≤1 клик                       |
| Конфликт демо-данных с реальными | Всегда помечать is_demo и позволить быстро «очистить демо» |

## 🔗 Notes/Links

- Совместимо с Phase 4 (Dashboard) и Phase 7 (analytics)
- Интегрируется с существующей системой приглашений
- **Документация:** `docs/onboarding-system.md`
- **SQL миграция:** `supabase/add-onboarding-state.sql`
- **Тесты:** `scripts/test-onboarding.sh`

## 🎉 Реализованные функции

### ✅ Backend

- [x] API для получения шагов онбординга
- [x] API для отметки выполненных шагов
- [x] API для загрузки демо-данных
- [x] API для аналитики событий
- [x] Автоматическое определение выполненных шагов
- [x] SQL функции для работы с онбордингом

### ✅ Frontend

- [x] Виджет онбординга с прогрессом
- [x] Пустые состояния для разных разделов
- [x] Компонент демо-данных
- [x] Интеграция в дашборд
- [x] Интерактивные кнопки действий

### ✅ База данных

- [x] Поле onboarding_state в profiles
- [x] Таблица analytics_events
- [x] Индексы для производительности
- [x] RLS политики для безопасности

### ✅ Аналитика

- [x] Отслеживание событий онбординга
- [x] Логирование в консоль
- [x] Сохранение в базу данных
- [x] Готовность к интеграции с внешними сервисами

---

**Created:** 2024-01-XX  
**Updated:** 2024-01-XX  
**Version:** 1.0
