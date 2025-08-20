import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';

/**
 * Создает Prisma клиент с поддержкой RLS через Supabase аутентификацию
 * Автоматически устанавливает user_id в контекст для RLS политик
 */
export async function createPrismaClientWithRLS() {
  const supabase = await createClient();

  // Получаем текущего пользователя
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Пользователь не аутентифицирован');
  }

  // Создаем Prisma клиент с расширенным контекстом
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Устанавливаем контекст пользователя для RLS
  await prisma.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${user.id}, true)`;

  return {
    prisma,
    user,
    userId: user.id,
  };
}

/**
 * Middleware для автоматической установки RLS контекста
 */
export function withRLS<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: (
    prismaContext: { prisma: PrismaClient; user: unknown; userId: string },
    ...args: Parameters<T>
  ) => Promise<ReturnType<T>>
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const context = await createPrismaClientWithRLS();

    try {
      const result = await handler(context, ...args);
      return result;
    } finally {
      await context.prisma.$disconnect();
    }
  };
}

/**
 * Утилиты для работы с организациями в контексте RLS
 */
export class OrgService {
  constructor(
    private prisma: PrismaClient,
    private userId: string
  ) {}

  /**
   * Получить все организации пользователя
   */
  async getUserOrgs() {
    return this.prisma.org.findMany({
      include: {
        memberships: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Получить организацию по ID (с проверкой доступа через RLS)
   */
  async getOrg(orgId: string) {
    return this.prisma.org.findUnique({
      where: { id: orgId },
      include: {
        memberships: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Создать новую организацию
   */
  async createOrg(data: { name: string }) {
    return this.prisma.org.create({
      data: {
        ...data,
        ownerId: this.userId,
      },
    });
  }

  /**
   * Обновить организацию (только для владельцев)
   */
  async updateOrg(orgId: string, data: { name?: string }) {
    return this.prisma.org.update({
      where: { id: orgId },
      data,
    });
  }

  /**
   * Пригласить пользователя в организацию
   */
  async inviteMember(
    orgId: string,
    userId: string,
    role: 'MEMBER' | 'ADMIN' = 'MEMBER'
  ) {
    // Сначала создаем профиль если его нет
    await this.prisma.profile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // Создаем членство
    return this.prisma.membership.create({
      data: {
        userId,
        orgId,
        role,
      },
    });
  }

  /**
   * Обновить роль участника
   */
  async updateMemberRole(
    membershipId: string,
    role: 'MEMBER' | 'ADMIN' | 'VIEWER'
  ) {
    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { role },
    });
  }

  /**
   * Удалить участника из организации
   */
  async removeMember(membershipId: string) {
    return this.prisma.membership.delete({
      where: { id: membershipId },
    });
  }

  /**
   * Покинуть организацию
   */
  async leaveOrg(orgId: string) {
    return this.prisma.membership.delete({
      where: {
        userId_orgId: {
          userId: this.userId,
          orgId,
        },
      },
    });
  }
}

/**
 * Утилиты для работы с профилями
 */
export class ProfileService {
  constructor(
    private prisma: PrismaClient,
    private userId: string
  ) {}

  /**
   * Получить профиль текущего пользователя
   */
  async getMyProfile() {
    return this.prisma.profile.findUnique({
      where: { userId: this.userId },
      include: {
        memberships: {
          include: {
            org: true,
          },
        },
      },
    });
  }

  /**
   * Обновить профиль текущего пользователя
   */
  async updateMyProfile(data: {
    displayName?: string;
    avatarUrl?: string;
    locale?: string;
  }) {
    return this.prisma.profile.upsert({
      where: { userId: this.userId },
      update: data,
      create: {
        userId: this.userId,
        ...data,
      },
    });
  }
}
