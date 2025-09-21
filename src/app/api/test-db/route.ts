import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // 测试查询用户表
    const users = await prisma.user.findMany()
    console.log('Users count:', users.length)
    
    // 测试查询任务表
    const tasks = await prisma.task.findMany({
      include: {
        logs: {
          orderBy: { executedAt: 'desc' },
          take: 5
        }
      }
    })
    console.log('Tasks count:', tasks.length)
    
    if (tasks.length > 0) {
      console.log('First task logs count:', tasks[0].logs.length)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection test completed successfully!',
      usersCount: users.length,
      tasksCount: tasks.length,
      firstTaskLogsCount: tasks.length > 0 ? tasks[0].logs.length : 0
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}