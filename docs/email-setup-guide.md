# 📧 Настройка Email интеграции

## Обзор

Система приглашений поддерживает отправку email через внешние сервисы. В текущей реализации email шаблоны готовы, но нужно настроить внешний email провайдер.

## Варианты настройки

### 1. SendGrid (Рекомендуется)

#### Настройка:

1. Создайте аккаунт на [SendGrid](https://sendgrid.com/)
2. Получите API ключ
3. Добавьте переменные окружения:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### Обновление кода:

Замените содержимое `app/api/invites/send-email/route.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// В функции отправки email:
const msg = {
  to: invite.email,
  from: process.env.SENDGRID_FROM_EMAIL!,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text,
};

await sgMail.send(msg);
```

### 2. Resend

#### Настройка:

1. Создайте аккаунт на [Resend](https://resend.com/)
2. Получите API ключ
3. Добавьте переменные окружения:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Обновление кода:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// В функции отправки email:
await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL!,
  to: invite.email,
  subject: emailContent.subject,
  html: emailContent.html,
});
```

### 3. Supabase SMTP (Бета)

Supabase поддерживает SMTP, но это бета-функция. Для продакшена рекомендуется использовать внешние сервисы.

## Установка зависимостей

### Для SendGrid:

```bash
npm install @sendgrid/mail
```

### Для Resend:

```bash
npm install resend
```

## Тестирование

После настройки email сервиса:

1. Создайте тестовое приглашение
2. Проверьте, что email отправляется
3. Проверьте, что ссылка в email работает корректно

## Переменные окружения

Добавьте в `.env.local`:

```env
# Email провайдер
EMAIL_PROVIDER=sendgrid  # или resend
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Или для Resend
RESEND_API_KEY=your_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# URL сайта
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Безопасность

- Никогда не коммитьте API ключи в репозиторий
- Используйте переменные окружения
- Настройте SPF, DKIM и DMARC записи для домена
- Мониторьте доставляемость email

## Мониторинг

Рекомендуется настроить мониторинг:

- Отслеживание доставляемости
- Логирование ошибок отправки
- Алерты при проблемах с email

## Примеры email шаблонов

Email шаблоны уже готовы в коде и включают:

- HTML и текстовые версии
- Адаптивный дизайн
- Информацию о роли и сроке действия
- Ссылку для принятия приглашения
