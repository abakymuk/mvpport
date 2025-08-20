import { createClient } from '@/lib/supabase/server';

export interface OnboardingState {
  created_org: boolean;
  completed_profile: boolean;
  invited_member: boolean;
  viewed_dashboard: boolean;
  connected_integration: boolean;
  viewed_demo_data: boolean;
}

export interface OnboardingStep {
  key: keyof OnboardingState;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  created_org: false,
  completed_profile: false,
  invited_member: false,
  viewed_dashboard: false,
  connected_integration: false,
  viewed_demo_data: false,
};

/**
 * Получает состояние онбординга пользователя
 */
export async function getOnboardingState(
  userId: string
): Promise<OnboardingState> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('onboarding_state')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return DEFAULT_ONBOARDING_STATE;
  }

  try {
    const state = profile.onboarding_state as OnboardingState;
    return { ...DEFAULT_ONBOARDING_STATE, ...state };
  } catch {
    return DEFAULT_ONBOARDING_STATE;
  }
}

/**
 * Отмечает шаг онбординга как выполненный
 */
export async function markOnboardingStep(
  userId: string,
  key: keyof OnboardingState,
  value: boolean = true
): Promise<void> {
  const supabase = await createClient();

  const currentState = await getOnboardingState(userId);
  const newState = { ...currentState, [key]: value };

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_state: newState })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating onboarding state:', error);
    throw error;
  }

  // Отправляем событие аналитики
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'onboarding_step_completed',
        properties: {
          step: key,
          value,
          progress: getOnboardingProgress(newState),
        },
      }),
    });
  } catch (error) {
    console.error('Error sending analytics event:', error);
  }
}

/**
 * Вычисляет прогресс онбординга (0-100)
 */
export function getOnboardingProgress(state: OnboardingState): number {
  const steps = Object.values(state);
  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Получает список шагов онбординга с метаданными
 */
export async function getOnboardingSteps(
  userId: string
): Promise<OnboardingStep[]> {
  const state = await getOnboardingState(userId);

  return [
    {
      key: 'created_org',
      title: 'Создать организацию',
      description: 'Создайте свою первую организацию для начала работы',
      completed: state.created_org,
      action: !state.created_org
        ? {
            label: 'Создать организацию',
            href: '/dashboard/settings',
          }
        : undefined,
    },
    {
      key: 'completed_profile',
      title: 'Заполнить профиль',
      description: 'Добавьте имя и аватар для персонализации',
      completed: state.completed_profile,
      action: !state.completed_profile
        ? {
            label: 'Заполнить профиль',
            href: '/dashboard/settings',
          }
        : undefined,
    },
    {
      key: 'invited_member',
      title: 'Пригласить коллегу',
      description: 'Пригласите первого участника в команду',
      completed: state.invited_member,
      action: !state.invited_member
        ? {
            label: 'Пригласить участника',
            href: '/dashboard/members',
          }
        : undefined,
    },
    {
      key: 'viewed_dashboard',
      title: 'Изучить дашборд',
      description: 'Ознакомьтесь с основными возможностями',
      completed: state.viewed_dashboard,
      action: !state.viewed_dashboard
        ? {
            label: 'Перейти к дашборду',
            href: '/dashboard',
          }
        : undefined,
    },
    {
      key: 'viewed_demo_data',
      title: 'Посмотреть демо-данные',
      description: 'Изучите примеры данных для понимания возможностей',
      completed: state.viewed_demo_data,
      action: !state.viewed_demo_data
        ? {
            label: 'Загрузить демо-данные',
            href: '#',
          }
        : undefined,
    },
  ];
}

/**
 * Проверяет, завершен ли онбординг
 */
export function isOnboardingComplete(state: OnboardingState): boolean {
  return getOnboardingProgress(state) === 100;
}

/**
 * Автоматически определяет и отмечает выполненные шаги
 */
export async function autoDetectOnboardingSteps(userId: string): Promise<void> {
  const supabase = await createClient();

  // Проверяем создание организации
  const { data: memberships } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', userId);

  if (memberships && memberships.length > 0) {
    await markOnboardingStep(userId, 'created_org', true);
  }

  // Проверяем заполнение профиля
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('user_id', userId)
    .single();

  if (profile && profile.display_name && profile.avatar_url) {
    await markOnboardingStep(userId, 'completed_profile', true);
  }

  // Проверяем приглашения
  const { data: invites } = await supabase
    .from('invites')
    .select('id')
    .eq('org_id', memberships?.[0]?.org_id)
    .eq('status', 'PENDING');

  if (invites && invites.length > 0) {
    await markOnboardingStep(userId, 'invited_member', true);
  }
}
