import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getOnboardingSteps,
  markOnboardingStep,
  autoDetectOnboardingSteps,
} from '@/lib/onboarding';

export async function GET(request: NextRequest) {
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

    // Автоматически определяем выполненные шаги
    await autoDetectOnboardingSteps(user.id);

    // Получаем шаги онбординга
    const steps = await getOnboardingSteps(user.id);

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('GET /api/onboarding - Error:', error);
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
    const { step, value = true } = body;

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 });
    }

    // Отмечаем шаг как выполненный
    await markOnboardingStep(user.id, step, value);

    return NextResponse.json({ message: 'Step marked as completed' });
  } catch (error) {
    console.error('POST /api/onboarding - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
