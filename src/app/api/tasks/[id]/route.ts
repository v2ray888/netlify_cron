import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Get a specific task
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const task = await prisma.task.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error(`Error fetching task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update a task
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { url, intervalMin, active } = await request.json();

    if (!url || !intervalMin) {
      return NextResponse.json({ message: 'URL and interval are required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
        where: { id, userId: session.user.id },
    });

    if (!task) {
        return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    const now = new Date();
    const nextRun = new Date(now.getTime() + intervalMin * 60 * 1000);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        url,
        intervalMin: parseInt(intervalMin, 10),
        active,
        nextRun,
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error(`Error updating task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    
    const task = await prisma.task.findUnique({
        where: { id, userId: session.user.id },
    });

    if (!task) {
        return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}