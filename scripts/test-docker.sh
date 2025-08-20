#!/bin/bash

# Тест Docker образа MVP Port
set -e

IMAGE_NAME="ghcr.io/abakymuk/mvpport:staging"
CONTAINER_NAME="mvpport-test-$(date +%s)"
PORT=3001

echo "🐳 Тестирование Docker образа: $IMAGE_NAME"

# Проверяем, что образ существует
echo "📥 Загрузка образа..."
docker pull $IMAGE_NAME

# Запускаем контейнер
echo "🚀 Запуск контейнера..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -e NODE_ENV=production \
  $IMAGE_NAME

# Ждем запуска приложения
echo "⏳ Ожидание запуска приложения..."
sleep 10

# Проверяем health endpoint
echo "🏥 Проверка health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/api/health || echo "{}")
echo "Health response: $HEALTH_RESPONSE"

# Проверяем главную страницу
echo "🏠 Проверка главной страницы..."
MAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ || echo "000")
echo "Main page status: $MAIN_RESPONSE"

# Проверяем логи
echo "📋 Логи контейнера:"
docker logs $CONTAINER_NAME --tail 10

# Очистка
echo "🧹 Очистка..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

# Результаты
echo ""
echo "📊 Результаты тестирования:"
if [[ "$HEALTH_RESPONSE" == *"ok"* ]]; then
    echo "✅ Health endpoint работает"
else
    echo "❌ Health endpoint не работает"
fi

if [[ "$MAIN_RESPONSE" == "200" ]]; then
    echo "✅ Главная страница доступна"
else
    echo "❌ Главная страница недоступна (код: $MAIN_RESPONSE)"
fi

echo ""
echo "🎉 Тестирование завершено!"
