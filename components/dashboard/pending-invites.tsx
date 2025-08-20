'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Copy, Mail } from 'lucide-react';

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  token: string;
  org: {
    id: string;
    name: string;
  };
}

interface PendingInvitesProps {
  orgId: string;
  onInviteUpdated: () => void;
}

const getStatusBadge = (status: string, expiresAt: string) => {
  const isExpired = new Date(expiresAt) < new Date();

  if (isExpired) {
    return <Badge variant="destructive">Истекло</Badge>;
  }

  switch (status) {
    case 'PENDING':
      return <Badge variant="default">Ожидает</Badge>;
    case 'ACCEPTED':
      return <Badge variant="secondary">Принято</Badge>;
    case 'DECLINED':
      return <Badge variant="outline">Отклонено</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
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

export function PendingInvites({
  orgId,
  onInviteUpdated,
}: PendingInvitesProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    try {
      const response = await fetch(`/api/invites?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setInvites(data.invites || []);
      } else {
        console.error('Failed to fetch invites');
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchInvites();
  }, [orgId, fetchInvites]);

  const handleResend = async (inviteId: string) => {
    setActionLoading(inviteId);
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resend' }),
      });

      if (response.ok) {
        toast.success('Приглашение отправлено повторно');
        fetchInvites();
        onInviteUpdated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка повторной отправки');
      }
    } catch (error) {
      console.error('Error resending invite:', error);
      toast.error('Ошибка повторной отправки');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    setActionLoading(inviteId);
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Приглашение отозвано');
        fetchInvites();
        onInviteUpdated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка отзыва приглашения');
      }
    } catch (error) {
      console.error('Error revoking invite:', error);
      toast.error('Ошибка отзыва приглашения');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyLink = async (invite: Invite) => {
    const siteUrl = window.location.origin;
    const inviteUrl = `${siteUrl}/invite?token=${invite.token}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Ссылка скопирована в буфер обмена');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Ошибка копирования ссылки');
    }
  };

  const handleSendEmail = async (inviteId: string) => {
    setActionLoading(inviteId);
    try {
      const response = await fetch('/api/invites/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Email отправлен');
        if (data.inviteUrl) {
          toast.info(`Ссылка: ${data.inviteUrl}`);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка отправки email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Ошибка отправки email');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие приглашения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  if (invites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие приглашения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Нет ожидающих приглашений
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ожидающие приглашения</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{invite.email}</span>
                  {getStatusBadge(invite.status, invite.expires_at)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Роль: {getRoleLabel(invite.role)}</span>
                  <span>
                    Отправлено:{' '}
                    {formatDistanceToNow(new Date(invite.created_at), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                  {invite.status === 'PENDING' && (
                    <span>
                      Истекает:{' '}
                      {formatDistanceToNow(new Date(invite.expires_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  )}
                </div>
              </div>

              {invite.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(invite)}
                    disabled={actionLoading === invite.id}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Копировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendEmail(invite.id)}
                    disabled={actionLoading === invite.id}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {actionLoading === invite.id ? 'Отправка...' : 'Email'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResend(invite.id)}
                    disabled={actionLoading === invite.id}
                  >
                    {actionLoading === invite.id ? 'Отправка...' : 'Повторить'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(invite.id)}
                    disabled={actionLoading === invite.id}
                  >
                    {actionLoading === invite.id ? 'Отзыв...' : 'Отозвать'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
