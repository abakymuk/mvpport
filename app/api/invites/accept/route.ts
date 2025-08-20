import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { acceptInvite, declineInvite } from '@/lib/invites';

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
    const body = await request.json();
    const { token, action } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (action === 'decline') {
      // Отклоняем приглашение
      await declineInvite(token);
      return NextResponse.json({ message: 'Invite declined successfully' });
    } else {
      // Принимаем приглашение (по умолчанию)
      await acceptInvite(token, user.id);
      return NextResponse.json({ message: 'Invite accepted successfully' });
    }
  } catch (error) {
    console.error('POST /api/invites/accept - Error:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('не найдено') ||
        error.message.includes('недействительно')
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('уже было обработано')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('истекло')) {
        return NextResponse.json({ error: error.message }, { status: 410 });
      }
      if (error.message.includes('уже является членом')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
