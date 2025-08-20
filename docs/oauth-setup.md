# Настройка OAuth провайдеров в Supabase

Инструкция по настройке Google и GitHub OAuth для аутентификации в MVP Port.

## 🎯 Цель

Настроить OAuth провайдеры для упрощения процесса входа пользователей.

## 📋 Поддерживаемые провайдеры

- ✅ Google OAuth
- ✅ GitHub OAuth
- 🔄 Apple OAuth (опционально)

## 🔧 Настройка Google OAuth

### 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API

### 2. Настройка OAuth 2.0

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth 2.0 Client IDs**
3. Выберите **Web application**
4. Настройте:
   - **Name**: `MVP Port OAuth`
   - **Authorized JavaScript origins**:
     ```
     https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

### 3. Получение учетных данных

После создания получите:

- **Client ID**
- **Client Secret**

### 4. Настройка в Supabase

1. Перейдите в Supabase Dashboard → **Authentication** → **Providers**
2. Найдите **Google** и включите его
3. Введите:
   - **Client ID**: ваш Google Client ID
   - **Client Secret**: ваш Google Client Secret
4. Сохраните настройки

## 🔧 Настройка GitHub OAuth

### 1. Создание OAuth App в GitHub

1. Перейдите в [GitHub Settings](https://github.com/settings/developers)
2. Нажмите **New OAuth App**
3. Заполните форму:
   - **Application name**: `MVP Port`
   - **Homepage URL**: `https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app`
   - **Authorization callback URL**: `https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/auth/callback`

### 2. Получение учетных данных

После создания получите:

- **Client ID**
- **Client Secret**

### 3. Настройка в Supabase

1. Перейдите в Supabase Dashboard → **Authentication** → **Providers**
2. Найдите **GitHub** и включите его
3. Введите:
   - **Client ID**: ваш GitHub Client ID
   - **Client Secret**: ваш GitHub Client Secret
4. Сохраните настройки

## 🔧 Настройка Apple OAuth (опционально)

### 1. Создание App ID в Apple Developer

1. Перейдите в [Apple Developer Console](https://developer.apple.com/)
2. Создайте новый App ID
3. Включите **Sign In with Apple**

### 2. Создание Service ID

1. Создайте Service ID для веб-приложения
2. Настройте домены и redirect URLs

### 3. Настройка в Supabase

1. В Supabase Dashboard → **Authentication** → **Providers**
2. Найдите **Apple** и включите его
3. Введите учетные данные Apple

## 🧪 Тестирование

### 1. Локальное тестирование

1. Запустите приложение локально: `pnpm dev`
2. Перейдите на `/login`
3. Попробуйте войти через OAuth провайдеры

### 2. Продакшн тестирование

1. Перейдите на продакшн URL
2. Протестируйте OAuth вход
3. Проверьте редиректы и callback

## ⚠️ Troubleshooting

### Ошибка "redirect_uri_mismatch"

**Причина**: Неправильный redirect URI в настройках провайдера
**Решение**: Проверьте и исправьте redirect URIs в Google/GitHub настройках

### Ошибка "invalid_client"

**Причина**: Неправильные Client ID/Secret
**Решение**: Проверьте учетные данные в Supabase Dashboard

### Ошибка "access_denied"

**Причина**: Пользователь отменил авторизацию
**Решение**: Это нормальное поведение, пользователь может попробовать снова

## 🔒 Безопасность

### Рекомендации

1. **Храните секреты безопасно**: Не коммитьте Client Secret в репозиторий
2. **Используйте HTTPS**: Всегда используйте HTTPS в продакшене
3. **Ограничьте домены**: Настройте только нужные домены в OAuth провайдерах
4. **Мониторинг**: Следите за логами аутентификации

### Переменные окружения

Убедитесь, что в Vercel настроены:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Полезные ссылки

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)

## ✅ Checklist

### Google OAuth

- [ ] Создан проект в Google Cloud Console
- [ ] Настроен OAuth 2.0 Client ID
- [ ] Добавлены правильные redirect URIs
- [ ] Настроен в Supabase Dashboard
- [ ] Протестирован вход

### GitHub OAuth

- [ ] Создан OAuth App в GitHub
- [ ] Настроен callback URL
- [ ] Настроен в Supabase Dashboard
- [ ] Протестирован вход

### Общие настройки

- [ ] Проверены переменные окружения
- [ ] Протестированы все провайдеры
- [ ] Проверена безопасность
- [ ] Документированы настройки
