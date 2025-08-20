#!/bin/bash

# Тестовый скрипт для проверки API приглашений
# Использование: ./scripts/test-invites-api.sh

BASE_URL="http://localhost:3000"

echo "🧪 Тестирование API приглашений"
echo "=================================="

# Проверяем, что сервер запущен
echo "1. Проверка доступности сервера..."
if curl -s "$BASE_URL/api/health" > /dev/null; then
    echo "✅ Сервер доступен"
else
    echo "❌ Сервер недоступен. Убедитесь, что pnpm dev запущен"
    exit 1
fi

echo ""
echo "2. Тестирование создания приглашения..."
echo "   POST /api/invites"

# Тест создания приглашения (ожидаем 401 без авторизации)
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/invites" \
  -H "Content-Type: application/json" \
  -d '{"orgId":"test-org-id","email":"test@example.com","role":"MEMBER"}')

HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ API требует авторизацию (ожидаемо)"
else
    echo "⚠️  Неожиданный код ответа: $HTTP_CODE"
    echo "   Тело ответа: $BODY"
fi

echo ""
echo "3. Тестирование получения приглашений..."
echo "   GET /api/invites?orgId=test-org-id"

RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/api/invites?orgId=test-org-id")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ API требует авторизацию (ожидаемо)"
else
    echo "⚠️  Неожиданный код ответа: $HTTP_CODE"
    echo "   Тело ответа: $BODY"
fi

echo ""
echo "4. Тестирование принятия приглашения..."
echo "   POST /api/invites/accept"

RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/invites/accept" \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token"}')

HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ API требует авторизацию (ожидаемо)"
else
    echo "⚠️  Неожиданный код ответа: $HTTP_CODE"
    echo "   Тело ответа: $BODY"
fi

echo ""
echo "✅ Тестирование завершено!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Выполните SQL скрипт в Supabase Dashboard:"
echo "   supabase/create-invites-table.sql"
echo ""
echo "2. Откройте http://localhost:3000/dashboard/members"
echo "3. Войдите в систему и попробуйте создать приглашение"
echo ""
echo "🔗 Документация: docs/invitations-system.md"
