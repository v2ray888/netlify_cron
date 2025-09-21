-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "avgResponseTime" DOUBLE PRECISION,
ADD COLUMN     "body" TEXT,
ADD COLUMN     "cronExpression" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "failureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "httpMethod" TEXT NOT NULL DEFAULT 'GET',
ADD COLUMN     "retryAttempts" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "retryDelaySeconds" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "successCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeoutSeconds" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "public"."TaskLog" ADD COLUMN     "requestHeaders" JSONB,
ADD COLUMN     "responseBody" TEXT,
ADD COLUMN     "responseHeaders" JSONB,
ADD COLUMN     "responseSize" INTEGER,
ADD COLUMN     "retryAttempt" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."TaskNotification" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "events" TEXT[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemStats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalExecutions" INTEGER NOT NULL DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "failedRuns" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeTasks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SystemStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemStats_date_key" ON "public"."SystemStats"("date");

-- AddForeignKey
ALTER TABLE "public"."TaskNotification" ADD CONSTRAINT "TaskNotification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
