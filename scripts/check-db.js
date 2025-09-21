#!/usr/bin/env node

// 检查数据库连接和表结构

const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🚀 连接数据库...');
    
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接成功');
    
    // 检查表是否存在
    console.log('\n🔍 检查表结构...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 数据库中的表:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 检查用户表
    try {
      const userCount = await prisma.user.count();
      console.log(`\n👤 用户表记录数: ${userCount}`);
    } catch (error) {
      console.log('\n❌ 用户表不存在或无法访问');
    }
    
    // 检查任务表
    try {
      const taskCount = await prisma.task.count();
      console.log(`\n📝 任务表记录数: ${taskCount}`);
    } catch (error) {
      console.log('\n❌ 任务表不存在或无法访问');
    }
    
    console.log('\n✅ 数据库检查完成');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();