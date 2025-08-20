'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight, Zap, Shield, Users, BarChart3 } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MVP Port</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Монолитный базис для
            <span className="text-primary"> быстрого старта</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Next.js 15, TypeScript, shadcn/ui и современные инструменты
            разработки для создания масштабируемых приложений
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="group">
                Начать работу
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Демо вход
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Возможности платформы</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Все необходимое для быстрой разработки и развертывания приложений
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Быстрая разработка</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Готовые компоненты и инструменты для ускорения разработки
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Безопасность</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Встроенные механизмы безопасности и лучшие практики
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Командная работа</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Инструменты для эффективной работы в команде
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Мониторинг и аналитика для принятия решений
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Готовы начать?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам разработчиков, которые уже используют MVP
            Port
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="group">
              Перейти к dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 MVP Port. Создано с ❤️ для разработчиков.
          </p>
        </div>
      </footer>
    </div>
  );
}
