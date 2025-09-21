import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    // 检查邮箱是否已被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: session.user.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: '该邮箱已被其他用户使用' }, { status: 400 })
    }

    // 更新用户邮箱
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { email }
    })

    return NextResponse.json({ 
      message: '邮箱地址更新成功',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })
  } catch (error) {
    console.error('更新邮箱地址失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}