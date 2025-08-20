import { NextRequest, NextResponse } from 'next/server';
import { createPrismaClientWithRLS, OrgService } from '@/lib/prisma-rls';

export async function GET() {
  try {
    const { prisma, userId } = await createPrismaClientWithRLS();
    const orgService = new OrgService(prisma, userId);

    const orgs = await orgService.getUserOrgs();

    return NextResponse.json({
      success: true,
      data: orgs,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);

    if (
      error instanceof Error &&
      error.message === 'Пользователь не аутентифицирован'
    ) {
      return NextResponse.json(
        { success: false, error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma, userId } = await createPrismaClientWithRLS();
    const orgService = new OrgService(prisma, userId);

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Название организации обязательно' },
        { status: 400 }
      );
    }

    const org = await orgService.createOrg({ name: name.trim() });

    return NextResponse.json(
      {
        success: true,
        data: org,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);

    if (
      error instanceof Error &&
      error.message === 'Пользователь не аутентифицирован'
    ) {
      return NextResponse.json(
        { success: false, error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
