import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markOnboardingStep } from '@/lib/onboarding';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем активную организацию пользователя
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    const orgId = membership.org_id;

    // Создаем демо-данные
    const demoData = [
      {
        name: 'Демо проект 1',
        description: 'Это пример проекта для демонстрации возможностей',
        status: 'active',
        priority: 'high',
        is_demo: true,
        org_id: orgId,
      },
      {
        name: 'Демо проект 2',
        description: 'Второй пример проекта с другими параметрами',
        status: 'pending',
        priority: 'medium',
        is_demo: true,
        org_id: orgId,
      },
      {
        name: 'Демо проект 3',
        description: 'Третий проект для полной демонстрации',
        status: 'completed',
        priority: 'low',
        is_demo: true,
        org_id: orgId,
      },
    ];

    // Добавляем демо-данные в базу
    // Примечание: здесь нужно создать таблицу для проектов или использовать существующую
    // Пока что создаем простые записи в таблице invites как пример

    const demoInvites = [
      {
        org_id: orgId,
        email: 'demo1@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        token: crypto.randomUUID(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        org_id: orgId,
        email: 'demo2@example.com',
        role: 'VIEWER',
        status: 'PENDING',
        token: crypto.randomUUID(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    const { error: invitesError } = await supabase
      .from('invites')
      .insert(demoInvites);

    if (invitesError) {
      console.error('Error creating demo invites:', invitesError);
      return NextResponse.json(
        { error: 'Failed to create demo data' },
        { status: 500 }
      );
    }

    // Отмечаем шаг онбординга как выполненный
    await markOnboardingStep(user.id, 'viewed_demo_data', true);

    // Отправляем событие аналитики
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'demo_seeded',
          properties: {
            org_id: orgId,
            user_id: user.id,
          },
        }),
      });
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }

    return NextResponse.json({
      message: 'Demo data created successfully',
      count: demoInvites.length,
    });
  } catch (error) {
    console.error('POST /api/demo/seed - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
