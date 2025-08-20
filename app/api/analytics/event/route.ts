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

    // Получаем данные события
    const body = await request.json();
    const { event, properties = {} } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // В продакшене здесь можно интегрировать с внешними сервисами аналитики
    // Например: Mixpanel, Amplitude, Google Analytics, etc.

    // Пока что логируем событие
    console.log('Analytics Event:', {
      event,
      properties,
      userId: user.id,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
    });

    // Можно также сохранять события в базу данных для внутренней аналитики
    const { error: dbError } = await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: event,
      properties: properties,
      user_agent: request.headers.get('user-agent'),
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
    });

    if (dbError) {
      console.error('Error saving analytics event:', dbError);
      // Не возвращаем ошибку, так как аналитика не критична
    }

    return NextResponse.json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('POST /api/analytics/event - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
