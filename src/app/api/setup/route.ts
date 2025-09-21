import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const email = 'v2rayn@outlook.com'
    const password = '123456'
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({ message: '用户已存在', user: existingUser.email })
    }
    
    // 创建密码哈希
    const passwordHash = await bcrypt.hash(password, 12)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        role: 'admin'
      }
    })
    
    return NextResponse.json({ 
      message: '用户创建成功', 
      user: user.email,
      id: user.id 
    })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json({ 
      error: '创建用户失败', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // 检查数据库连接和用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({ 
      message: '数据库连接正常',
      userCount: users.length,
      users: users
    })
  } catch (error) {
    console.error('数据库连接失败:', error)
    return NextResponse.json({ 
      error: '数据库连接失败', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}