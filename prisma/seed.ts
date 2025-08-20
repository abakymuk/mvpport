import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Создаем demo пользователей
  const demoUsers = [
    {
      userId: 'demo-user-1',
      displayName: 'Demo User 1',
      email: 'demo1@example.com',
    },
    {
      userId: 'demo-user-2',
      displayName: 'Demo User 2',
      email: 'demo2@example.com',
    },
  ];

  // Создаем профили
  for (const user of demoUsers) {
    await prisma.profile.upsert({
      where: { userId: user.userId },
      update: {},
      create: {
        userId: user.userId,
        displayName: user.displayName,
        locale: 'ru',
      },
    });
  }

  // Создаем организации
  const demoOrgs = [
    {
      name: 'Demo Organization',
      ownerId: 'demo-user-1',
    },
    {
      name: 'Test Company',
      ownerId: 'demo-user-2',
    },
  ];

  for (const orgData of demoOrgs) {
    const org = await prisma.org.upsert({
      where: {
        id: orgData.name.toLowerCase().replace(/\s+/g, '-') + '-id',
      },
      update: {},
      create: {
        id: orgData.name.toLowerCase().replace(/\s+/g, '-') + '-id',
        name: orgData.name,
        ownerId: orgData.ownerId,
      },
    });

    // Создаем членство для владельца
    await prisma.membership.upsert({
      where: {
        userId_orgId: {
          userId: orgData.ownerId,
          orgId: org.id,
        },
      },
      update: {},
      create: {
        userId: orgData.ownerId,
        orgId: org.id,
        role: Role.OWNER,
      },
    });
  }

  // Добавляем второго пользователя в первую организацию как MEMBER
  await prisma.membership.upsert({
    where: {
      userId_orgId: {
        userId: 'demo-user-2',
        orgId: 'demo-organization-id',
      },
    },
    update: {},
    create: {
      userId: 'demo-user-2',
      orgId: 'demo-organization-id',
      role: Role.MEMBER,
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('📊 Created:');
  console.log(`   - ${demoUsers.length} demo users`);
  console.log(`   - ${demoOrgs.length} demo organizations`);
  console.log(`   - ${demoOrgs.length + 1} memberships`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
