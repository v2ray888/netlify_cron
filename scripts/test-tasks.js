require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function testTasks() {
  try {
    console.log('Testing tasks with logs...');
    
    // 获取测试用户
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('Test user not found');
      return;
    }
    
    console.log('Using user:', user.email);
    console.log('User ID:', user.id);
    
    // 查询该用户的所有任务及日志
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id
      },
      include: {
        logs: {
          orderBy: { executedAt: 'desc' },
          take: 30 // 获取每个任务的最近30条日志
        },
        _count: {
          select: { logs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Tasks count:', tasks.length);
    
    if (tasks.length > 0) {
      console.log('First task name:', tasks[0].name);
      console.log('First task logs count:', tasks[0].logs.length);
      console.log('First task total logs count:', tasks[0]._count.logs);
      
      // 显示前几个日志条目
      if (tasks[0].logs.length > 0) {
        console.log('First log entry:', {
          id: tasks[0].logs[0].id,
          executedAt: tasks[0].logs[0].executedAt,
          status: tasks[0].logs[0].status,
          httpStatusCode: tasks[0].logs[0].httpStatusCode,
          responseTimeMs: tasks[0].logs[0].responseTimeMs
        });
      }
    }
    
    console.log('Tasks test completed successfully!');
  } catch (error) {
    console.error('Tasks test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTasks().then(() => {
  console.log('Test completed');
}).catch((error) => {
  console.error('Test failed:', error);
});