import { NextRequest, NextResponse } from 'next/server';
import { createPrismaClientWithRLS, OrgService } from '@/lib/prisma-rls';

interface Params {
  orgId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { prisma, userId } = await createPrismaClientWithRLS();
    const orgService = new OrgService(prisma, userId);

    const body = await request.json();
    const { userId: inviteUserId, role = 'MEMBER' } = body;

    if (!inviteUserId || typeof inviteUserId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    if (!['MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Некорректная роль' },
        { status: 400 }
      );
    }

    const membership = await orgService.inviteMember(
      params.orgId,
      inviteUserId,
      role as 'MEMBER' | 'ADMIN'
    );

    return NextResponse.json(
      {
        success: true,
        data: membership,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error inviting member:', error);

    if (
      error instanceof Error &&
      error.message === 'Пользователь не аутентифицирован'
    ) {
      return NextResponse.json(
        { success: false, error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем на дублирование членства
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Пользователь уже состоит в организации' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
