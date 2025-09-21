// 测试脚本：验证生产环境中的 cron API 是否正常工作
async function testProductionCron() {
  try {
    console.log('Testing production cron API...');
    
    // 使用 node-fetch v3+ 的动态导入方式
    const { default: fetch } = await import('node-fetch');
    
    // 从环境变量获取配置
    const cronSecret = 'e777ec7db17b8356882614f541ff1a201296b9810e30692d5a070434e425ee2d'; // 与 .env 中的 CRON_SECRET 一致
    const apiUrl = 'https://zidonghua.netlify.app/api/cron';
    
    console.log(`Calling ${apiUrl} with Bearer token...`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Cron API test successful!');
    } else {
      console.log('❌ Cron API test failed!');
    }
  } catch (error) {
    console.error('Error testing cron API:', error);
  }
}

// 运行测试
testProductionCron();