import { createClient } from '@/lib/supabase/server';
import { getActiveOrgId, getOrgMembers } from '@/lib/org';
import { MembersPageClient } from '@/components/dashboard/members-page-client';
import { Users } from 'lucide-react';

export default async function MembersPage() {
  // Проверяем переменные окружения
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ошибка конфигурации</h2>
          <p className="text-muted-foreground">
            Отсутствуют переменные окружения Supabase
          </p>
        </div>
      </div>
    );
  }

  try {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Не авторизован</h2>
            <p className="text-muted-foreground">
              Войдите в систему для просмотра участников
            </p>
          </div>
        </div>
      );
    }

    // Получаем активную организацию
    const activeOrgId = await getActiveOrgId(user.id);

    if (!activeOrgId) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Нет активной организации
            </h2>
            <p className="text-muted-foreground">
              Выберите организацию в сайдбаре для просмотра участников
            </p>
          </div>
        </div>
      );
    }

    // Получаем участников организации
    const members = await getOrgMembers(activeOrgId);

    // Получаем роль пользователя в организации
    const { data: userMembership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', activeOrgId)
      .single();

    const userRole = userMembership?.role || 'MEMBER';

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold leading-6">Участники</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Управление участниками организации
            </p>
          </div>
        </div>

        <MembersPageClient
          members={members}
          activeOrgId={activeOrgId}
          userRole={userRole}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in MembersPage:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground">
            Произошла ошибка при загрузке данных
          </p>
        </div>
      </div>
    );
  }
}
