import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 这是一个测试端点，绕过认证来验证任务和日志的显示
export async function GET() {
  try {
    // 获取测试用户
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Test user not found' }, { status: 404 })
    }

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
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}