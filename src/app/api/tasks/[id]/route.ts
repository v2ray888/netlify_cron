import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        logs: {
          orderBy: { executedAt: 'desc' },
          take: 50 // 获取最近50条日志
        },
        notifications: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      retryDelaySeconds = 60,
      isEnabled
    } = body

    // 验证任务所有权
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 验证必填字段
    if (!name || !targetUrl || !frequencyMinutes) {
      return NextResponse.json(
        { error: 'Name, targetUrl, and frequencyMinutes are required' },
        { status: 400 }
      )
    }

    // 如果更新了频率，重新计算下次执行时间
    let nextExecutionAt = existingTask.nextExecutionAt;
    if (frequencyMinutes && frequencyMinutes !== existingTask.frequencyMinutes) {
      nextExecutionAt = new Date(Date.now() + frequencyMinutes * 60 * 1000)
    }

    const task = await prisma.task.update({
      where: { id: id },
      data: {
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
        isEnabled,
        nextExecutionAt
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ 
      error: 'Failed to update task', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // 验证任务所有权
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 如果更新了频率，重新计算下次执行时间
    const updateData = { ...body }
    if (body.frequencyMinutes && body.frequencyMinutes !== existingTask.frequencyMinutes) {
      updateData.nextExecutionAt = new Date(Date.now() + body.frequencyMinutes * 60 * 1000)
    }

    const task = await prisma.task.update({
      where: { id: id },
      data: updateData
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 验证任务所有权
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}