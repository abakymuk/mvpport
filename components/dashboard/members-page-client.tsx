'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown, Shield, User, Eye } from 'lucide-react';
import { InviteButton } from './invite-button';
import { PendingInvites } from './pending-invites';
import { EmptyState } from './empty-states';

interface Member {
  id: string;
  user_id: string;
  org_id: string;
  role: string;
  created_at: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface MembersPageClientProps {
  members: Member[];
  activeOrgId: string;
  userRole: string;
}

export function MembersPageClient({
  members,
  activeOrgId,
  userRole,
}: MembersPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleInviteCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'MEMBER':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'VIEWER':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      OWNER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ADMIN: 'bg-orange-100 text-orange-800 border-orange-200',
      MEMBER: 'bg-blue-100 text-blue-800 border-blue-200',
      VIEWER: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge
        className={`text-xs ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}
      >
        {getRoleIcon(role)}
        <span className="ml-1">{role}</span>
      </Badge>
    );
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const canInvite = ['ADMIN', 'OWNER'].includes(userRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Участники</h1>
          <p className="text-muted-foreground">
            Управление участниками организации
          </p>
        </div>
        {canInvite && (
          <InviteButton
            orgId={activeOrgId}
            onInviteCreated={handleInviteCreated}
            data-invite-button
          />
        )}
      </div>

      {/* Список участников */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Участники организации
          </CardTitle>
          <CardDescription>
            {members.length} участник{members.length !== 1 ? 'ов' : ''} в
            организации
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState
              type="members"
              onInviteClick={() => {
                // Открываем модал приглашения
                const inviteButton = document.querySelector(
                  '[data-invite-button]'
                ) as HTMLButtonElement;
                if (inviteButton) inviteButton.click();
              }}
            />
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.profile?.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {getInitials(
                          member.profile?.full_name || null,
                          member.profile?.email || member.user_id || ''
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.profile?.full_name || 'Пользователь'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.profile?.email || member.user_id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getRoleBadge(member.role)}
                    <div className="text-sm text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ожидающие приглашения */}
      {canInvite && (
        <PendingInvites
          key={refreshKey}
          orgId={activeOrgId}
          onInviteUpdated={handleInviteCreated}
        />
      )}

      {/* Информация о правах */}
      <Card>
        <CardHeader>
          <CardTitle>Роли и права</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Владелец (OWNER)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Полный доступ к организации, может управлять участниками и
                настройками
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Администратор (ADMIN)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Может управлять участниками и большинством настроек
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Участник (MEMBER)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Полный доступ к проектам и данным организации
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Наблюдатель (VIEWER)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Только просмотр данных, без возможности редактирования
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
