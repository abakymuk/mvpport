# Быстрое исправление ошибки OAuth

## 🚨 Ошибка: redirect_uri_mismatch

Если вы видите ошибку `You can't sign in because this app sent an invalid request. Error 400: redirect_uri_mismatch`, это означает, что в настройках Google OAuth указан неправильный redirect URI.

## 🔧 Быстрое решение

### 1. Перейдите в Google Cloud Console

- Откройте [Google Cloud Console](https://console.cloud.google.com/)
- Выберите ваш проект
- Перейдите в **APIs & Services** → **Credentials**

### 2. Найдите ваш OAuth 2.0 Client ID

- Найдите созданный OAuth 2.0 Client ID
- Нажмите на него для редактирования

### 3. Обновите Authorized redirect URIs

Добавьте **ВСЕ** эти URL в поле **Authorized redirect URIs**:

```
https://mvpport-q5wfgye01-vlad-ovelians-projects.vercel.app/auth/callback
https://mvpport-swiyi3xgb-vlad-ovelians-projects.vercel.app/auth/callback
https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 4. Обновите Authorized JavaScript origins

Добавьте **ВСЕ** эти URL в поле **Authorized JavaScript origins**:

```
https://mvpport-q5wfgye01-vlad-ovelians-projects.vercel.app
https://mvpport-swiyi3xgb-vlad-ovelians-projects.vercel.app
https://mvpport-2923mj3cc-vlad-ovelians-projects.vercel.app
http://localhost:3000
```

### 5. Сохраните изменения

- Нажмите **Save**
- Подождите несколько минут (изменения могут применяться не сразу)

## 🧪 Тестирование

1. Перейдите на страницу входа: `https://mvpport-q5wfgye01-vlad-ovelians-projects.vercel.app/login`
2. Нажмите кнопку **Google**
3. Попробуйте войти

## ⚠️ Важно!

- **Не удаляйте** старые URL, просто добавьте новые
- Изменения могут применяться с задержкой до 5-10 минут
- Убедитесь, что вы добавили **все** URL из списка выше

## 🔍 Если проблема остается

1. Проверьте, что вы используете правильный Client ID в Supabase
2. Убедитесь, что в Supabase Dashboard включен Google провайдер
3. Проверьте, что redirect URL в Supabase совпадает с настройками Google

## 📞 Поддержка

Если проблема не решается, проверьте:

- Логи в Supabase Dashboard → Authentication → Logs
- Консоль браузера на наличие ошибок
- Подробную инструкцию: [docs/oauth-setup.md](./oauth-setup.md)
