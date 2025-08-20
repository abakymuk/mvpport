'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { InviteMemberModal } from './invite-member-modal';

interface InviteButtonProps {
  orgId: string;
  onInviteCreated: () => void;
}

export function InviteButton({ orgId, onInviteCreated }: InviteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Пригласить участника
      </Button>

      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orgId={orgId}
        onInviteCreated={onInviteCreated}
      />
    </>
  );
}
