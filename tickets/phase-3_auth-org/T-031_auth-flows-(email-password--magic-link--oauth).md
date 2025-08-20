# [T-031] Auth flows (Email/Password + Magic Link + OAuth)

## 🎯 Цель

Надёжная аутентификация — базис безопасности и персонализации. Supabase покрывает email+пароль, magic link и OAuth, что ускоряет MVP.

## 📋 Scope (входит)

### ✅ Реализовано

- [x] Включить и настроить в Supabase: Email/Password, Email Confirmation
- [x] Клиент в Next.js: @supabase/ssr (browser+server)
- [x] Сессии: чтение на сервере (layout), редиректы гостей/авторизованных
- [x] Защита роутов: middleware/guard для /dashboard и внутренних страниц
- [x] UI интеграция для login (shadcn) — сабмит формы/ошибки
- [x] Страницы: /login, /auth/callback, /logout

### 🔄 Требует доработки

- [ ] Magic Link аутентификация
- [ ] OAuth провайдеры (Google/Apple)
- [ ] Улучшенная обработка ошибок с тостами
- [ ] Страница подтверждения email

## 🚫 Out of scope

- 2FA/Passkeys (в Phase 6/Next)
- SSO Enterprise

## 📝 Tasks

### 1. Supabase настройки

- [x] Включить Email Confirm
- [ ] Включить Magic Link
- [ ] Добавить OAuth провайдеры (Google/Apple)
- [ ] Настроить redirect URL → `https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/auth/callback`

### 2. SDK и клиенты

- [x] Установить и инициализировать SDK
- [x] Создать browser и server клиенты
- [x] Настроить middleware для защиты роутов

### 3. UI компоненты

- [x] Страница /login с email/password
- [ ] Добавить Magic Link форму
- [ ] Добавить OAuth кнопки (Google/Apple)
- [ ] Улучшить обработку ошибок с тостами

### 4. Обработка аутентификации

- [x] /auth/callback: обработка code/state, сохранение сессии
- [x] /logout: вызов supabase.auth.signOut() и редирект
- [ ] Обработать незавершённый email confirm

## ✅ Acceptance Criteria

### Реализовано

- [x] Регистрация/вход по email+пароль работают end‑to‑end
- [x] Негостевые страницы недоступны без сессии (редирект на /login)
- [x] После logout куки очищены, /dashboard редиректит на /login

### Требует реализации

- [ ] Magic Link аутентификация работает end‑to‑end
- [ ] OAuth Google (и/или Apple) успешно логинит и возвращает на /dashboard
- [ ] Показ подсказки «Проверьте почту» при незавершённом email confirm

## ⚠️ Risks & Mitigations

### Решенные проблемы

- [x] Несогласованность cookie имён → используем официальные куки Supabase
- [x] Ошибки OAuth redirect → настроены правильные домены/URL

### Потенциальные риски

- OAuth провайдеры могут требовать дополнительной настройки
- Magic Link может не работать в некоторых email клиентах

## 📚 Notes/Links

- [Supabase Auth + Next.js SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [@supabase/ssr документация](https://supabase.com/docs/reference/javascript/ssr)

## 🔧 Текущая реализация

### Структура файлов

```
lib/supabase/
├── client.ts          # Browser client
├── server.ts          # Server client
├── server-with-cookies.ts  # Server client with cookies
├── middleware.ts      # Auth middleware
└── index.ts           # Exports

components/auth/
├── auth-form.tsx      # Login/signup form
├── user-profile.tsx   # User profile component
└── logout-button.tsx  # Logout functionality

app/
├── login/page.tsx     # Login page
├── signup/page.tsx    # Signup page
├── auth/callback/route.ts  # Auth callback
└── dashboard/         # Protected routes
```

### Статус реализации

- ✅ **Email/Password**: Полностью реализовано
- 🔄 **Magic Link**: Требует реализации
- 🔄 **OAuth**: Требует реализации
- ✅ **Middleware**: Работает
- ✅ **RLS**: Настроено
- ✅ **UI**: Базовая реализация готова
