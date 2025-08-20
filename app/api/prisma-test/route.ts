import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Тестируем подключение к базе данных
    const profiles = await prisma.profile.findMany({
      take: 5,
      include: {
        memberships: {
          include: {
            org: true,
          },
        },
      },
    });

    const orgs = await prisma.org.findMany({
      take: 5,
      include: {
        memberships: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profiles,
        orgs,
        totalProfiles: await prisma.profile.count(),
        totalOrgs: await prisma.org.count(),
        totalMemberships: await prisma.membership.count(),
      },
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
