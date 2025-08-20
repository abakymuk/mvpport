import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the request body
    const { inviteId } = await req.json();

    if (!inviteId) {
      throw new Error('Invite ID is required');
    }

    // Get invite information
    const { data: invite, error: inviteError } = await supabaseClient
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
      throw new Error('Invite not found');
    }

    // Generate invite URL
    const inviteUrl = `${Deno.env.get('SITE_URL')}/invite?token=${invite.token}`;

    // Email template
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

    // Send email using Supabase SMTP
    const { error: emailError } =
      await supabaseClient.auth.admin.sendRawEmail(emailContent);

    if (emailError) {
      throw emailError;
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending invite email:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

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
