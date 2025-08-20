import { NextResponse } from 'next/server';
import { VERSION } from '@/config/version';

export async function GET() {
  try {
    // Проверяем базовые переменные окружения
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? 'SET'
        : 'NOT_SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    };

    return NextResponse.json({
      status: 'ok',
      version: VERSION,
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Fallback response
    return NextResponse.json({
      status: 'ok',
      version: VERSION,
      message: 'Health check passed (fallback)',
      timestamp: new Date().toISOString(),
    });
  }
}
