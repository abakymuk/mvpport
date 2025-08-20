import { NextRequest, NextResponse } from 'next/server';
import { createPrismaClientWithRLS, ProfileService } from '@/lib/prisma-rls';

export async function GET() {
  try {
    const { prisma, userId } = await createPrismaClientWithRLS();
    const profileService = new ProfileService(prisma, userId);

    const profile = await profileService.getMyProfile();

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);

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

export async function PATCH(request: NextRequest) {
  try {
    const { prisma, userId } = await createPrismaClientWithRLS();
    const profileService = new ProfileService(prisma, userId);

    const body = await request.json();
    const { displayName, avatarUrl, locale } = body;

    // Валидация данных
    const updateData: {
      displayName?: string;
      avatarUrl?: string;
      locale?: string;
    } = {};

    if (displayName !== undefined) {
      if (typeof displayName !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Имя должно быть строкой' },
          { status: 400 }
        );
      }
      updateData.displayName = displayName.trim() || undefined;
    }

    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== 'string') {
        return NextResponse.json(
          { success: false, error: 'URL аватара должен быть строкой' },
          { status: 400 }
        );
      }
      updateData.avatarUrl = avatarUrl.trim() || undefined;
    }

    if (locale !== undefined) {
      if (typeof locale !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Локаль должна быть строкой' },
          { status: 400 }
        );
      }
      updateData.locale = locale.trim() || undefined;
    }

    const profile = await profileService.updateMyProfile(updateData);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);

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
