import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: '邮箱和密码不能为空' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: '该邮箱已被注册' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
      },
    });

    return NextResponse.json({ message: '注册成功', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json({ message: '注册失败，请稍后再试' }, { status: 500 });
  }
}