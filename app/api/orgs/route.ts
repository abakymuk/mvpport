import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrgs, getActiveOrgId, createOrg } from '@/lib/org';

export async function GET(request: NextRequest) {
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

    console.log('POST /api/orgs - Creating org with name:', name.trim());

    // Создаем новую организацию
    const newOrg = await createOrg(name.trim(), user.id);
    console.log('POST /api/orgs - Created org:', newOrg);

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    console.error('POST /api/orgs - Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
