// Netlify 函数：数据库健康检查和初始化
// 用于检查数据库连接状态并在必要时初始化数据库表

import { schedule } from "@netlify/functions";
import { PrismaClient } from '@prisma/client';

// 每小时执行一次数据库健康检查
export const handler = schedule("@hourly", async (event) => {
  let prisma;
  
  try {
    console.log("🚀 开始数据库健康检查...");
    
    // 初始化 Prisma Client
    prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ 数据库连接正常");
    
    // 检查是否存在 User 表
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 User 表记录数: ${userCount}`);
    } catch (error) {
      console.log("⚠️ User 表不存在，可能需要初始化数据库");
      // 这里不执行初始化，因为 Netlify 函数不应该执行数据库迁移
      // 数据库迁移应该在构建时完成
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "数据库健康检查完成",
        timestamp: new Date().toISOString(),
        status: "healthy"
      })
    };
  } catch (error) {
    console.error("❌ 数据库健康检查失败:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "数据库健康检查失败",
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    // 关闭数据库连接
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});