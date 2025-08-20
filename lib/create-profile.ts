import { createClient } from '@/lib/supabase/server';

/**
 * Создает профиль пользователя, если он не существует
 * @param userId ID пользователя
 * @param email Email пользователя (опционально)
 * @returns Созданный или существующий профиль
 */
export async function ensureProfile(userId: string, email?: string) {
  try {
    const supabase = await createClient();

    // Проверяем, существует ли профиль
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Создаем новый профиль
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: email ? email.split('@')[0] : 'Пользователь',
        email: email || '',
        active_org_id: null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }

    return newProfile;
  } catch (error) {
    console.error('Error ensuring profile:', error);
    throw error;
  }
}
