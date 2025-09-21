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
    const { currentPassword, newPassword } = body

    // 获取当前用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: '当前密码不正确' }, { status: 400 })
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json({ error: '新密码长度至少为6位' }, { status: 400 })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password_hash: hashedPassword }
    })

    return NextResponse.json({ message: '密码更新成功' })
  } catch (error) {
    console.error('更新密码失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}