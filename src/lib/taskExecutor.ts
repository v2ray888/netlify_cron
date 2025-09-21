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
  let responseSize: number | null = null;
  let requestHeaders: object | undefined = undefined;
  let responseHeaders: object | undefined = undefined;
  let responseBody: string | null = null;
  const startTime = process.hrtime.bigint();

  try {
    console.log(`Executing task for URL: ${task.targetUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), task.timeoutSeconds * 1000);

    // 构建请求选项
    const requestOptions: RequestInit = {
      method: task.httpMethod || 'GET',
      redirect: 'follow',
      signal: controller.signal
    };

    // 添加请求头
    if (task.headers) {
      requestOptions.headers = task.headers as Record<string, string>;
      requestHeaders = task.headers as object;
    }

    // 添加请求体（仅对POST/PUT有效）
    if (task.body && (task.httpMethod === 'POST' || task.httpMethod === 'PUT')) {
      requestOptions.body = task.body;
    }

    const response = await fetch(task.targetUrl, requestOptions);
    
    clearTimeout(timeoutId);
    httpStatusCode = response.status;
    responseSize = parseInt(response.headers.get('content-length') || '0');

    // 获取响应头
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    responseHeaders = headersObj;

    if (!response.ok) {
      status = 'failed';
      errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
    } else {
      // 读取响应体的前1000个字符
      const text = await response.text();
      responseBody = text.substring(0, 1000);
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
        responseSize,
        requestHeaders,
        responseHeaders,
        responseBody,
      },
    });

    // Update the task's last run time and calculate the next run time
    const nextExecutionAt = new Date(now.getTime() + task.frequencyMinutes * 60 * 1000);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastExecutedAt: now,
        nextExecutionAt: nextExecutionAt,
        successCount: {
          increment: status === 'success' ? 1 : 0
        },
        failureCount: {
          increment: status === 'failed' ? 1 : 0
        },
        avgResponseTime: responseTimeMs // 简单地更新为最后一次的响应时间（实际应用中应该计算平均值）
      },
    });

    console.log(`Task ${task.id} finished. Status: ${status}. Next run: ${nextExecutionAt.toISOString()}`);
  } catch (dbError) {
    console.error(`Failed to log or update task ${task.id} in DB:`, dbError);
  }
}