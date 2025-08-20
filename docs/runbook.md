# Runbook

Операционные процедуры для разработки и развертывания MVP Port.

## Быстрый старт

### Локальная разработка

```bash
# Клонирование репозитория
git clone git@github.com:abakymuk/mvpport.git
cd mvpport

# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Docker (рекомендуется)

```bash
# Запуск всей среды разработки
docker compose up -d

# Просмотр логов всех сервисов
docker compose logs -f

# Просмотр логов конкретного сервиса
docker compose logs -f web
docker compose logs -f db
docker compose logs -f mailhog

# Остановка всех сервисов
docker compose down

# Остановка с удалением данных
docker compose down -v
```

**Управление сервисами:**

```bash
# Запуск только web сервиса
docker compose up web

# Перезапуск сервиса
docker compose restart web

# Пересборка и запуск
docker compose up --build

# Просмотр статуса
docker compose ps
```

## Разработка

### Команды разработки

```bash
# Запуск сервера разработки
pnpm dev

# Сборка для продакшена
pnpm build

# Запуск продакшен сервера
pnpm start

# Проверка кода
pnpm lint

# Проверка типов
pnpm typecheck

# Форматирование кода
pnpm format
```

### Обновление зависимостей

```bash
# Проверка устаревших пакетов
pnpm outdated

# Обновление всех зависимостей
pnpm update

# Обновление конкретного пакета
pnpm update package-name

# Обновление до последних версий
pnpm update --latest
```

### База данных (Prisma)

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

**Важные команды:**

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

### Регенерация клиентов

```bash
# Регенерация Prisma клиента
pnpm prisma generate

# Регенерация TypeScript типов
pnpm typecheck
```

## База данных

### Миграции (после T-013)

```bash
# Создание новой миграции
pnpm prisma migrate dev --name migration-name

# Применение миграций
pnpm prisma migrate deploy

# Сброс базы данных (только для разработки)
pnpm prisma migrate reset

# Просмотр статуса миграций
pnpm prisma migrate status
```

### Сиды

```bash
# Запуск сидов
pnpm prisma db seed

# Сброс и повторный запуск сидов
pnpm prisma migrate reset
```

### Сброс данных

```bash
# Полный сброс базы данных
pnpm prisma migrate reset --force

# Очистка кэша
rm -rf .next
rm -rf node_modules/.cache
```

## Мониторинг и логи

### Health Check

```bash
# Проверка состояния приложения
curl http://localhost:3000/api/health

# Ожидаемый ответ
{
  "status": "ok",
  "version": "0.1.0"
}
```

### Логи

```bash
# Просмотр логов разработки
pnpm dev

# Логи в продакшене (после настройки)
docker logs container-name
```

## Устранение неполадок

### Частые проблемы

#### 1. Ошибки TypeScript

```bash
# Очистка кэша TypeScript
rm -rf .next
rm -rf node_modules/.cache
pnpm typecheck
```

#### 2. Проблемы с зависимостями

```bash
# Очистка и переустановка
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 3. Проблемы с Turbopack

```bash
# Отключение Turbopack
pnpm dev --no-turbopack

# Или использование стандартного webpack
pnpm dev --no-turbo
```

#### 4. Проблемы с Prisma

```bash
# Регенерация клиента
pnpm prisma generate

# Сброс базы данных
pnpm prisma migrate reset
```

#### 5. Проблемы с Docker

```bash
# Очистка Docker кэша
docker system prune -a

# Пересборка образов
docker compose build --no-cache

# Сброс данных контейнеров
docker compose down -v
docker compose up -d

# Проверка логов
docker compose logs web
docker compose logs db
docker compose logs mailhog
```

#### 6. Проблемы с портами

```bash
# Проверка занятых портов
lsof -i :3000
lsof -i :5432
lsof -i :8025

# Убийство процессов на портах
kill -9 $(lsof -t -i:3000)
```

### Очистка окружения

```bash
# Полная очистка
rm -rf .next
rm -rf node_modules
rm -rf .turbo
rm pnpm-lock.yaml

# Переустановка
pnpm install
```

## Развертывание

### Подготовка к продакшену

```bash
# Сборка приложения
pnpm build

# Проверка сборки
pnpm start
```

### Переменные окружения

#### Локальная разработка

Создайте `.env.local` для локальной разработки:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=MVP Port
```

#### Docker разработка

Скопируйте `env.docker.example` в `.env.docker`:

```bash
cp env.docker.example .env.docker
```

Основные переменные для Docker:

```env
# База данных (настроена автоматически)
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db

# Email (Mailhog)
SMTP_HOST=mailhog
SMTP_PORT=1025

# Приложение
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=MVP Port
```

### Docker развертывание

```bash
# Сборка образа
docker build -t mvpport:latest .

# Запуск с переменными окружения
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_APP_NAME="MVP Port" \
  mvpport:latest
```

## Почтовый сервис (после T-011)

### Mailhog

```bash
# Запуск Mailhog через Docker
docker run -d \
  --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog

# Доступ к веб-интерфейсу
open http://localhost:8025
```

### Сброс почтового ящика

```bash
# Остановка Mailhog
docker stop mailhog

# Удаление контейнера
docker rm mailhog

# Перезапуск
docker run -d \
  --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog
```

## Полезные команды

### Git

```bash
# Очистка веток
git branch --merged | grep -v main | xargs git branch -d

# Сброс к последнему коммиту
git reset --hard HEAD

# Очистка неотслеживаемых файлов
git clean -fd
```

### Система

```bash
# Проверка портов
lsof -i :3000

# Убийство процесса
kill -9 $(lsof -t -i:3000)

# Мониторинг ресурсов
htop
```

## Контакты

- **Разработка**: [GitHub Issues](https://github.com/abakymuk/mvpport/issues)
- **Документация**: [README.md](README.md)
- **ADR**: [docs/adr/README.md](docs/adr/README.md)
