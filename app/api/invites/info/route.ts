import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Получаем информацию о приглашении
    const { data: invite, error } = await supabase
      .from('invites')
      .select(
        `
        id,
        email,
        role,
        status,
        expires_at,
        created_at,
        org:orgs(id, name)
      `
      )
      .eq('token', token)
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: 'Приглашение не найдено или недействительно' },
        { status: 404 }
      );
    }

    // Проверяем, не истекло ли приглашение
    if (
      invite.status === 'PENDING' &&
      new Date(invite.expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Приглашение истекло' },
        { status: 410 }
      );
    }

    return NextResponse.json({ invite });
  } catch (error) {
    console.error('GET /api/invites/info - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
