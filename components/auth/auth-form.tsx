'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, Link, Github } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

type AuthMethod = 'password' | 'magic-link' | 'oauth';

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const router = useRouter();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { createBrowserClient } = await import('@/lib/supabase');
      const supabase = createBrowserClient();

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess('Проверьте вашу почту для подтверждения регистрации!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { createBrowserClient } = await import('@/lib/supabase');
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setSuccess('Ссылка для входа отправлена на вашу почту!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);

    try {
      const { createBrowserClient } = await import('@/lib/supabase');
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (authMethod === 'password') {
      handlePasswordAuth(e);
    } else if (authMethod === 'magic-link') {
      handleMagicLink(e);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Войдите в свою учетную запись'
            : 'Создайте новую учетную запись'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {authMethod === 'password' && (
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {authMethod === 'password' && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? 'Загрузка...'
                : mode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </Button>
          )}

          {authMethod === 'magic-link' && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Отправка...' : 'Отправить ссылку для входа'}
            </Button>
          )}
        </form>

        {/* Переключение методов аутентификации */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                authMethod === 'password'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Пароль
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('magic-link')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                authMethod === 'magic-link'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Link className="h-3 w-3 mr-1" />
              Magic Link
            </button>
          </div>
        </div>

        {/* OAuth кнопки */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или продолжить с
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth('github')}
              disabled={isLoading}
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Ссылки на другие страницы */}
        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <p>
              Нет аккаунта?{' '}
              <a href="/signup" className="text-primary hover:underline">
                Зарегистрироваться
              </a>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{' '}
              <a href="/login" className="text-primary hover:underline">
                Войти
              </a>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
