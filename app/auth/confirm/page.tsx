'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const { createBrowserClient } = await import('@/lib/supabase');
        const supabase = createBrowserClient();

        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as
              | 'signup'
              | 'magiclink'
              | 'recovery'
              | 'invite'
              | 'email_change',
          });

          if (error) {
            setStatus('error');
            setMessage(error.message);
          } else {
            setStatus('success');
            setMessage('Email успешно подтвержден! Вы можете войти в систему.');
          }
        } else {
          setStatus('error');
          setMessage('Неверная ссылка для подтверждения.');
        }
      } catch {
        setStatus('error');
        setMessage('Произошла ошибка при подтверждении email.');
      }
    };

    confirmEmail();
  }, [searchParams]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Подтверждение email...';
      case 'success':
        return 'Email подтвержден!';
      case 'error':
        return 'Ошибка подтверждения';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Пожалуйста, подождите, мы подтверждаем ваш email адрес.';
      case 'success':
        return 'Ваш email адрес успешно подтвержден. Теперь вы можете войти в систему.';
      case 'error':
        return message || 'Произошла ошибка при подтверждении email адреса.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <a href="/login">Войти в систему</a>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <a href="/login">Вернуться к входу</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/signup">Зарегистрироваться заново</a>
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 inline mr-1" />
              Проверяем вашу ссылку...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
