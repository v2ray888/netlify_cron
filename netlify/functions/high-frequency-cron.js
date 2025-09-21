// Netlify 高频定时任务函数
// 用于处理需要更频繁执行的任务（如每分钟执行）

import { schedule } from "@netlify/functions";
import fetch from "node-fetch";

// 每5分钟执行一次的高频定时任务
// 注意：这会消耗更多的函数调用次数
export const handler = schedule("*/5 * * * *", async (event) => {
  const CRON_URL = process.env.CRON_URL || "http://localhost:3000/api/cron";
  const CRON_SECRET = process.env.CRON_SECRET || "default-secret";
  
  try {
    console.log("🚀 Netlify high-frequency cron job triggered at:", new Date().toISOString());
    
    const response = await fetch(CRON_URL, {
      method: "POST", // 使用 POST 方法以支持认证
      headers: {
        "User-Agent": "Netlify-High-Frequency-Cron/1.0",
        "Authorization": `Bearer ${CRON_SECRET}`
      }
    });
    
    const result = await response.json();
    console.log("✅ High-frequency cron job completed:", result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "High-frequency cron job executed successfully",
        timestamp: new Date().toISOString(),
        result
      })
    };
  } catch (error) {
    console.error("❌ Error in high-frequency cron job:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to execute high-frequency cron job",
        message: error.message
      })
    };
  }
});