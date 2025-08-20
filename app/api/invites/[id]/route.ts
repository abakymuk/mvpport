import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revokeInvite, resendInvite } from '@/lib/invites';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: inviteId } = await params;
    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    // Отзываем приглашение
    await revokeInvite(inviteId, user.id);

    return NextResponse.json({ message: 'Invite revoked successfully' });
  } catch (error) {
    console.error('DELETE /api/invites/[id] - Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('не найдено')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Недостаточно прав')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: inviteId } = await params;
    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    // Получаем данные из запроса
    const body = await request.json();
    const { action } = body;

    if (action === 'resend') {
      // Повторно отправляем приглашение
      const updatedInvite = await resendInvite(inviteId, user.id);
      return NextResponse.json(updatedInvite);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('PATCH /api/invites/[id] - Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('не найдено')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Недостаточно прав')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
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
