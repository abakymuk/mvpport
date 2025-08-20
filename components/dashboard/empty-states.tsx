'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Plus, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  type: 'organizations' | 'members' | 'invites';
  onCreateClick?: () => void;
  onInviteClick?: () => void;
}

export function EmptyState({
  type,
  onCreateClick,
  onInviteClick,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'organizations':
        return {
          icon: <Building2 className="h-12 w-12 text-muted-foreground" />,
          title: 'Создайте свою первую организацию',
          description:
            'Организации помогают организовать работу команды и управлять проектами.',
          action: {
            label: 'Создать организацию',
            onClick: onCreateClick,
          },
        };

      case 'members':
        return {
          icon: <Users className="h-12 w-12 text-muted-foreground" />,
          title: 'Пригласите первого участника',
          description:
            'Начните работать в команде, пригласив коллег в вашу организацию.',
          action: {
            label: 'Пригласить участника',
            onClick: onInviteClick,
          },
        };

      case 'invites':
        return {
          icon: <Users className="h-12 w-12 text-muted-foreground" />,
          title: 'Нет ожидающих приглашений',
          description:
            'Все приглашения обработаны. Создайте новые приглашения для привлечения участников.',
          action: {
            label: 'Пригласить участника',
            onClick: onInviteClick,
          },
        };

      default:
        return {
          icon: <Plus className="h-12 w-12 text-muted-foreground" />,
          title: 'Пустое состояние',
          description: 'Здесь пока ничего нет.',
          action: null,
        };
    }
  };

  const content = getContent();

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">{content.icon}</div>
        <CardTitle className="text-xl">{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {content.description}
        </p>
        {content.action && (
          <Button onClick={content.action.onClick} className="gap-2">
            {content.action.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Специальный компонент для демо-данных
export function DemoDataEmptyState({ onSeedDemo }: { onSeedDemo: () => void }) {
  return (
    <Card className="text-center border-dashed">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-blue-100">
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Попробуйте демо-данные</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Загрузите демонстрационные данные, чтобы увидеть, как работает система
          с реальной информацией.
        </p>
        <Button onClick={onSeedDemo} variant="outline" className="gap-2">
          Загрузить демо-данные
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
