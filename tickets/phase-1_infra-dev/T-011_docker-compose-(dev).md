# [T-011] Docker Compose (dev)

## Обоснование

Единая команда запуска всей среды разработки (web + db + почта). Это снимает барьер входа для новых разработчиков и упрощает локальное тестирование.

## Область действия

### Входит в scope:

- ✅ `docker-compose.yml` с сервисами:
  - web (Next.js app)
  - db (Postgres 15)
  - mailhog (SMTP + UI)
- ✅ Healthchecks, монтирование кода, автоперезапуск web
- ✅ Документация по запуску

### Не входит в scope:

- Production-ready Compose
- Redis/кэши (добавим позже)

## Задачи

### 1. Создание docker-compose.yml

**Требования:**

- Сервисы: web, db, mailhog
- Проброс портов:
  - web → 3000:3000
  - db → 5432:5432
  - mailhog → 8025:8025 (web UI), 1025:1025 (SMTP)
- Healthchecks для db
- Монтирование кода для hot reload

### 2. Создание Dockerfile

**Требования:**

- Multi-stage build для dev и prod
- Оптимизированный образ для разработки
- Правильная установка зависимостей
- Hot reload поддержка

### 3. Конфигурация сервисов

**Web сервис:**

- Next.js приложение
- Автоперезапуск при изменении кода
- Переменные окружения для подключения к БД

**DB сервис:**

- PostgreSQL 15
- Healthcheck для проверки готовности
- Персистентные данные

**Mailhog сервис:**

- SMTP сервер для разработки
- Web UI для просмотра писем
- Автоматический запуск

### 4. Документация

**Требования:**

- Обновить README.md с инструкциями по запуску
- Добавить команды в runbook.md
- Описать переменные окружения

## Критерии приемки

- ✅ `docker compose up -d` поднимает окружение
- ✅ Приложение доступно на http://localhost:3000
- ✅ Mailhog UI доступен на http://localhost:8025
- ✅ Postgres принимает подключения на 5432

## Качество

- ✅ Все сервисы запускаются без ошибок
- ✅ Hot reload работает для web приложения
- ✅ Healthchecks корректно проверяют состояние сервисов

## Ссылки и заметки

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Mailhog Docker Image](https://hub.docker.com/r/mailhog/mailhog)

## Статус выполнения

- ✅ docker-compose.yml создан и настроен
- ✅ Dockerfile создан с multi-stage build
- ✅ .dockerignore создан для оптимизации
- ✅ Переменные окружения настроены
- ✅ Документация обновлена
- ✅ **T-011 полностью завершен** ✅
