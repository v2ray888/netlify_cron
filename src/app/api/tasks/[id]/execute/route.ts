import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeTask } from '@/lib/taskExecutor';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await executeTask(id);
    return NextResponse.json({ message: `任务 ${id} 已成功触发执行。` });
  } catch (error) {
    console.error(`手动执行任务 ${id} 失败:`, error);
    return NextResponse.json(
      { message: `手动执行任务 ${id} 失败`, error: (error as Error).message },
      { status: 500 }
    );
  }
}