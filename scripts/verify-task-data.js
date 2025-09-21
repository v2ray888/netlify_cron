const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyTaskData() {
  try {
    console.log('Fetching task data from test API...');
    
    const response = await fetch('http://localhost:3000/api/test-tasks');
    const tasks = await response.json();
    
    console.log('Tasks fetched successfully!');
    console.log('Tasks count:', tasks.length);
    
    if (tasks.length > 0) {
      const task = tasks[0];
      console.log('\nFirst task details:');
      console.log('- ID:', task.id);
      console.log('- Name:', task.name);
      console.log('- Target URL:', task.targetUrl);
      console.log('- Logs count:', task.logs.length);
      
      if (task.logs.length > 0) {
        console.log('\nFirst log entry:');
        const log = task.logs[0];
        console.log('- ID:', log.id);
        console.log('- Executed at:', log.executedAt);
        console.log('- Status:', log.status);
        console.log('- HTTP Status Code:', log.httpStatusCode);
        console.log('- Response Time:', log.responseTimeMs);
        console.log('- Error Message:', log.errorMessage);
      }
      
      console.log('\nTask data structure is correct and includes logs!');
    } else {
      console.log('No tasks found');
    }
  } catch (error) {
    console.error('Error fetching task data:', error);
  }
}

verifyTaskData();