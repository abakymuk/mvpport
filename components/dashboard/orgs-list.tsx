'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Org {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberships: Array<{
    id: string;
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    profile: {
      displayName: string | null;
    };
  }>;
}

export function OrgsList() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch('/api/orgs');
        const data = await response.json();

        if (data.success) {
          setOrgs(data.data);
        } else {
          setError(data.error || 'Ошибка загрузки данных');
        }
      } catch {
        setError('Ошибка сети');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Ошибка</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Организации</h2>
        <p className="text-muted-foreground">
          Список организаций из базы данных Prisma
        </p>
      </div>

      {orgs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Организации не найдены. Запустите seed данные:{' '}
              <code>pnpm db:seed</code>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {org.name}
                  <Badge variant="secondary">
                    {org.memberships.length} участников
                  </Badge>
                </CardTitle>
                <CardDescription>ID: {org.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Владелец:</span>
                    <p className="text-sm text-muted-foreground">
                      {org.memberships.find((m) => m.role === 'OWNER')?.profile
                        .displayName || org.ownerId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Создана:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {org.memberships.map((membership) => (
                      <Badge
                        key={membership.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {membership.profile.displayName || membership.userId} (
                        {membership.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
