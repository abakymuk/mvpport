'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOrgName, setActiveOrgName] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createBrowserClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        setLoading(false);
      }
    };

    const getActiveOrg = async () => {
      try {
        const response = await fetch('/api/orgs');
        if (response.ok) {
          const data = await response.json();
          if (data.orgs && data.orgs.length > 0) {
            const activeOrg = data.orgs.find(
              (org: { id: string; name: string }) => org.id === data.activeOrgId
            );
            if (activeOrg) {
              setActiveOrgName(activeOrg.name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching active org:', error);
      }
    };

    getUser();
    getActiveOrg();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (user: User) => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Добавляем название организации, если оно доступно
    if (activeOrgName) {
      items.push({ label: activeOrgName });
    }

    // Добавляем текущую страницу
    if (pathname === '/dashboard') {
      items.push({ label: 'Dashboard' });
    } else if (pathname === '/dashboard/members') {
      items.push({ label: 'Участники' });
    } else if (pathname === '/dashboard/settings') {
      items.push({ label: 'Настройки' });
    } else if (pathname === '/dashboard/help') {
      items.push({ label: 'Помощь' });
    } else if (pathname === '/dashboard/reports') {
      items.push({ label: 'Отчеты' });
    }

    return items;
  };

  return (
    <header
      className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
    >
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex-1">
          <Breadcrumbs items={getBreadcrumbs()} />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email || ''}
                    />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'Пользователь'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/dashboard/settings" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
