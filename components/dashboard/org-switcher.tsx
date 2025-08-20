'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Loader2 } from 'lucide-react';

interface Org {
  id: string;
  name: string;
  membership: {
    role: string;
  };
}

interface OrgSwitcherProps {
  className?: string;
}

export function OrgSwitcher({ className }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  // Загружаем организации пользователя
  useEffect(() => {
    loadUserOrgs();
  }, []);

  const loadUserOrgs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orgs');
      if (response.ok) {
        const data = await response.json();
        setOrgs(data.orgs || []);

        // Устанавливаем активную организацию
        if (data.activeOrgId) {
          setActiveOrgId(data.activeOrgId);
        } else if (data.orgs && data.orgs.length > 0) {
          setActiveOrgId(data.orgs[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading orgs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = async (orgId: string) => {
    try {
      const response = await fetch('/api/orgs/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgId }),
      });

      if (response.ok) {
        setActiveOrgId(orgId);
        router.refresh(); // Обновляем страницу для применения изменений
      }
    } catch (error) {
      console.error('Error switching org:', error);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });

      if (response.ok) {
        const newOrg = await response.json();
        setOrgs((prev) => [newOrg, ...prev]);
        setActiveOrgId(newOrg.id);
        setNewOrgName('');
        setIsDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating org:', error);
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      OWNER: 'bg-red-100 text-red-800',
      ADMIN: 'bg-orange-100 text-orange-800',
      MEMBER: 'bg-blue-100 text-blue-800',
      VIEWER: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge
        className={`text-xs ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}
      >
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Загрузка...</span>
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-sm text-muted-foreground">Нет организаций</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Создать организацию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую организацию</DialogTitle>
              <DialogDescription>
                Создайте новую организацию для управления проектами и командой.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <Label htmlFor="org-name">Название организации</Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Моя организация"
                  required
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  'Создать организацию'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Организация</span>
      </div>

      <Select value={activeOrgId || ''} onValueChange={handleOrgChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите организацию" />
        </SelectTrigger>
        <SelectContent>
          {orgs.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{org.name}</span>
                {getRoleBadge(org.membership.role)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Создать организацию
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую организацию</DialogTitle>
            <DialogDescription>
              Создайте новую организацию для управления проектами и командой.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <Label htmlFor="org-name">Название организации</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Моя организация"
                required
              />
            </div>
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать организацию'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
