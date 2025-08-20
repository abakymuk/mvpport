'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sidebar } from '@/components/sidebar';
import { UserProfile } from '@/components/auth/user-profile';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-semibold leading-6">Настройки</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Управление настройками аккаунта и организации
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <UserProfile />

              <Card>
                <CardHeader>
                  <CardTitle>Настройки приложения</CardTitle>
                  <CardDescription>
                    Дополнительные настройки будут добавлены в будущих
                    обновлениях
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Здесь будут доступны настройки уведомлений, приватности и
                    другие опции.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
