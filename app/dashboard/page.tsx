'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { OrgsList } from '@/components/dashboard/orgs-list';
import { OnboardingWidget } from '@/components/dashboard/onboarding-widget';
import { Users, TrendingUp, Activity, Target } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function KPICard({
  title,
  value,
  description,
  icon,
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-semibold leading-6">Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Обзор ключевых метрик и активности
                </p>
              </div>
            </div>

            {/* Onboarding Widget */}
            <div className="mt-8">
              <OnboardingWidget />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Активные пользователи"
                value="1,234"
                description="+12% с прошлого месяца"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                loading={isLoading}
              />
              <KPICard
                title="Общий доход"
                value="₽45,231"
                description="+20.1% с прошлого месяца"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                loading={isLoading}
              />
              <KPICard
                title="Активность"
                value="89%"
                description="+5% с прошлого месяца"
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                loading={isLoading}
              />
              <KPICard
                title="Цели"
                value="12"
                description="+2 новые цели"
                icon={<Target className="h-4 w-4 text-muted-foreground" />}
                loading={isLoading}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Последняя активность</CardTitle>
                  <CardDescription>
                    Обзор последних действий пользователей
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Новый пользователь зарегистрирован
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2 минуты назад
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Обновлен профиль организации
                          </p>
                          <p className="text-xs text-muted-foreground">
                            15 минут назад
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Новое сообщение в чате
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1 час назад
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                  <CardDescription>Часто используемые функции</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                        <div className="font-medium">Создать новый проект</div>
                        <div className="text-sm text-muted-foreground">
                          Начните новый проект
                        </div>
                      </button>
                      <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                        <div className="font-medium">Пригласить участника</div>
                        <div className="text-sm text-muted-foreground">
                          Добавить нового участника в команду
                        </div>
                      </button>
                      <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                        <div className="font-medium">Просмотреть аналитику</div>
                        <div className="text-sm text-muted-foreground">
                          Детальная аналитика проекта
                        </div>
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Prisma Data Section */}
            <div className="mt-8">
              <OrgsList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
