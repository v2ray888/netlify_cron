require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testUserUpdate() {
  try {
    // 获取测试用户
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('Test user not found');
      return;
    }

    console.log('Current user email:', user.email);
    
    // 测试修改邮箱
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email: 'updated-test@example.com' }
    });
    
    console.log('Updated user email:', updatedUser.email);
    
    // 测试修改密码
    const newPassword = 'newpassword123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword }
    });
    
    console.log('Password updated successfully');
    
    // 验证密码
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Password validation:', isValid ? 'Passed' : 'Failed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserUpdate();