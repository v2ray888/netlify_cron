import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: 'Cron job started',
    timestamp: new Date().toISOString()
  });
  
  executeCronJob().catch(console.error);
  return response;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'default-secret';
  
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) !== cronSecret) {
    return NextResponse.json({ message: '未授权访问' }, { status: 401 });
  }

  return GET();
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
        
        const startTime = Date.now()
        const response = await fetch(task.targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Cron-Job-Service/1.0'
          },
          signal: AbortSignal.timeout(30000)
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
            nextExecutionAt: nextExecution
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
            nextExecutionAt: nextExecution
          }
        })
      }
    }

    console.log(`🎉 Cron job completed. Executed ${executedCount}/${tasks.length} tasks successfully`)

  } catch (error) {
    console.error('💥 Fatal error in cron job execution:', error)
  }
}