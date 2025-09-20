import prisma from '@/lib/prisma';
import { Task } from '@prisma/client';

/**
 * Executes a single task.
 * @param task The task object from the database.
 */
export async function executeTask(task: Task) {
  const now = new Date();

  if (!task.active) {
    console.log(`Task ${task.id} is not active. Skipping execution.`);
    return;
  }

  let status = 'success';
  let message = `Successfully accessed ${task.url}`;
  let httpStatusCode: number | null = null;
  const startTime = process.hrtime.bigint();

  try {
    console.log(`Executing task for URL: ${task.url}`);
    const response = await fetch(task.url, { method: 'GET', redirect: 'follow', timeout: 30000 }); // 30s timeout
    httpStatusCode = response.status;

    if (!response.ok) {
      status = 'failed';
      message = `HTTP Error: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    console.error(`Error executing task ${task.id}:`, error);
    status = 'failed';
    message = error instanceof Error ? error.message : 'Unknown error during fetch';
  }

  const endTime = process.hrtime.bigint();
  const responseTimeMs = Number(endTime - startTime) / 1_000_000;

  try {
    // Create a log entry for the execution
    await prisma.taskLog.create({
      data: {
        taskId: task.id,
        status,
        message,
        httpStatusCode,
        responseTimeMs,
      },
    });

    // Update the task's last run time and calculate the next run time
    const nextRun = new Date(now.getTime() + task.intervalMin * 60 * 1000);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastRun: now,
        nextRun: nextRun,
      },
    });

    console.log(`Task ${task.id} finished. Status: ${status}. Next run: ${nextRun.toISOString()}`);
  } catch (dbError) {
    console.error(`Failed to log or update task ${task.id} in DB:`, dbError);
  }
}