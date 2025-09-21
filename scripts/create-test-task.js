require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestTask() {
  try {
    // 首先获取用户
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Creating test task for user:', user.email);
    console.log('User ID:', user.id);
    
    // 检查是否已存在同名任务
    const existingTask = await prisma.task.findFirst({
      where: {
        userId: user.id,
        name: '测试任务'
      }
    });
    
    if (existingTask) {
      console.log('Task already exists:', existingTask.name);
      console.log('Task ID:', existingTask.id);
      
      // 检查现有日志
      const logs = await prisma.taskLog.findMany({
        where: {
          taskId: existingTask.id
        },
        orderBy: {
          executedAt: 'desc'
        }
      });
      
      console.log('Existing logs count:', logs.length);
      return existingTask;
    }
    
    // 创建测试任务
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        name: '测试任务',
        description: '这是一个测试任务，用于验证日志功能',
        targetUrl: 'https://httpbin.org/get',
        httpMethod: 'GET',
        frequencyMinutes: 5,
        timeoutSeconds: 30,
        retryAttempts: 3,
        retryDelaySeconds: 60,
        isEnabled: true
      }
    });
    
    console.log('Created task:', task.name);
    console.log('Task ID:', task.id);
    
    // 创建一些测试日志
    for (let i = 0; i < 10; i++) {
      const log = await prisma.taskLog.create({
        data: {
          taskId: task.id,
          executedAt: new Date(Date.now() - i * 60000), // 每分钟一条日志
          status: i % 3 === 0 ? 'failed' : 'success', // 每三条失败一次
          httpStatusCode: i % 3 === 0 ? 500 : 200,
          responseTimeMs: 100 + Math.random() * 900,
          errorMessage: i % 3 === 0 ? '服务器错误' : null
        }
      });
      
      console.log('Created log entry:', log.id);
    }
    
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTask().then(() => {
  console.log('Task creation completed');
}).catch((error) => {
  console.error('Task creation failed:', error);
});