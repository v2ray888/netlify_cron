const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    const email = 'v2rayn@outlook.com';
    const password = '123456'; // 默认密码，登录后请修改
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('用户已存在');
      return;
    }
    
    // 创建密码哈希
    const passwordHash = await bcrypt.hash(password, 12);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        role: 'admin'
      }
    });
    
    console.log('用户创建成功:', user.email);
  } catch (error) {
    console.error('创建用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();