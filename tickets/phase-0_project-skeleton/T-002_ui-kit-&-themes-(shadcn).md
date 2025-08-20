# [T-002] UI Kit и темы (shadcn/ui)

## Обоснование

Единый дизайн-язык ускоряет разработку и обеспечивает консистентный UX. shadcn/ui + Tailwind дают быстрый набор доступных компонентов без жёсткой привязки к рантайм-библиотекам.

## Область действия

### Входит в scope:

- ✅ Подключение TailwindCSS к Next.js 15
- ✅ Инициализация shadcn/ui CLI
- ✅ Импорт готовых шаблонов: login-02, sidebar-07
- ✅ Тёмная/светлая темы, системная тема, переключатель в UI
- ✅ Токены: радиус/типографика/spacing, кастомные CSS vars
- ✅ Скелетоны загрузки, базовые Toast/Dialog состояния

### Не входит в scope:

- Полный брендбук/лого
- Персональные темы клиентов
- Компоненты за пределами MVP

## Задачи

### 1. Установка Tailwind и базовая конфигурация

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

**tailwind.config.ts** — включить App Router папки, добавить CSS vars для темы.

### 2. Инициализация shadcn/ui

```bash
npx shadcn@latest init
```

### 3. Добавление шаблонов и компонентов

```bash
npx shadcn@latest add login-02
npx shadcn@latest add sidebar-07
npx shadcn@latest add button input label card dialog dropdown-menu toast skeleton separator avatar
```

### 4. Темизация

- Реализовать переключатель темы (system/light/dark)
- Хранить предпочтение в localStorage, уважать prefers-color-scheme
- На уровне `<html>` переключать `data-theme`

### 5. Вёрстка страниц

**`/login`** на основе login-02 (обработчик submit — заглушка до Auth)

**Базовый каркас приложения `/dashboard`** с sidebar-07:

- Разделы: Dashboard, Settings, Members (заглушки), Help
- Плейсхолдер для аватарки/имени

### 6. Скелетоны и состояния

- Карточки KPI: skeleton при загрузке
- Toast при ошибках и успешных действиях

### 7. Accessibility

- Проверить контраст, focus-visible, aria-лейблы у основных кнопок
- Клавиатурная навигация по сайдбару

## Критерии приемки

- ✅ `/login` визуально соответствует login-02 (+ адаптив)
- ✅ `/dashboard` использует sidebar-07, корректно раскрывает/сворачивает навигацию
- ✅ Переключатель темы работает: system/light/dark, состояние сохраняется
- ✅ Доступность: элементы доступны с клавиатуры; нет критических ошибок в Axe DevTools
- ✅ Skeleton/Toast/Modal доступны и работают в примерах

## Риски и их минимизация

- **Расхождение версий shadcn компонентов** → зафиксировать версии в lockfile
- **Сбои SSR/CSR с темизацией** → рендерить класс темы на сервере (avoid FOUC)

## Ссылки и заметки

- Шаблоны shadcn: login-02, sidebar-07
- Переключатель темы — см. пример из shadcn docs

## Статус выполнения

- ✅ Tailwind CSS установлен и настроен
- ✅ shadcn/ui инициализирован с компонентами
- ✅ Компоненты темы созданы (ThemeToggle, ThemeProvider)
- ✅ Страницы обновлены с новым дизайном
- ✅ **T-002 полностью завершен** ✅
