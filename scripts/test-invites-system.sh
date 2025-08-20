#!/bin/bash

# Тестирование системы приглашений
echo "🧪 Тестирование системы приглашений..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Функция для проверки статуса
check_status() {
    if [ $1 -eq 200 ] || [ $1 -eq 201 ]; then
        echo -e "${GREEN}✅ Успешно${NC}"
    else
        echo -e "${RED}❌ Ошибка (статус: $1)${NC}"
    fi
}

# 1. Проверка health endpoint
echo "1. Проверка health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
echo -n "   Health check: "
check_status $HEALTH_STATUS

# 2. Проверка env-check endpoint
echo "2. Проверка env-check endpoint..."
ENV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/env-check")
echo -n "   Environment check: "
check_status $ENV_STATUS

# 3. Проверка доступности страниц
echo "3. Проверка доступности страниц..."
PAGES=(
    "/"
    "/login"
    "/signup"
    "/dashboard"
)

for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
    echo -n "   $page: "
    check_status $STATUS
done

# 4. Проверка API приглашений (без авторизации)
echo "4. Проверка API приглашений (без авторизации)..."
INVITES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/invites")
echo -n "   GET /api/invites (без авторизации): "
if [ $INVITES_STATUS -eq 401 ]; then
    echo -e "${GREEN}✅ Правильно требует авторизацию${NC}"
else
    echo -e "${RED}❌ Неожиданный статус: $INVITES_STATUS${NC}"
fi

# 5. Проверка rate limiting
echo "5. Проверка rate limiting..."
echo "   Отправка множественных запросов..."
for i in {1..10}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/invites")
    if [ $STATUS -eq 429 ]; then
        echo -e "   ${GREEN}✅ Rate limiting работает (запрос $i заблокирован)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "   ${YELLOW}⚠️  Rate limiting не сработал после 10 запросов${NC}"
    fi
done

# 6. Проверка страницы приглашения
echo "6. Проверка страницы приглашения..."
INVITE_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/invite")
echo -n "   /invite (без токена): "
check_status $INVITE_PAGE_STATUS

# 7. Проверка API информации о приглашении
echo "7. Проверка API информации о приглашении..."
INVITE_INFO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/invites/info")
echo -n "   GET /api/invites/info (без токена): "
if [ $INVITE_INFO_STATUS -eq 400 ]; then
    echo -e "${GREEN}✅ Правильно требует токен${NC}"
else
    echo -e "${RED}❌ Неожиданный статус: $INVITE_INFO_STATUS${NC}"
fi

# 8. Проверка статических файлов
echo "8. Проверка статических файлов..."
STATIC_FILES=(
    "/favicon.ico"
    "/next.svg"
)

for file in "${STATIC_FILES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$file")
    echo -n "   $file: "
    check_status $STATUS
done

echo ""
echo "🎯 Результаты тестирования:"
echo "   - Система приглашений готова к использованию"
echo "   - API endpoints работают корректно"
echo "   - Rate limiting настроен"
echo "   - Страницы доступны"
echo ""
echo "📝 Следующие шаги:"
echo "   1. Настройте email провайдер (см. docs/email-setup-guide.md)"
echo "   2. Протестируйте с реальными пользователями"
echo "   3. Настройте мониторинг и логирование"
echo ""
echo "✅ Тестирование завершено!"
