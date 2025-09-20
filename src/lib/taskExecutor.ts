import prisma from '@/lib/prisma';

/**
 * Executes a single task.
 * @param taskId The task ID to execute.
 */
export async function executeTask(taskId: string) {
  // Fetch the task from database
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  const now = new Date();

  if (!task.isEnabled) {
    console.log(`Task ${task.id} is not enabled. Skipping execution.`);
    return;
  }

  let status = 'success';
  let errorMessage: string | null = null;
  let httpStatusCode: number | null = null;
  const startTime = process.hrtime.bigint();

  try {
    console.log(`Executing task for URL: ${task.targetUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch(task.targetUrl, { 
      method: 'GET', 
      redirect: 'follow',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    httpStatusCode = response.status;

    if (!response.ok) {
      status = 'failed';
      errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    console.error(`Error executing task ${task.id}:`, error);
    status = 'failed';
    errorMessage = error instanceof Error ? error.message : 'Unknown error during fetch';
  }

  const endTime = process.hrtime.bigint();
  const responseTimeMs = Number(endTime - startTime) / 1_000_000;

  try {
    // Create a log entry for the execution
    await prisma.taskLog.create({
      data: {
        taskId: task.id,
        status,
        errorMessage,
        httpStatusCode,
        responseTimeMs,
      },
    });

    // Update the task's last run time and calculate the next run time
    const nextExecutionAt = new Date(now.getTime() + task.frequencyMinutes * 60 * 1000);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastExecutedAt: now,
        nextExecutionAt: nextExecutionAt,
      },
    });

    console.log(`Task ${task.id} finished. Status: ${status}. Next run: ${nextExecutionAt.toISOString()}`);
  } catch (dbError) {
    console.error(`Failed to log or update task ${task.id} in DB:`, dbError);
  }
}