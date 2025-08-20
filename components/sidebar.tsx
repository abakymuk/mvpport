'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';
import { OrgSwitcherEnhanced } from '@/components/dashboard/org-switcher-enhanced';
import {
  LayoutDashboard,
  Settings,
  Users,
  HelpCircle,
  Building2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Дашборд',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Отчеты',
      href: '/dashboard/reports',
      icon: BarChart3,
      current: pathname === '/dashboard/reports',
    },
    {
      name: 'Участники',
      href: '/dashboard/members',
      icon: Users,
      current: pathname === '/dashboard/members',
    },
    {
      name: 'Настройки',
      href: '/dashboard/settings',
      icon: Settings,
      current: pathname === '/dashboard/settings',
    },
    {
      name: 'Помощь',
      href: '/dashboard/help',
      icon: HelpCircle,
      current: pathname === '/dashboard/help',
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">MVP Port</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4">
        {/* Organization Switcher */}
        <div className="space-y-2">
          <OrgSwitcherEnhanced />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    item.current && 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <LogoutButton className="w-full justify-start" />
      </div>
    </div>
  );
}
