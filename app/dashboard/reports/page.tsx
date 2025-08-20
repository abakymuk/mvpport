'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold leading-6">Отчеты</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Аналитика и отчеты по деятельности организации
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Аналитика
            </CardTitle>
            <CardDescription>
              Детальная аналитика и отчеты будут доступны в будущих обновлениях
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Здесь будут доступны различные отчеты и аналитика по деятельности
              организации.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Экспорт данных</CardTitle>
            <CardDescription>
              Экспорт отчетов в различных форматах
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Функция экспорта отчетов будет добавлена в Phase 4
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
