import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic' // 确保在 Netlify 上动态执行

export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: 'Cron job started',
    timestamp: new Date().toISOString()
  });
  
  // 在 Netlify 环境中，我们不使用异步执行
  // 而是直接执行任务以确保在函数超时前完成
  if (process.env.NETLIFY) {
    await executeCronJob();
  } else {
    // 在 Vercel 或其他平台上保持原有行为
    executeCronJob().catch(console.error);
  }
  
  return response;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'default-secret';
  
  // 在 Netlify 环境中，可能需要不同的认证方式
  if (process.env.NETLIFY) {
    // Netlify 环境下可以使用不同的认证机制
    // 例如检查 Netlify 特定的头信息
    const netlifyCronHeader = request.headers.get('x-netlify-cron-secret');
    if (netlifyCronHeader && netlifyCronHeader !== cronSecret) {
      return NextResponse.json({ message: '未授权访问' }, { status: 401 });
    }
  } else {
    // 原有的认证方式
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) !== cronSecret) {
      return NextResponse.json({ message: '未授权访问' }, { status: 401 });
    }
  }

  return await GET();
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

    let executedCount = 0

    for (const task of tasks) {
      try {
        console.log(`⚡ Executing task: ${task.name} (${task.targetUrl})`)
        
        // Netlify 函数有执行时间限制，需要设置合理的超时
        const timeout = Math.min(task.timeoutSeconds * 1000, 9000); // 最大9秒
        
        const startTime = Date.now()
        const response = await fetch(task.targetUrl, {
          method: task.httpMethod,
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

  } catch (error) {
    console.error('💥 Fatal error in cron job execution:', error)
  }
}