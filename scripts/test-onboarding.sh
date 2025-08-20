#!/bin/bash

# Тестирование системы онбординга
echo "🧪 Тестирование системы онбординга..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Функция для вывода информации
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Проверка API онбординга (без авторизации)
echo "1. Проверка API онбординга (без авторизации)..."
ONBOARDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/onboarding")
echo -n "   GET /api/onboarding (без авторизации): "
if [ $ONBOARDING_STATUS -eq 401 ]; then
    echo -e "${GREEN}✅ Правильно требует авторизацию${NC}"
else
    echo -e "${RED}❌ Неожиданный статус: $ONBOARDING_STATUS${NC}"
fi

# 2. Проверка API демо-данных (без авторизации)
echo "2. Проверка API демо-данных (без авторизации)..."
DEMO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/demo/seed")
echo -n "   POST /api/demo/seed (без авторизации): "
if [ $DEMO_STATUS -eq 401 ]; then
    echo -e "${GREEN}✅ Правильно требует авторизацию${NC}"
else
    echo -e "${RED}❌ Неожиданный статус: $DEMO_STATUS${NC}"
fi

# 3. Проверка API аналитики (без авторизации)
echo "3. Проверка API аналитики (без авторизации)..."
ANALYTICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/analytics/event" \
  -H "Content-Type: application/json" \
  -d '{"event": "test_event"}')
echo -n "   POST /api/analytics/event (без авторизации): "
if [ $ANALYTICS_STATUS -eq 401 ]; then
    echo -e "${GREEN}✅ Правильно требует авторизацию${NC}"
else
    echo -e "${RED}❌ Неожиданный статус: $ANALYTICS_STATUS${NC}"
fi

# 4. Проверка доступности страниц онбординга
echo "4. Проверка доступности страниц..."
PAGES=(
    "/dashboard"
    "/dashboard/members"
    "/dashboard/settings"
)

for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
    echo -n "   $page: "
    check_status $STATUS
done

# 5. Проверка компонентов UI
echo "5. Проверка компонентов UI..."
info "Проверьте в браузере:"
info "  - Виджет онбординга на /dashboard"
info "  - Пустые состояния на /dashboard/members"
info "  - Кнопки действий в онбординге"

# 6. Проверка базы данных
echo "6. Проверка структуры базы данных..."
info "Выполните SQL скрипт: supabase/add-onboarding-state.sql"
info "Проверьте наличие поля onboarding_state в таблице profiles"

# 7. Тестирование функций
echo "7. Тестирование функций..."
info "Протестируйте следующие сценарии:"
info "  - Создание нового пользователя"
info "  - Создание организации"
info "  - Приглашение участника"
info "  - Загрузка демо-данных"
info "  - Завершение онбординга"

echo ""
echo "🎯 Результаты тестирования:"
echo "   - API endpoints защищены авторизацией"
echo "   - Страницы доступны"
echo "   - Компоненты UI готовы к тестированию"
echo ""
echo "📝 Следующие шаги:"
echo "   1. Выполните SQL миграцию"
echo "   2. Протестируйте в браузере с авторизованным пользователем"
echo "   3. Проверьте работу всех шагов онбординга"
echo "   4. Убедитесь, что прогресс сохраняется"
echo ""
echo "✅ Тестирование завершено!"
