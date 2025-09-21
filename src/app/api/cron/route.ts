import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 快速响应机制，防止外部 cron 服务超时
export async function GET(request: NextRequest) {
  // 立即返回成功响应，防止超时
  const response = NextResponse.json({
    success: true,
    message: 'Cron job started',
    timestamp: new Date().toISOString()
  });
  
  // 异步执行任务，不阻塞响应
  executeCronJob(request).catch(console.error);
  
  return response;
}

export async function POST(request: NextRequest) {
  // 检查认证（向后兼容）
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'default-secret';
  
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) !== cronSecret) {
    return NextResponse.json({ message: '未授权访问' }, { status: 401 });
  }

  return GET(request);
}

async function executeCronJob(request: NextRequest) {
  console.log('🚀 Cron job execution started at:', new Date().toISOString())
  
  try {
    // 获取所有启用的任务
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
    const results = []

    for (const task of tasks) {
      try {
        console.log(`⚡ Executing task: ${task.name} (${task.targetUrl})`)
        
        const startTime = Date.now()
        
        // 准备请求选项
        const requestOptions: RequestInit = {
          method: task.httpMethod,
          headers: {
            'User-Agent': 'Cron-Job-Service/1.0',
            ...(task.headers ? task.headers as Record<string, string> : {})
          },
          signal: AbortSignal.timeout(task.timeoutSeconds * 1000)
        }

        // 添加请求体（如果是 POST/PUT 且有 body）
        if ((task.httpMethod === 'POST' || task.httpMethod === 'PUT') && task.body) {
          requestOptions.body = task.body
        }

        const response = await fetch(task.targetUrl, requestOptions)
        const endTime = Date.now()
        const responseTime = endTime - startTime

        // 获取响应大小和内容
        const responseText = await response.text()
        const responseSize = new Blob([responseText]).size

        const success = response.ok
        console.log(`${success ? '✅' : '❌'} Task ${task.name}: ${response.status} (${responseTime}ms)`)

        // 记录执行日志
        await prisma.taskLog.create({
          data: {
            taskId: task.id,
            status: success ? 'success' : 'failed',
            httpStatusCode: response.status,
            responseTimeMs: responseTime,
            responseSize,
            errorMessage: success ? null : `HTTP ${response.status}: ${response.statusText}`,
            requestHeaders: task.headers,
            responseHeaders: Object.fromEntries(response.headers.entries()),
            responseBody: responseText.substring(0, 1000) // 只保存前1000字符
          }
        })

        // 更新任务统计和执行时间
        const nextExecution = new Date(Date.now() + task.frequencyMinutes * 60 * 1000)
        await prisma.task.update({
          where: { id: task.id },
          data: {
            lastExecutedAt: new Date(),
            nextExecutionAt: nextExecution,
            successCount: success ? { increment: 1 } : undefined,
            failureCount: success ? undefined : { increment: 1 },
            avgResponseTime: {
              set: await calculateAvgResponseTime(task.id, responseTime)
            }
          }
        })

        executedCount++
        results.push({
          taskId: task.id,
          taskName: task.name,
          success,
          responseTime,
          httpStatus: response.status
        })

      } catch (error) {
        console.error(`❌ Error executing task ${task.name}:`, error)
        
        const isTimeout = error instanceof Error && error.name === 'TimeoutError'
        const status = isTimeout ? 'timeout' : 'failed'
        
        // 记录错误日志
        await prisma.taskLog.create({
          data: {
            taskId: task.id,
            status,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            requestHeaders: task.headers
          }
        })

        // 更新失败计数和下次执行时间
        const nextExecution = new Date(Date.now() + task.frequencyMinutes * 60 * 1000)
        await prisma.task.update({
          where: { id: task.id },
          data: {
            lastExecutedAt: new Date(),
            nextExecutionAt: nextExecution,
            failureCount: { increment: 1 }
          }
        })

        results.push({
          taskId: task.id,
          taskName: task.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`🎉 Cron job completed. Executed ${executedCount}/${tasks.length} tasks successfully`)
    console.log('📊 Results:', results)

  } catch (error) {
    console.error('💥 Fatal error in cron job execution:', error)
  }
}

// 计算平均响应时间
async function calculateAvgResponseTime(taskId: string, newResponseTime: number): Promise<number> {
  const recentLogs = await prisma.taskLog.findMany({
    where: {
      taskId,
      responseTimeMs: { not: null }
    },
    orderBy: { executedAt: 'desc' },
    take: 10 // 取最近10次的平均值
  })

  const responseTimes = recentLogs
    .map(log => log.responseTimeMs)
    .filter((time): time is number => time !== null)

  if (responseTimes.length === 0) return newResponseTime

  const sum = responseTimes.reduce((acc, time) => acc + time, 0)
  return Math.round(sum / responseTimes.length)
}