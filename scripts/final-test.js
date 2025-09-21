#!/usr/bin/env node

// 最终系统测试脚本
// 验证所有功能是否正常工作

const { PrismaClient } = require('@prisma/client');

async function finalTest() {
  console.log('🚀 开始最终系统测试...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接正常\n');
    
    // 2. 检查表结构
    console.log('2. 检查数据库表结构...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const expectedTables = ['User', 'Task', 'TaskLog', 'TaskNotification', 'SystemStats'];
    const tableNames = tables.map(t => t.table_name);
    
    let allTablesExist = true;
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        console.log(`✅ ${table} 表存在`);
      } else {
        console.log(`❌ ${table} 表缺失`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      throw new Error('数据库表结构不完整');
    }
    console.log('✅ 所有必需的表都已创建\n');
    
    // 3. 检查用户数据
    console.log('3. 检查用户数据...');
    const userCount = await prisma.user.count();
    console.log(`✅ 用户表记录数: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  用户表为空，建议创建测试用户');
    }
    console.log('');
    
    // 4. 验证环境变量
    console.log('4. 验证环境变量配置...');
    const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'CRON_SECRET'];
    let allEnvVarsSet = true;
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} 已设置`);
      } else {
        console.log(`❌ ${envVar} 未设置`);
        allEnvVarsSet = false;
      }
    }
    
    if (!allEnvVarsSet) {
      throw new Error('环境变量配置不完整');
    }
    console.log('✅ 所有必需的环境变量都已设置\n');
    
    // 5. 检查文件结构
    console.log('5. 检查项目文件结构...');
    const requiredFiles = [
      'netlify.toml',
      'package.json',
      'README.md',
      'NETLIFY_DEPLOYMENT.md',
      'netlify/functions/db-health-check.js',
      'netlify/functions/cron-job.js',
      'netlify/functions/high-frequency-cron.js'
    ];
    
    const fs = require('fs');
    const path = require('path');
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} 存在`);
      } else {
        console.log(`❌ ${file} 缺失`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      throw new Error('项目文件结构不完整');
    }
    console.log('✅ 所有必需的文件都已创建\n');
    
    console.log('🎉 所有测试通过！系统已准备就绪，可以部署到 Netlify。');
    console.log('\n📋 下一步操作：');
    console.log('1. 将代码推送到 GitHub');
    console.log('2. 在 Netlify 上连接仓库');
    console.log('3. 设置环境变量 (DATABASE_URL, NEXTAUTH_SECRET, CRON_SECRET)');
    console.log('4. 触发部署');
    console.log('5. 在 cron-job.org 上设置定时任务');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

finalTest();