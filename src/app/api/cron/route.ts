import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeTask } from '@/lib/taskExecutor'; // Import the new utility function

async function executeCronJob(request?: Request) {
  const startTime = Date.now();
  
  try {
    // 如果有请求对象，检查认证
    if (request) {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET || 'default-secret';
      
      if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== cronSecret) {
        return NextResponse.json({ message: '未授权访问' }, { status: 401 });
      }
    }

    const now = new Date();
    
    // 快速响应：先返回成功状态，然后异步执行任务
    const response = NextResponse.json({ 
      message: 'Cron job started successfully', 
      timestamp: now.toISOString(),
      status: 'processing'
    }, { status: 200 });

    // 异步执行任务，不阻塞响应
    setImmediate(async () => {
      try {
        const tasksToExecute = await prisma.task.findMany({
          where: {
            isEnabled: true,
            OR: [
              { nextExecutionAt: { lte: now } },
              { nextExecutionAt: null }, // Execute tasks that haven't been run yet
            ],
          },
        });

        console.log(`Found ${tasksToExecute.length} tasks to execute at ${now.toISOString()}`);

        for (const task of tasksToExecute) {
          await executeTask(task.id); // Call the refactored executeTask function
        }
        
        console.log(`Cron job completed in ${Date.now() - startTime}ms`);
      } catch (error) {
        console.error('Async cron job failed:', error);
      }
    });

    return response;
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      message: 'Cron job failed', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// POST 方法用于 GitHub Actions 调用
export async function POST(request: Request) {
  return executeCronJob(request);
}

// GET 方法用于 Vercel Cron Jobs（向后兼容）
export async function GET() {
  return executeCronJob();
}