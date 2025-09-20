import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '../../../../../../lib/prisma';

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: '未授权或无权限' }, { status: 403 });
  }

  try {
    const { id } = context.params;
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ message: '缺少用户角色' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户角色失败:', error);
    return NextResponse.json({ message: '更新用户角色失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: '未授权或无权限' }, { status: 403 });
  }

  try {
    const { id } = context.params;

    await prisma.taskLog.deleteMany({
      where: {
        task: {
          userId: id
        }
      }
    });

    await prisma.task.deleteMany({
      where: { userId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: '用户删除成功' }, { status: 200 });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({ message: '删除用户失败' }, { status: 500 });
  }
}