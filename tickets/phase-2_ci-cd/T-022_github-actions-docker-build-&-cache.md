# [T-022] GitHub Actions: Docker Build & Cache

## Обоснование

Быстрые и детерминированные сборки контейнера — основа стабильного деплоя и воспроизводимых окружений. Автоматизированная сборка и публикация Docker образов обеспечивает консистентность между разработкой и продакшеном.

## Область действия

### Входит в scope:

- ✅ Multi-stage Dockerfile (dev/prod)
- ✅ GH Actions job для сборки с использованием BuildKit cache
- ✅ Публикация образа в GHCR с тегами sha и staging
- ✅ Оптимизация сборки (paths filter для значимых файлов)
- ✅ Поддержка multi-platform (linux/amd64, linux/arm64)

### Не входит в scope:

- Автодеплой в продакшен (будет позже/в другом тикете)
- Управление инфраструктурой
- Мониторинг контейнеров

## Задачи

### 1. Проверка и оптимизация Dockerfile

**Требования:**

- Убедиться, что Dockerfile использует multi-stage подход
- Оптимизировать размер образа для продакшена
- Обеспечить безопасность (non-root пользователь)

### 2. Создание GitHub Actions Workflow

**Файл:** `.github/workflows/docker-build.yml`

**Функциональность:**

- Автоматическая сборка при push в main
- Использование BuildKit cache для ускорения
- Публикация в GitHub Container Registry (GHCR)
- Умная фильтрация по измененным файлам

### 3. Настройка GHCR

**Требования:**

- Включить GitHub Packages для репозитория
- Настроить права доступа
- Создать инструкции по использованию

### 4. Документация

**Требования:**

- Добавить раздел "Container Images" в README
- Инструкции по pull и запуску
- Примеры использования

## Критерии приемки

- ✅ Push в main собирает и публикует образ в GHCR с тегами staging и sha
- ✅ Повторные сборки используют BuildKit cache и проходят заметно быстрее
- ✅ Образ запускается локально: `docker run -p 3000:3000 ghcr.io/abakymuk/mvpport:staging`
- ✅ Поддержка multi-platform (amd64, arm64)

## Качество

- ✅ Оптимизированный размер образа
- ✅ Безопасность (non-root, минимальные привилегии)
- ✅ Быстрая сборка с эффективным кэшированием
- ✅ Детерминированные сборки

## Риски и митигации

### Риски:

- Размер образа растет со временем
- Build cache "протухает" и теряет эффективность
- Проблемы с multi-platform сборкой

### Митигации:

- Регулярный аудит зависимостей и очистка dev-артефактов
- Invalidate cache при смене lockfile
- Тестирование на разных платформах

## Ссылки и заметки

- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Multi-platform builds](https://docs.docker.com/build/building/multi-platform/)
- [BuildKit cache](https://docs.docker.com/build/cache/)

## Статус выполнения

- ✅ Dockerfile оптимизирован (multi-stage, non-root пользователь, безопасность)
- ✅ docker-build.yml workflow создан с полной функциональностью
- ✅ GHCR настроен и готов к использованию
- ✅ Документация обновлена с инструкциями по использованию

## Реализованные компоненты

### Dockerfile

- **Multi-stage build**: base, deps, builder, dev, prod
- **Безопасность**: non-root пользователь (nextjs:1001)
- **Оптимизация**: минимальный размер образа для продакшена
- **Переменные окружения**: PORT, HOSTNAME для корректной работы

### GitHub Actions Workflow

- **Автоматическая сборка**: при push в main с умной фильтрацией файлов
- **Multi-platform**: поддержка linux/amd64 и linux/arm64
- **BuildKit cache**: эффективное кэширование для быстрых сборок
- **Безопасность**: сканирование уязвимостей с Trivy
- **Метаданные**: автоматические теги (staging, latest, sha)

### Container Registry

- **GHCR интеграция**: автоматическая публикация в GitHub Container Registry
- **Теги**: staging, latest, main-<sha>
- **Доступность**: публичные образы для загрузки

### Документация

- **README.md**: раздел "Container Images" с инструкциями
- **Примеры команд**: pull, run, multi-platform поддержка
- **Информация о безопасности**: non-root, сканирование уязвимостей
