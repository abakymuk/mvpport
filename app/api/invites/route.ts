import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInvite, getOrgInvites } from '@/lib/invites';
import { rateLimiters } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.normal(request);
  if (rateLimitResult) return rateLimitResult;

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

    // Получаем orgId из query параметров
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Получаем приглашения для организации
    const invites = await getOrgInvites(orgId, user.id);

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('GET /api/invites - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting для создания приглашений
  const rateLimitResult = rateLimiters.strict(request);
  if (rateLimitResult) return rateLimitResult;

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
    const { orgId, email, role } = body;

    // Валидация данных
    if (!orgId || !email) {
      return NextResponse.json(
        { error: 'Organization ID and email are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (role && !['MEMBER', 'ADMIN', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be MEMBER, ADMIN, or VIEWER' },
        { status: 400 }
      );
    }

    // Создаем приглашение
    const invite = await createInvite(
      {
        orgId,
        email: email.toLowerCase().trim(),
        role: role || 'MEMBER',
      },
      user.id
    );

    // Отправляем email приглашения
    try {
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/invites/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers.get('Authorization') || '',
          },
          body: JSON.stringify({ inviteId: invite.id }),
        }
      );

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        return NextResponse.json(
          {
            ...invite,
            emailSent: true,
            inviteUrl: emailData.inviteUrl,
          },
          { status: 201 }
        );
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Возвращаем приглашение даже если email не отправлен
    }

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error('POST /api/invites - Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('уже существует')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
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
