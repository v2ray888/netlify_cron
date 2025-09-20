import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const [tasks, totalTasks] = await prisma.$transaction([
      prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.task.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({ tasks, totalTasks, page, pageSize });
  } catch (error) {
    console.error('获取任务失败:', error);
    return NextResponse.json({ message: '获取任务失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { name, targetUrl, frequencyMinutes } = await request.json();

    if (!name || !targetUrl || !frequencyMinutes) {
      return NextResponse.json({ message: '缺少必要的任务信息' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        name,
        targetUrl,
        frequencyMinutes: parseInt(frequencyMinutes, 10),
        userId: session.user.id,
        // nextExecutionAt will be set by the cron job logic
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('创建任务失败:', error);
    return NextResponse.json({ message: '创建任务失败' }, { status: 500 });
  }
}