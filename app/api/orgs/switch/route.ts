import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setActiveOrgId } from '@/lib/org';
import { assertMember } from '@/lib/access';

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

    // Получаем данные из запроса
    const { orgId } = await request.json();

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь является членом организации
    await assertMember(user.id, orgId, 'VIEWER');

    // Устанавливаем активную организацию
    await setActiveOrgId(user.id, orgId);

    return NextResponse.json({
      success: true,
      activeOrgId: orgId,
    });
  } catch (error) {
    console.error('Error switching organization:', error);

    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
