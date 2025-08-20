import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrgs, getActiveOrgId, createOrg } from '@/lib/org';

export async function GET() {
  try {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('GET /api/orgs - User error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('GET /api/orgs - User ID:', user.id);

    // Получаем организации пользователя
    const orgs = await getUserOrgs(user.id);
    console.log('GET /api/orgs - User orgs:', orgs);

    // Получаем активную организацию
    const activeOrgId = await getActiveOrgId(user.id);
    console.log('GET /api/orgs - Active org ID:', activeOrgId);

    return NextResponse.json({
      orgs,
      activeOrgId,
    });
  } catch (error) {
    console.error('GET /api/orgs - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/orgs - Starting...');

    const supabase = await createClient();

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('POST /api/orgs - User error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('POST /api/orgs - User ID:', user.id);

    // Получаем данные из запроса
    const body = await request.json();
    console.log('POST /api/orgs - Request body:', body);

    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error('POST /api/orgs - Invalid name:', name);
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Проверяем длину названия
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      console.error('POST /api/orgs - Name too short:', trimmedName);
      return NextResponse.json(
        { error: 'Название организации должно содержать минимум 2 символа' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 100) {
      console.error('POST /api/orgs - Name too long:', trimmedName);
      return NextResponse.json(
        { error: 'Название организации не должно превышать 100 символов' },
        { status: 400 }
      );
    }

    console.log('POST /api/orgs - Creating org with name:', trimmedName);

    // Создаем новую организацию
    const newOrg = await createOrg(trimmedName, user.id);
    console.log('POST /api/orgs - Created org:', newOrg);

    // Получаем полную информацию об организации с членством
    const userOrgs = await getUserOrgs(user.id);
    const createdOrgWithMembership = userOrgs.find(
      (org) => org.id === newOrg.id
    );

    return NextResponse.json(createdOrgWithMembership || newOrg, {
      status: 201,
    });
  } catch (error) {
    console.error('POST /api/orgs - Error:', error);

    // Проверяем, является ли это ошибкой дублирования
    if (error instanceof Error) {
      if (error.message.includes('уже существует')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      // Проверяем ошибки Supabase
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Организация с таким названием уже существует' },
          { status: 409 }
        );
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
