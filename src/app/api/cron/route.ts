import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeTask } from '@/lib/taskExecutor'; // Import the new utility function

export async function GET() {
  try {
    // In a real application, you might want to add some authentication/authorization
    // to this cron endpoint to prevent unauthorized access.
    // For Vercel Cron Jobs, Vercel ensures only it can trigger this endpoint.

    const now = new Date();
    const tasksToExecute = await prisma.task.findMany({
      where: {
        isEnabled: true,
        OR: [
          { nextExecutionAt: { lte: now } },
          { nextExecutionAt: null }, // Execute tasks that haven't been run yet
        ],
      },
    });

    console.log(`Found ${tasksToExecute.length} tasks to execute.`);

    for (const task of tasksToExecute) {
      await executeTask(task.id); // Call the refactored executeTask function
    }

    return NextResponse.json({ message: 'Cron job executed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ message: 'Cron job failed', error: (error as Error).message }, { status: 500 });
  }
}