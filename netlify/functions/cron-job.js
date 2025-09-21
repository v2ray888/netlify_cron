import { schedule } from "@netlify/functions";
import fetch from "node-fetch";

export default schedule("@hourly", async () => {
  const CRON_URL = process.env.CRON_URL || "http://localhost:3000/api/cron";
  const CRON_SECRET = process.env.CRON_SECRET || "default-secret";
  
  try {
    console.log("🚀 Netlify scheduled function triggering cron job...");
    const response = await fetch(CRON_URL, {
      method: "POST",
      headers: {
        "User-Agent": "Netlify-Scheduled-Function/1.0",
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