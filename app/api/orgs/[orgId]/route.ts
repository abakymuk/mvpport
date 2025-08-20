import { NextRequest, NextResponse } from 'next/server';
import { createPrismaClientWithRLS, OrgService } from '@/lib/prisma-rls';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { prisma, userId } = await createPrismaClientWithRLS();
    const orgService = new OrgService(prisma, userId);

    const org = await orgService.getOrg(orgId);

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Организация не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: org,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { prisma, userId } = await createPrismaClientWithRLS();
    const orgService = new OrgService(prisma, userId);

    const body = await request.json();
    const { name } = body;

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { success: false, error: 'Некорректное название организации' },
        { status: 400 }
      );
    }

    const updateData: { name?: string } = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    const org = await orgService.updateOrg(orgId, updateData);

    return NextResponse.json({
      success: true,
      data: org,
    });
  } catch (error) {
    console.error('Error updating organization:', error);

    if (
      error instanceof Error &&
      error.message === 'Пользователь не аутентифицирован'
    ) {
      return NextResponse.json(
        { success: false, error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем на ошибки доступа
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Организация не найдена или недостаточно прав',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
