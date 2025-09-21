require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

console.log('Starting database test...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // 测试查询用户表
    console.log('Querying users...');
    const users = await prisma.user.findMany();
    console.log('Users count:', users.length);
    
    // 测试查询任务表
    console.log('Querying tasks with logs...');
    const tasks = await prisma.task.findMany({
      include: {
        logs: {
          orderBy: { executedAt: 'desc' },
          take: 5
        }
      }
    });
    console.log('Tasks count:', tasks.length);
    
    if (tasks.length > 0) {
      console.log('First task logs count:', tasks[0].logs.length);
    }
    
    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase().then(() => {
  console.log('Test completed');
}).catch((error) => {
  console.error('Test failed:', error);
});