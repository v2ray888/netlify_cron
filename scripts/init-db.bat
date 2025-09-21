@echo off
REM 数据库初始化脚本
REM 用于在 Netlify 部署时初始化数据库表

echo 开始数据库初始化...

REM 检查 DATABASE_URL 环境变量是否存在
if "%DATABASE_URL%"=="" (
  echo 错误: DATABASE_URL 环境变量未设置
  exit /b 1
)

echo DATABASE_URL 已设置

REM 使用 Prisma 迁移数据库
echo 执行数据库迁移...
npx prisma migrate deploy

if %errorlevel% equ 0 (
  echo 数据库迁移成功完成
) else (
  echo 数据库迁移失败
  exit /b 1
)

echo 数据库初始化完成