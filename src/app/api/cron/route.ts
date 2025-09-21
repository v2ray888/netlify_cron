import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic' // 确保在 Netlify 上动态执行

export async function GET() {
  console.log('Cron job GET request received')
  return await executeCronJob();
}

export async function POST(request: NextRequest) {
  console.log('Cron job POST request received')
  console.log('Request headers:', Object.fromEntries(request.headers))
  
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  console.log('CRON_SECRET from env:', cronSecret ? 'SET' : 'NOT SET')
  console.log('Authorization header:', authHeader)
  
  // 验证 cron-job.org 的请求
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === cronSecret) {
    console.log('Authorized access from cron-job.org')
    return await executeCronJob();
  }
  
  // 如果没有正确的认证，也执行任务（为了测试）
  console.log('Unauthorized access, but still executing for testing')
  return await executeCronJob();
}

async function executeCronJob() {
  console.log('🚀 Cron job execution started at:', new Date().toISOString())
  
  try {
    const tasks = await prisma.task.findMany({
      where: {
        isEnabled: true,
        nextExecutionAt: {
          lte: new Date()
        }
      }
    })

    console.log(`📋 Found ${tasks.length} tasks ready for execution`)

    // 如果没有任务需要执行，记录日志并返回
    if (tasks.length === 0) {
      console.log('No tasks ready for execution')
      return NextResponse.json({ 
        success: true, 
        message: 'No tasks ready for execution',
        tasksExecuted: 0 
      });
    }

    let executedCount = 0

    for (const task of tasks) {
      try {
        console.log(`⚡ Executing task: ${task.name} (${task.targetUrl})`)
        
        // 设置合理的超时
        const timeout = Math.min(task.timeoutSeconds * 1000, 9000); // 最大9秒
        
        const startTime = Date.now()
        const response = await fetch(task.targetUrl, {
          method: task.httpMethod || 'GET',
          headers: {
            'User-Agent': 'Cron-Job-Service/1.0',
            ...(task.headers as Record<string, string> || {})
          },
          body: task.body || undefined,
          signal: AbortSignal.timeout(timeout)
        })
        
        const endTime = Date.now()
        const responseTime = endTime - startTime
        const success = response.ok

        console.log(`${success ? '✅' : '❌'} Task ${task.name}: ${response.status} (${responseTime}ms)`)

        await prisma.taskLog.create({
          data: {
            taskId: task.id,
            status: success ? 'success' : 'failed',
            httpStatusCode: response.status,
            responseTimeMs: responseTime,
            errorMessage: success ? null : `HTTP ${response.status}: ${response.statusText}`
          }
        })

        const nextExecution = new Date(Date.now() + task.frequencyMinutes * 60 * 1000)
        await prisma.task.update({
          where: { id: task.id },
          data: {
            lastExecutedAt: new Date(),
            nextExecutionAt: nextExecution,
            successCount: {
              increment: success ? 1 : 0
            },
            failureCount: {
              increment: success ? 0 : 1
            }
          }
        })

        executedCount++

      } catch (error) {
        console.error(`❌ Error executing task ${task.name}:`, error)
        
        await prisma.taskLog.create({
          data: {
            taskId: task.id,
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        })

        const nextExecution = new Date(Date.now() + task.frequencyMinutes * 60 * 1000)
        await prisma.task.update({
          where: { id: task.id },
          data: {
            lastExecutedAt: new Date(),
            nextExecutionAt: nextExecution,
            failureCount: {
              increment: 1
            }
          }
        })
      }
    }

    console.log(`🎉 Cron job completed. Executed ${executedCount}/${tasks.length} tasks successfully`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Cron job completed. Executed ${executedCount}/${tasks.length} tasks successfully`,
      tasksExecuted: executedCount,
      totalTasks: tasks.length
    });

  } catch (error) {
    console.error('💥 Fatal error in cron job execution:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error in cron job execution',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}