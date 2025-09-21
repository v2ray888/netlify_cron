#!/usr/bin/env node

// Netlify 构建脚本
// 在构建过程中执行数据库迁移

const { execSync } = require('child_process');

console.log('🚀 开始 Netlify 构建过程...');

try {
  // 生成 Prisma Client
  console.log('🔧 生成 Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 执行数据库迁移
  console.log('📋 执行数据库迁移...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ 数据库初始化完成');
  
  // 执行 Next.js 构建
  console.log('🏗️ 构建 Next.js 应用...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('🎉 构建完成');
} catch (error) {
  console.error('❌ 构建过程中出现错误:', error.message);
  process.exit(1);
}