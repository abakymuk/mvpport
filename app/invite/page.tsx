'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InviteInfo {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  org: {
    id: string;
    name: string;
  };
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Токен приглашения не найден');
      setIsLoading(false);
      return;
    }

    // Получаем информацию о приглашении через API
    const fetchInviteInfo = async () => {
      try {
        const response = await fetch(`/api/invites/info?token=${token}`);

        if (response.ok) {
          const data = await response.json();
          setInviteInfo(data.invite);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Ошибка загрузки приглашения');
        }
      } catch (error) {
        console.error('Error fetching invite info:', error);
        setError('Ошибка загрузки приглашения');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteInfo();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        toast.success('Приглашение принято!');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка принятия приглашения');
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Ошибка принятия приглашения');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action: 'decline' }),
      });

      if (response.ok) {
        toast.success('Приглашение отклонено');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка отклонения приглашения');
      }
    } catch (error) {
      console.error('Error declining invite:', error);
      toast.error('Ошибка отклонения приглашения');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'MEMBER':
        return 'Участник';
      case 'VIEWER':
        return 'Наблюдатель';
      default:
        return role;
    }
  };

  const getStatusInfo = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();

    if (isExpired) {
      return {
        icon: <Clock className="h-5 w-5 text-red-500" />,
        text: 'Приглашение истекло',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }

    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          text: 'Ожидает ответа',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'ACCEPTED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'Принято',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'DECLINED':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: 'Отклонено',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">
            Загрузка приглашения...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              Ошибка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              {error || 'Приглашение не найдено или недействительно'}
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Вернуться в дашборд
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(inviteInfo.status, inviteInfo.expires_at);
  const canRespond =
    inviteInfo.status === 'PENDING' &&
    new Date(inviteInfo.expires_at) > new Date();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Приглашение в организацию</CardTitle>
          <CardDescription>
            Вас приглашают присоединиться к организации
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Информация об организации */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {inviteInfo.org.name}
            </h3>
            <Badge variant="outline">{getRoleLabel(inviteInfo.role)}</Badge>
          </div>

          {/* Статус приглашения */}
          <div
            className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}
          >
            <div className="flex items-center gap-2">
              {statusInfo.icon}
              <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            {inviteInfo.status === 'PENDING' && (
              <p className="text-sm text-muted-foreground mt-1">
                Истекает:{' '}
                {new Date(inviteInfo.expires_at).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>

          {/* Действия */}
          {canRespond ? (
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Принятие...' : 'Принять приглашение'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Отклонение...' : 'Отклонить приглашение'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Вернуться в дашборд
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
