import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get a specific task
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error(`Error fetching task:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update a task
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { targetUrl, frequencyMinutes, isEnabled } = await request.json();

    if (!targetUrl || !frequencyMinutes) {
      return NextResponse.json({ message: 'Target URL and frequency are required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
        where: { id, userId: session.user.id },
    });

    if (!task) {
        return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    const now = new Date();
    const nextExecutionAt = new Date(now.getTime() + frequencyMinutes * 60 * 1000);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        targetUrl,
        frequencyMinutes: parseInt(frequencyMinutes, 10),
        isEnabled,
        nextExecutionAt,
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error(`Error updating task:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
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
    console.error(`Error deleting task:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}