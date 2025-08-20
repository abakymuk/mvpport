import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';
import { ensureProfile } from '@/lib/create-profile';

type Invite = Database['public']['Tables']['invites']['Row'];
type InviteInsert = Database['public']['Tables']['invites']['Insert'];
type InviteUpdate = Database['public']['Tables']['invites']['Update'];

export interface CreateInviteData {
  orgId: string;
  email: string;
  role: 'MEMBER' | 'ADMIN' | 'VIEWER';
}

export interface InviteWithOrg extends Invite {
  org: {
    id: string;
    name: string;
  };
}

/**
 * Проверяет, имеет ли пользователь права администратора в организации
 */
async function assertAdminAccess(userId: string, orgId: string): Promise<void> {
  const supabase = await createClient();

  const { data: membership, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single();

  if (error || !membership) {
    throw new Error('Пользователь не является членом организации');
  }

  if (!['ADMIN', 'OWNER'].includes(membership.role)) {
    throw new Error('Недостаточно прав для управления приглашениями');
  }
}

/**
 * Генерирует уникальный токен для приглашения
 */
function generateInviteToken(): string {
  return crypto.randomUUID();
}

/**
 * Создает новое приглашение в организацию
 */
export async function createInvite(
  data: CreateInviteData,
  userId: string
): Promise<Invite> {
  try {
    console.log('createInvite - Starting with data:', data, 'userId:', userId);

    // Проверяем права доступа
    await assertAdminAccess(userId, data.orgId);

    const supabase = await createClient();

    // Проверяем, не существует ли уже приглашение для этого email
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id, status')
      .eq('org_id', data.orgId)
      .eq('email', data.email)
      .single();

    if (existingInvite) {
      if (existingInvite.status === 'PENDING') {
        throw new Error('Приглашение для этого email уже существует');
      }
      // Если приглашение было отклонено или истекло, обновляем его
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

      const { data: updatedInvite, error: updateError } = await supabase
        .from('invites')
        .update({
          role: data.role,
          status: 'PENDING',
          token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existingInvite.id)
        .select()
        .single();

      if (updateError) {
        console.error('createInvite - Error updating invite:', updateError);
        throw updateError;
      }

      console.log('createInvite - Updated existing invite:', updatedInvite);
      return updatedInvite;
    }

    // Создаем новое приглашение
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    const { data: newInvite, error: createError } = await supabase
      .from('invites')
      .insert({
        org_id: data.orgId,
        email: data.email,
        role: data.role,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('createInvite - Error creating invite:', createError);
      throw createError;
    }

    console.log('createInvite - Created new invite:', newInvite);
    return newInvite;
  } catch (error) {
    console.error('createInvite - Error:', error);
    throw error;
  }
}

/**
 * Получает список приглашений для организации
 */
export async function getOrgInvites(
  orgId: string,
  userId: string
): Promise<InviteWithOrg[]> {
  try {
    console.log(
      'getOrgInvites - Starting with orgId:',
      orgId,
      'userId:',
      userId
    );

    // Проверяем права доступа
    await assertAdminAccess(userId, orgId);

    const supabase = await createClient();

    const { data: invites, error } = await supabase
      .from('invites')
      .select(
        `
        *,
        org:orgs(id, name)
      `
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getOrgInvites - Error:', error);
      throw error;
    }

    console.log('getOrgInvites - Returning invites:', invites);
    return invites || [];
  } catch (error) {
    console.error('getOrgInvites - Error:', error);
    throw error;
  }
}

/**
 * Принимает приглашение по токену
 */
export async function acceptInvite(
  token: string,
  userId: string
): Promise<void> {
  try {
    console.log(
      'acceptInvite - Starting with token:',
      token,
      'userId:',
      userId
    );

    const supabase = await createClient();

    // Получаем приглашение по токену
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      throw new Error('Приглашение не найдено или недействительно');
    }

    // Проверяем статус приглашения
    if (invite.status !== 'PENDING') {
      throw new Error('Приглашение уже было обработано');
    }

    // Проверяем срок действия
    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('Приглашение истекло');
    }

    // Проверяем, не является ли пользователь уже членом организации
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('org_id', invite.org_id)
      .single();

    if (existingMembership) {
      throw new Error('Пользователь уже является членом этой организации');
    }

    // Убеждаемся, что профиль пользователя существует
    await ensureProfile(userId);

    // Создаем членство
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: userId,
        org_id: invite.org_id,
        role: invite.role,
      });

    if (membershipError) {
      console.error(
        'acceptInvite - Error creating membership:',
        membershipError
      );
      throw membershipError;
    }

    // Обновляем статус приглашения
    const { error: updateError } = await supabase
      .from('invites')
      .update({ status: 'ACCEPTED' })
      .eq('id', invite.id);

    if (updateError) {
      console.error(
        'acceptInvite - Error updating invite status:',
        updateError
      );
      throw updateError;
    }

    console.log('acceptInvite - Successfully accepted invite');
  } catch (error) {
    console.error('acceptInvite - Error:', error);
    throw error;
  }
}

/**
 * Отклоняет приглашение по токену
 */
export async function declineInvite(token: string): Promise<void> {
  try {
    console.log('declineInvite - Starting with token:', token);

    const supabase = await createClient();

    const { error } = await supabase
      .from('invites')
      .update({ status: 'DECLINED' })
      .eq('token', token)
      .eq('status', 'PENDING');

    if (error) {
      console.error('declineInvite - Error:', error);
      throw error;
    }

    console.log('declineInvite - Successfully declined invite');
  } catch (error) {
    console.error('declineInvite - Error:', error);
    throw error;
  }
}

/**
 * Отзывает приглашение (для админов)
 */
export async function revokeInvite(
  inviteId: string,
  userId: string
): Promise<void> {
  try {
    console.log(
      'revokeInvite - Starting with inviteId:',
      inviteId,
      'userId:',
      userId
    );

    const supabase = await createClient();

    // Получаем приглашение для проверки прав
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('org_id')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      throw new Error('Приглашение не найдено');
    }

    // Проверяем права доступа
    await assertAdminAccess(userId, invite.org_id);

    // Отзываем приглашение
    const { error } = await supabase
      .from('invites')
      .update({ status: 'DECLINED' })
      .eq('id', inviteId);

    if (error) {
      console.error('revokeInvite - Error:', error);
      throw error;
    }

    console.log('revokeInvite - Successfully revoked invite');
  } catch (error) {
    console.error('revokeInvite - Error:', error);
    throw error;
  }
}

/**
 * Повторно отправляет приглашение
 */
export async function resendInvite(
  inviteId: string,
  userId: string
): Promise<Invite> {
  try {
    console.log(
      'resendInvite - Starting with inviteId:',
      inviteId,
      'userId:',
      userId
    );

    const supabase = await createClient();

    // Получаем приглашение для проверки прав
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      throw new Error('Приглашение не найдено');
    }

    // Проверяем права доступа
    await assertAdminAccess(userId, invite.org_id);

    // Генерируем новый токен и срок действия
    const newToken = generateInviteToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 дней

    // Обновляем приглашение
    const { data: updatedInvite, error: updateError } = await supabase
      .from('invites')
      .update({
        token: newToken,
        expires_at: newExpiresAt.toISOString(),
        status: 'PENDING',
      })
      .eq('id', inviteId)
      .select()
      .single();

    if (updateError) {
      console.error('resendInvite - Error:', updateError);
      throw updateError;
    }

    console.log('resendInvite - Successfully resent invite:', updatedInvite);
    return updatedInvite;
  } catch (error) {
    console.error('resendInvite - Error:', error);
    throw error;
  }
}
