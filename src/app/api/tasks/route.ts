import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        logs: {
          orderBy: { executedAt: 'desc' },
          take: 5
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      targetUrl,
      httpMethod = 'GET',
      headers,
      body: requestBody,
      cronExpression,
      frequencyMinutes,
      timeoutSeconds = 30,
      retryAttempts = 3,
      retryDelaySeconds = 60
    } = body

    // 验证必填字段
    if (!name || !targetUrl || !frequencyMinutes) {
      return NextResponse.json(
        { error: 'Name, targetUrl, and frequencyMinutes are required' },
        { status: 400 }
      )
    }

    // 计算下次执行时间
    const nextExecutionAt = new Date(Date.now() + frequencyMinutes * 60 * 1000)

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        name,
        description,
        targetUrl,
        httpMethod,
        headers: headers || null,
        body: requestBody || null,
        cronExpression,
        frequencyMinutes,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
        nextExecutionAt
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ 
      error: 'Failed to create task', 
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: session?.user?.id
    }, { status: 500 })
  }
}