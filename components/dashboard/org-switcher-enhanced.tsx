'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import {
  Building2,
  Plus,
  Loader2,
  Check,
  ChevronsUpDown,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Org {
  id: string;
  name: string;
  membership: {
    role: string;
  };
}

interface OrgSwitcherEnhancedProps {
  className?: string;
}

export function OrgSwitcherEnhanced({ className }: OrgSwitcherEnhancedProps) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Загружаем организации пользователя
  useEffect(() => {
    loadUserOrgs();
  }, []);

  const loadUserOrgs = async () => {
    try {
      setLoading(true);
      setError(null);

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
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка загрузки организаций');
      }
    } catch (error) {
      console.error('Error loading orgs:', error);
      setError('Ошибка загрузки организаций');
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
        setIsPopoverOpen(false);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка переключения организации');
      }
    } catch (error) {
      console.error('Error switching org:', error);
      setError('Ошибка переключения организации');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewOrgName('');
        setIsDialogOpen(false);
        await loadUserOrgs(); // Перезагружаем список
        setActiveOrgId(data.org.id);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка создания организации');
      }
    } catch (error) {
      console.error('Error creating org:', error);
      setError('Ошибка создания организации');
    } finally {
      setCreating(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Владелец';
      case 'ADMIN':
        return 'Админ';
      case 'MEMBER':
        return 'Участник';
      case 'VIEWER':
        return 'Наблюдатель';
      default:
        return role;
    }
  };

  const getRoleBadge = (role: string) => {
    const variant =
      role === 'OWNER' || role === 'ADMIN' ? 'default' : 'secondary';
    return (
      <Badge variant={variant} className="ml-2 text-xs">
        {getRoleLabel(role)}
      </Badge>
    );
  };

  const activeOrg = orgs.find((org) => org.id === activeOrgId);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Организация</span>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Организация</span>
      </div>

      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            aria-label="Выберите организацию"
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="truncate">
                {activeOrg ? activeOrg.name : 'Выберите организацию'}
              </span>
              {activeOrg && getRoleBadge(activeOrg.membership?.role)}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Поиск организаций..." />
            <CommandList>
              <CommandEmpty>Организации не найдены.</CommandEmpty>
              <CommandGroup heading="Ваши организации">
                {orgs.map((org) => (
                  <CommandItem
                    key={org.id}
                    value={org.name}
                    onSelect={() => handleOrgChange(org.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>{org.name}</span>
                      {getRoleBadge(org.membership?.role)}
                    </div>
                    {org.id === activeOrgId && <Check className="h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <CommandItem
                      onSelect={() => setIsDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать организацию
                    </CommandItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Создать новую организацию</DialogTitle>
                      <DialogDescription>
                        Создайте новую организацию для совместной работы
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateOrg} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Название организации</Label>
                        <Input
                          id="org-name"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          placeholder="Введите название организации"
                          disabled={creating}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={creating}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          disabled={creating || !newOrgName.trim()}
                        >
                          {creating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Создать
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <CommandItem
                  onSelect={() => {
                    setIsPopoverOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Управление организациями
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
