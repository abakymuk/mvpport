'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold leading-6">Помощь</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Документация и поддержка по использованию платформы
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Документация</CardTitle>
            <CardDescription>
              Руководства и справочные материалы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Документация будет доступна в Phase 4
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поддержка</CardTitle>
            <CardDescription>
              Свяжитесь с нами для получения помощи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Система поддержки будет доступна в ближайшее время
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
