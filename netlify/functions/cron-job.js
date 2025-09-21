import { schedule } from "@netlify/functions";
import fetch from "node-fetch";

export default schedule("@hourly", async () => {
  const CRON_URL = process.env.CRON_URL || "http://localhost:3000/api/cron";
  const CRON_SECRET = process.env.CRON_SECRET || "default-secret";
  
  try {
    console.log("🚀 Netlify scheduled function triggering cron job...");
    const response = await fetch(CRON_URL, {
      method: "POST", // 使用 POST 方法以支持认证
      headers: {
        "User-Agent": "Netlify-Scheduled-Function/1.0",
        "Authorization": `Bearer ${CRON_SECRET}`
      }
    });
    
    const result = await response.json();
    console.log("✅ Cron job triggered successfully:", result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cron job triggered successfully",
        timestamp: new Date().toISOString(),
        result
      })
    };
  } catch (error) {
    console.error("❌ Error triggering cron job:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to trigger cron job",
        message: error.message
      })
    };
  }
});