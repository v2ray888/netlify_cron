import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: '未授权或无权限' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const [tasks, totalTasks] = await prisma.$transaction([
      prisma.task.findMany({
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.task.count(),
    ]);

    return NextResponse.json({ tasks, totalTasks, page, pageSize });
  } catch (error) {
    console.error('获取所有任务失败:', error);
    return NextResponse.json({ message: '获取所有任务失败' }, { status: 500 });
  }
}