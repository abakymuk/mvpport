'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = 'outline',
  size = 'default',
  className = '',
  children,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const { createBrowserClient } = await import('@/lib/supabase');
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Ошибка при выходе:', error);
        // Можно добавить toast уведомление об ошибке
      } else {
        // Успешный выход
        router.push('/login');
        router.refresh(); // Обновляем кэш
      }
    } catch (error) {
      console.error('Неожиданная ошибка при выходе:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {children || (isLoading ? 'Выход...' : 'Выйти')}
    </Button>
  );
}
