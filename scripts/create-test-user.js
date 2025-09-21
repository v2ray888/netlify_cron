require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('Starting user creation...');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'password123';
    
    console.log('Checking if user exists...');
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return existingUser;
    }
    
    console.log('Creating new user...');
    
    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        role: 'user'
      }
    });
    
    console.log('Created user:', user.email);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser().then(() => {
  console.log('User creation completed');
}).catch((error) => {
  console.error('User creation failed:', error);
});