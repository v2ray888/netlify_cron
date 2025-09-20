import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { id } = params;
    const task = await prisma.task.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ message: '任务未找到' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('获取任务失败:', error);
    return NextResponse.json({ message: '获取任务失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { name, targetUrl, frequencyMinutes, isEnabled } = await request.json();

    const updatedTask = await prisma.task.update({
      where: { id, userId: session.user.id },
      data: {
        name,
        targetUrl,
        frequencyMinutes: parseInt(frequencyMinutes, 10),
        isEnabled,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('更新任务失败:', error);
    return NextResponse.json({ message: '更新任务失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { id } = params;
    await prisma.task.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: '任务删除成功' }, { status: 200 });
  } catch (error) {
    console.error('删除任务失败:', error);
    return NextResponse.json({ message: '删除任务失败' }, { status: 500 });
  }
}