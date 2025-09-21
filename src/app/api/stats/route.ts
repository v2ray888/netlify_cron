import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取用户的任务统计
    const [
      totalTasks,
      activeTasks,
      totalExecutions,
      successfulExecutions,
      avgResponseTimeResult
    ] = await Promise.all([
      // 总任务数
      prisma.task.count({
        where: { userId: session.user.id }
      }),
      
      // 活跃任务数
      prisma.task.count({
        where: { 
          userId: session.user.id,
          isEnabled: true 
        }
      }),
      
      // 总执行次数
      prisma.taskLog.count({
        where: {
          task: { userId: session.user.id }
        }
      }),
      
      // 成功执行次数
      prisma.taskLog.count({
        where: {
          task: { userId: session.user.id },
          status: 'success'
        }
      }),
      
      // 平均响应时间
      prisma.taskLog.aggregate({
        where: {
          task: { userId: session.user.id },
          responseTimeMs: { not: null }
        },
        _avg: {
          responseTimeMs: true
        }
      })
    ])

    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
    const avgResponseTime = avgResponseTimeResult._avg.responseTimeMs || 0

    const stats = {
      totalTasks,
      activeTasks,
      totalExecutions,
      successRate,
      avgResponseTime
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}