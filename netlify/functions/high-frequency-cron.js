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
      method: "POST",
      headers: {
        "User-Agent": "Netlify-High-Frequency-Cron/1.0",
        "Authorization": `Bearer ${CRON_SECRET}`
      }
    });
    
    // 检查响应状态
    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ HTTP Error: ${response.status} - ${response.statusText}`, text.substring(0, 200));
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    // 检查内容类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`❌ Expected JSON but got ${contentType || 'unknown type'}`, text.substring(0, 200));
      throw new Error(`Expected JSON but got ${contentType || 'unknown type'}`);
    }
    
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