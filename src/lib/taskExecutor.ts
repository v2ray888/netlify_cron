import prisma from '@/lib/prisma';

export async function executeTask(taskId: string) {
  const now = new Date();
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || !task.isEnabled) {
    console.log(`Task ${taskId} is not found or not enabled. Skipping execution.`);
    return;
  }

  try {
    console.log(`Executing task "${task.name}" (${task.targetUrl})...`);
    const startTime = process.hrtime.bigint();
    const response = await fetch(task.targetUrl, { method: 'GET' }); // Assuming GET request for now
    const endTime = process.hrtime.bigint();
    const responseTimeMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

    const httpStatusCode = response.status;
    const status = response.ok ? 'success' : 'failed';
    const errorMessage = response.ok ? null : `HTTP Status: ${httpStatusCode}`;

    await prisma.taskLog.create({
      data: {
        taskId: task.id,
        status,
        httpStatusCode,
        errorMessage,
        responseTimeMs,
      },
    });

    const newNextExecutionAt = new Date(now.getTime() + task.frequencyMinutes * 60 * 1000);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastExecutedAt: now,
        nextExecutionAt: newNextExecutionAt,
      },
    });
    console.log(`Task "${task.name}" executed successfully. Status: ${status}, HTTP: ${httpStatusCode}, Response Time: ${responseTimeMs}ms. Next run at: ${newNextExecutionAt.toISOString()}`);
  } catch (taskError: any) {
    console.error(`Error executing task "${task.name}" (${task.targetUrl}):`, taskError);
    await prisma.taskLog.create({
      data: {
        taskId: task.id,
        status: 'failed',
        errorMessage: taskError.message || '未知错误',
      },
    });
    // Even if task execution fails, update nextExecutionAt to prevent immediate re-execution
    const newNextExecutionAt = new Date(now.getTime() + task.frequencyMinutes * 60 * 1000);
    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastExecutedAt: now,
        nextExecutionAt: newNextExecutionAt,
      },
    });
  }
}