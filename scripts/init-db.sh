#!/bin/bash
# 数据库初始化脚本
# 用于在 Netlify 部署时初始化数据库表

echo "开始数据库初始化..."

# 检查 DATABASE_URL 环境变量是否存在
if [ -z "$DATABASE_URL" ]; then
  echo "错误: DATABASE_URL 环境变量未设置"
  exit 1
fi

echo "DATABASE_URL 已设置"

# 使用 Prisma 迁移数据库
echo "执行数据库迁移..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "数据库迁移成功完成"
else
  echo "数据库迁移失败"
  exit 1
fi

echo "数据库初始化完成"