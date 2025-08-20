import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';

type Org = Database['public']['Tables']['orgs']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];

export interface OrgWithMembership extends Org {
  membership: Membership;
}

/**
 * Получает ID активной организации пользователя
 * @param userId ID пользователя
 * @returns ID активной организации или null
 */
export async function getActiveOrgId(userId: string): Promise<string | null> {
  try {
    const supabase = await createClient();

    // Сначала пытаемся получить из профиля
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_org_id')
      .eq('user_id', userId)
      .single();

    if (profile?.active_org_id) {
      // Проверяем, что пользователь все еще является членом этой организации
      const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', userId)
        .eq('org_id', profile.active_org_id)
        .single();

      if (membership) {
        return profile.active_org_id;
      }
    }

    // Если активной организации нет или пользователь не является членом,
    // берем первую организацию пользователя
    const { data: firstMembership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (firstMembership) {
      // Устанавливаем первую организацию как активную
      await setActiveOrgId(userId, firstMembership.org_id);
      return firstMembership.org_id;
    }

    return null;
  } catch (error) {
    console.error('Error getting active org ID:', error);
    return null;
  }
}

/**
 * Устанавливает активную организацию для пользователя
 * @param userId ID пользователя
 * @param orgId ID организации
 */
export async function setActiveOrgId(
  userId: string,
  orgId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Проверяем, что пользователь является членом организации
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    // Обновляем профиль
    await supabase
      .from('profiles')
      .update({ active_org_id: orgId })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error setting active org ID:', error);
    throw error;
  }
}

/**
 * Получает список организаций пользователя с информацией о членстве
 * @param userId ID пользователя
 * @returns Массив организаций с информацией о членстве
 */
export async function getUserOrgs(
  userId: string
): Promise<OrgWithMembership[]> {
  try {
    const supabase = await createClient();

    const { data: orgs, error } = await supabase
      .from('orgs')
      .select(
        `
        *,
        membership:memberships!inner(*)
      `
      )
      .eq('membership.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return orgs || [];
  } catch (error) {
    console.error('Error getting user orgs:', error);
    return [];
  }
}

/**
 * Получает информацию об организации
 * @param orgId ID организации
 * @returns Информация об организации или null
 */
export async function getOrg(orgId: string): Promise<Org | null> {
  try {
    const supabase = await createClient();

    const { data: org, error } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw error;
    return org;
  } catch (error) {
    console.error('Error getting org:', error);
    return null;
  }
}

/**
 * Создает новую организацию
 * @param name Название организации
 * @param ownerId ID владельца
 * @returns Созданная организация
 */
export async function createOrg(name: string, ownerId: string): Promise<Org> {
  try {
    console.log('createOrg - Starting with name:', name, 'ownerId:', ownerId);

    const supabase = await createClient();

    // Создаем организацию
    console.log('createOrg - Creating organization...');
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({
        name,
        owner_id: ownerId,
      })
      .select()
      .single();

    if (orgError) {
      console.error('createOrg - Error creating org:', orgError);
      throw orgError;
    }

    console.log('createOrg - Organization created:', org);

    // Добавляем владельца как члена с ролью OWNER
    console.log('createOrg - Creating membership...');
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: ownerId,
        org_id: org.id,
        role: 'OWNER',
      });

    if (membershipError) {
      console.error('createOrg - Error creating membership:', membershipError);
      throw membershipError;
    }

    console.log('createOrg - Membership created successfully');

    // Устанавливаем новую организацию как активную
    console.log('createOrg - Setting active org...');
    await setActiveOrgId(ownerId, org.id);

    console.log('createOrg - Successfully completed');
    return org;
  } catch (error) {
    console.error('createOrg - Error:', error);
    throw error;
  }
}

/**
 * Обновляет информацию об организации
 * @param orgId ID организации
 * @param updates Обновления
 * @returns Обновленная организация
 */
export async function updateOrg(
  orgId: string,
  updates: Partial<Org>
): Promise<Org> {
  try {
    const supabase = await createClient();

    const { data: org, error } = await supabase
      .from('orgs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw error;
    return org;
  } catch (error) {
    console.error('Error updating org:', error);
    throw error;
  }
}

/**
 * Получает список участников организации
 * @param orgId ID организации
 * @returns Массив участников с информацией о профилях
 */
export async function getOrgMembers(orgId: string) {
  try {
    const supabase = await createClient();

    const { data: members, error } = await supabase
      .from('memberships')
      .select(
        `
        *,
        profile:profiles!inner(
          id,
          user_id,
          full_name,
          email
        )
      `
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return members || [];
  } catch (error) {
    console.error('Error getting org members:', error);
    return [];
  }
}
