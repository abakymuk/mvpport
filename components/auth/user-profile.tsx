'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Загрузка профиля...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Не авторизован</CardTitle>
          <CardDescription>
            Войдите в систему для просмотра профиля
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль пользователя</CardTitle>
        <CardDescription>Информация о вашей учетной записи</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {user.user_metadata?.full_name || 'Пользователь'}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">ID:</span>
            <p className="text-sm text-muted-foreground">{user.id}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Дата регистрации:</span>
            <p className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium">Последний вход:</span>
            <p className="text-sm text-muted-foreground">
              {new Date(
                user.last_sign_in_at || user.created_at
              ).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
