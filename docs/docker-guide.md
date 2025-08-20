# Docker Guide

Руководство по работе с Docker образами проекта MVP Port.

## Обзор

Проект использует multi-stage Dockerfile для оптимизации размера образов и обеспечения безопасности. Образы автоматически собираются и публикуются в GitHub Container Registry (GHCR) при каждом push в main ветку.

## Доступные образы

### GitHub Container Registry

```bash
# Основной образ
ghcr.io/abakymuk/mvpport:staging
ghcr.io/abakymuk/mvpport:latest
ghcr.io/abakymuk/mvpport:main-<sha>
```

### Теги

- `staging` - последняя версия из main ветки
- `latest` - стабильная версия (то же, что staging)
- `main-<sha>` - версия с конкретным коммитом (например: `main-a1b2c3d`)

## Быстрый старт

### Загрузка и запуск

```bash
# Загрузка образа
docker pull ghcr.io/abakymuk/mvpport:staging

# Запуск приложения
docker run -p 3000:3000 ghcr.io/abakymuk/mvpport:staging

# Запуск с переменными окружения
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_SUPABASE_URL="https://..." \
  ghcr.io/abakymuk/mvpport:staging
```

### Проверка работоспособности

```bash
# Проверка health endpoint
curl http://localhost:3000/api/health

# Ожидаемый ответ
{
  "status": "ok",
  "version": "0.1.0"
}
```

## Multi-platform поддержка

Образы поддерживают следующие платформы:

- **linux/amd64** - для x86_64 серверов и десктопов
- **linux/arm64** - для Apple Silicon Mac и ARM серверов

Docker автоматически выберет подходящий образ для вашей платформы.

## Переменные окружения

### Обязательные

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Опциональные

```bash
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"
```

### Пример с .env файлом

```bash
# Создание .env файла
cat > .env << EOF
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# Запуск с .env файлом
docker run -p 3000:3000 --env-file .env ghcr.io/abakymuk/mvpport:staging
```

## Локальная разработка

### Сборка образа

```bash
# Сборка для разработки
docker build --target dev -t mvpport:dev .

# Сборка для продакшена
docker build --target prod -t mvpport:prod .
```

### Docker Compose

```bash
# Запуск всей среды разработки
docker compose up -d

# Просмотр логов
docker compose logs -f web

# Остановка
docker compose down
```

## Безопасность

### Особенности безопасности

- **Non-root пользователь**: приложение запускается от пользователя `nextjs:1001`
- **Минимальный образ**: только необходимые файлы и зависимости
- **Сканирование уязвимостей**: автоматическое сканирование с Trivy
- **Multi-stage build**: разделение build и runtime зависимостей

### Проверка безопасности

```bash
# Сканирование образа на уязвимости
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ghcr.io/abakymuk/mvpport:staging
```

## Troubleshooting

### Проблемы с подключением к базе данных

```bash
# Проверка подключения к БД
docker run --rm ghcr.io/abakymuk/mvpport:staging \
  sh -c "echo \$DATABASE_URL"
```

### Проблемы с портами

```bash
# Проверка занятых портов
docker run --rm ghcr.io/abakymuk/mvpport:staging \
  sh -c "netstat -tlnp"
```

### Логи приложения

```bash
# Просмотр логов
docker logs <container_id>

# Просмотр логов в реальном времени
docker logs -f <container_id>
```

## CI/CD Pipeline

### Автоматическая сборка

Образы автоматически собираются при:

- Push в main ветку
- Изменении файлов: `app/`, `components/`, `lib/`, `prisma/`, `package.json`, `Dockerfile`
- Ручном запуске workflow

### Build Cache

Используется BuildKit cache для ускорения сборок:

- Кэширование слоев между сборками
- Invalidate cache при изменении lockfile
- Оптимизация для multi-platform сборок

### Мониторинг

- [GitHub Actions](https://github.com/abakymuk/mvpport/actions) - статус сборок
- [Container Registry](https://github.com/abakymuk/mvpport/packages) - доступные образы
- [Security tab](https://github.com/abakymuk/mvpport/security) - результаты сканирования

## Производительность

### Размер образа

```bash
# Проверка размера
docker images ghcr.io/abakymuk/mvpport:staging

# Примерный размер: ~200MB (сжатый)
```

### Оптимизации

- Multi-stage build для минимизации размера
- Копирование только необходимых файлов
- Использование Alpine Linux базового образа
- Оптимизация слоев Docker

## Интеграция с Kubernetes

### Пример deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mvpport
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mvpport
  template:
    metadata:
      labels:
        app: mvpport
    spec:
      containers:
        - name: mvpport
          image: ghcr.io/abakymuk/mvpport:staging
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: mvpport-secrets
                  key: database-url
            - name: NEXT_PUBLIC_SUPABASE_URL
              valueFrom:
                secretKeyRef:
                  name: mvpport-secrets
                  key: supabase-url
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

## Ссылки

- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Multi-platform builds](https://docs.docker.com/build/building/multi-platform/)
- [BuildKit cache](https://docs.docker.com/build/cache/)
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)
