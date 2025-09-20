import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '5');
  const skip = (page - 1) * pageSize;

  try {
    const [tasks, totalTasks] = await prisma.$transaction([
      prisma.task.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.task.count(),
    ]);

    return NextResponse.json({ tasks, totalTasks, page, pageSize }, { status: 200 });
  } catch (error) {
    console.error('Error fetching all tasks for admin:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}