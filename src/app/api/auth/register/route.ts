import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 添加输入验证日志
    console.log('注册请求:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('注册失败: 邮箱或密码为空');
      return NextResponse.json({ message: '邮箱和密码不能为空' }, { status: 400 });
    }

    // 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('数据库连接正常');
    } catch (dbError) {
      console.error('数据库连接失败:', dbError);
      return NextResponse.json({ message: '数据库连接失败，请稍后再试' }, { status: 500 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('注册失败: 邮箱已存在', email);
      return NextResponse.json({ message: '该邮箱已被注册' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('密码加密完成');

    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
      },
    });

    console.log('用户创建成功:', newUser.id);
    return NextResponse.json({ message: '注册成功', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('注册失败:', error);
    // 返回更详细的错误信息（仅在开发环境中）
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        message: '注册失败，请稍后再试', 
        error: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 });
    }
    return NextResponse.json({ message: '注册失败，请稍后再试' }, { status: 500 });
  }
}