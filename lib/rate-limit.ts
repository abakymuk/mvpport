import { NextRequest, NextResponse } from 'next/server';

// Простая in-memory реализация rate limiting
// В продакшене рекомендуется использовать Redis или подобное хранилище
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest) {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const now = Date.now();

    // Получаем текущие данные для IP
    const current = rateLimitStore.get(ip);

    // Если окно времени истекло, сбрасываем счетчик
    if (!current || now > current.resetTime) {
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Продолжаем
    }

    // Увеличиваем счетчик
    current.count++;

    // Проверяем лимит
    if (current.count > config.maxRequests) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (current.resetTime - now) / 1000
            ).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(
              0,
              config.maxRequests - current.count
            ).toString(),
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
          },
        }
      );
    }

    return null; // Продолжаем
  };
}

// Предустановленные конфигурации
export const rateLimiters = {
  // Строгий лимит для создания приглашений
  strict: createRateLimiter({ maxRequests: 5, windowMs: 60 * 1000 }), // 5 запросов в минуту

  // Обычный лимит для API
  normal: createRateLimiter({ maxRequests: 100, windowMs: 60 * 1000 }), // 100 запросов в минуту

  // Либеральный лимит для чтения
  liberal: createRateLimiter({ maxRequests: 1000, windowMs: 60 * 1000 }), // 1000 запросов в минуту
};
