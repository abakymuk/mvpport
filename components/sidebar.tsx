'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';
import { OrgSwitcher } from '@/components/dashboard/org-switcher';
import {
  LayoutDashboard,
  Settings,
  Users,
  HelpCircle,
  Building2,
} from 'lucide-react';

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold">MVP Port</span>
        </Link>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {/* Переключатель организаций */}
        <OrgSwitcher />

        {/* Навигация */}
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Дашборд
            </Button>
          </Link>

          <Link href="/dashboard/members">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Участники
            </Button>
          </Link>

          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Настройки
            </Button>
          </Link>

          <Link href="/dashboard/help">
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              Помощь
            </Button>
          </Link>
        </nav>
      </div>

      {/* Выход */}
      <div className="border-t p-4">
        <LogoutButton className="w-full justify-start" />
      </div>
    </div>
  );
}
