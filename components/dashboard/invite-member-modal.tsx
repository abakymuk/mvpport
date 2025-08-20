'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onInviteCreated: () => void;
}

const roleOptions = [
  {
    value: 'MEMBER',
    label: 'Участник',
    description: 'Может просматривать и редактировать данные',
  },
  {
    value: 'ADMIN',
    label: 'Администратор',
    description: 'Может управлять участниками и настройками',
  },
  {
    value: 'VIEWER',
    label: 'Наблюдатель',
    description: 'Может только просматривать данные',
  },
];

export function InviteMemberModal({
  isOpen,
  onClose,
  orgId,
  onInviteCreated,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'VIEWER'>('MEMBER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId,
          email: email.trim(),
          role,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Приглашение отправлено');

        // Если есть URL приглашения, показываем его
        if (data.inviteUrl) {
          toast.success(
            <div>
              <p>Приглашение создано!</p>
              <p className="text-sm mt-1">Ссылка: {data.inviteUrl}</p>
            </div>
          );
        }

        setEmail('');
        setRole('MEMBER');
        onInviteCreated();
        onClose();
      } else {
        const errorData = await response.json();

        // Обработка специфических ошибок
        if (response.status === 429) {
          toast.error('Слишком много запросов. Попробуйте позже.');
        } else if (response.status === 409) {
          toast.error('Приглашение для этого email уже существует');
        } else {
          toast.error(errorData.error || 'Ошибка отправки приглашения');
        }
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Ошибка отправки приглашения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setRole('MEMBER');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Пригласить участника</DialogTitle>
          <DialogDescription>
            Отправьте приглашение новому участнику организации. Он получит email
            со ссылкой для присоединения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Роль</Label>
            <Select
              value={role}
              onValueChange={(value: 'MEMBER' | 'ADMIN' | 'VIEWER') =>
                setRole(value)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Приглашение будет активно 7 дней</span>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'Отправка...' : 'Отправить приглашение'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
