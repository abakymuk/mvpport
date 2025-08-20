import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { inviteId } = body;

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    // Получаем информацию о приглашении
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select(
        `
        *,
        org:orgs(name)
      `
      )
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Проверяем права доступа
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', invite.org_id)
      .single();

    if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Генерируем URL приглашения
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteUrl = `${siteUrl}/invite?token=${invite.token}`;

    // Email шаблон
    const emailContent = {
      to: invite.email,
      subject: `Приглашение в организацию ${invite.org.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Приглашение в организацию</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Вас приглашают в организацию!</h1>
            </div>
            
            <p>Здравствуйте!</p>
            
            <p>Вас приглашают присоединиться к организации <strong>${invite.org.name}</strong> в качестве <strong>${getRoleLabel(invite.role)}</strong>.</p>
            
            <p>Для принятия приглашения нажмите на кнопку ниже:</p>
            
            <a href="${inviteUrl}" class="button">Принять приглашение</a>
            
            <p>Или скопируйте эту ссылку в браузер:</p>
            <p><a href="${inviteUrl}">${inviteUrl}</a></p>
            
            <p><strong>Важно:</strong> Это приглашение действительно до ${new Date(invite.expires_at).toLocaleDateString('ru-RU')}.</p>
            
            <div class="footer">
              <p>Если вы не ожидали это приглашение, просто проигнорируйте это письмо.</p>
              <p>С уважением,<br>Команда ${invite.org.name}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Приглашение в организацию ${invite.org.name}

Здравствуйте!

Вас приглашают присоединиться к организации ${invite.org.name} в качестве ${getRoleLabel(invite.role)}.

Для принятия приглашения перейдите по ссылке:
${inviteUrl}

Важно: Это приглашение действительно до ${new Date(invite.expires_at).toLocaleDateString('ru-RU')}.

Если вы не ожидали это приглашение, просто проигнорируйте это письмо.

С уважением,
Команда ${invite.org.name}
      `,
    };

    // В продакшене здесь можно интегрировать с внешним email сервисом
    // Например: SendGrid, Resend, или настроить Supabase SMTP
    console.log('Email content for invite:', {
      to: invite.email,
      subject: emailContent.subject,
      inviteUrl,
    });

    // Пока что возвращаем URL для ручной отправки
    return NextResponse.json({
      message: 'Invite created successfully',
      inviteUrl,
      email: invite.email,
      note: 'Email integration needs to be configured for production',
    });
  } catch (error) {
    console.error('POST /api/invites/send-email - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Администратора';
    case 'MEMBER':
      return 'Участника';
    case 'VIEWER':
      return 'Наблюдателя';
    default:
      return role;
  }
}
