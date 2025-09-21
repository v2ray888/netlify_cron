const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 检查是否已存在管理员用户
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('管理员用户已存在:', existingAdmin.email);
      return;
    }

    // 创建新的管理员用户
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });

    console.log('管理员用户创建成功:', adminUser.email);
  } catch (error) {
    console.error('创建管理员用户时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();