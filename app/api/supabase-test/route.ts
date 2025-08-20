import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Простая проверка подключения
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    return NextResponse.json({
      status: 'ok',
      supabase_connected: !error,
      error: error?.message || null,
      data_count: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
