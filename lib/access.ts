import { createClient } from '@/lib/supabase/server';

export type Role = 'VIEWER' | 'MEMBER' | 'ADMIN' | 'OWNER';

const roleHierarchy: Record<Role, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

/**
 * Проверяет, имеет ли пользователь минимальную роль в организации
 * @param userId ID пользователя
 * @param orgId ID организации
 * @param minRole Минимальная требуемая роль
 * @returns true если пользователь имеет достаточные права
 */
export async function hasRole(
  userId: string,
  orgId: string,
  minRole: Role
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();

    if (!membership) {
      return false;
    }

    const userRole = membership.role as Role;
    return roleHierarchy[userRole] >= roleHierarchy[minRole];
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Проверяет членство пользователя в организации и выбрасывает ошибку если не имеет доступа
 * @param userId ID пользователя
 * @param orgId ID организации
 * @param minRole Минимальная требуемая роль
 * @throws Error если пользователь не имеет доступа
 */
export async function assertMember(
  userId: string,
  orgId: string,
  minRole: Role
): Promise<void> {
  const hasAccess = await hasRole(userId, orgId, minRole);

  if (!hasAccess) {
    throw new Error(`Access denied. Required role: ${minRole}`);
  }
}

/**
 * Получает роль пользователя в организации
 * @param userId ID пользователя
 * @param orgId ID организации
 * @returns Роль пользователя или null если не является членом
 */
export async function getUserRole(
  userId: string,
  orgId: string
): Promise<Role | null> {
  try {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();

    return (membership?.role as Role) || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Проверяет, является ли пользователь владельцем организации
 * @param userId ID пользователя
 * @param orgId ID организации
 * @returns true если пользователь является владельцем
 */
export async function isOwner(userId: string, orgId: string): Promise<boolean> {
  return hasRole(userId, orgId, 'OWNER');
}

/**
 * Проверяет, является ли пользователь администратором организации
 * @param userId ID пользователя
 * @param orgId ID организации
 * @returns true если пользователь является администратором или владельцем
 */
export async function isAdmin(userId: string, orgId: string): Promise<boolean> {
  return hasRole(userId, orgId, 'ADMIN');
}

/**
 * Проверяет, является ли пользователь членом организации
 * @param userId ID пользователя
 * @param orgId ID организации
 * @returns true если пользователь является членом
 */
export async function isMember(
  userId: string,
  orgId: string
): Promise<boolean> {
  return hasRole(userId, orgId, 'MEMBER');
}

/**
 * Проверяет, может ли пользователь просматривать организацию
 * @param userId ID пользователя
 * @param orgId ID организации
 * @returns true если пользователь может просматривать
 */
export async function canView(userId: string, orgId: string): Promise<boolean> {
  return hasRole(userId, orgId, 'VIEWER');
}
