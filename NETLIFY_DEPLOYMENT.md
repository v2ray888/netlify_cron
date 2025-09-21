# Netlify 部署指南

## 概述

本文档详细说明如何将定时任务管理系统部署到 Netlify 平台。

## 部署步骤

### 1. 准备工作

确保你已经：
- 注册了 Netlify 账户
- 准备好了 PostgreSQL 数据库（使用 Neon）
- 生成了 NextAuth 所需的密钥
- 注册了 cron-job.org 账户（用于定时任务触发）

### 2. 数据库设置 (Neon)

1. 在 [Neon](https://neon.tech/) 上创建账户
2. 创建一个新的 PostgreSQL 项目
3. 获取数据库连接字符串，格式如下：
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

### 3. Netlify 站点创建

1. 登录 Netlify 控制台
2. 点击 "Add new site" → "Import an existing project"
3. 连接到你的 Git 仓库（git@github.com:v2ray888/netlify_cron.git）
4. 设置构建配置：
   - Build command: `npm run build`
   - Publish directory: `.next`

### 4. 环境变量配置

在 Netlify 站点设置中添加以下环境变量：

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEXTAUTH_SECRET=your-strong-secret-key-here
NEXTAUTH_URL=https://your-site-name.netlify.app
CRON_URL=https://your-site-name.netlify.app/api/cron
CRON_SECRET=your-cron-secret-here
```

### 5. 定时任务配置 (cron-job.org)

由于 Netlify 的 Scheduled Functions 免费版只支持每小时执行一次，我们使用 cron-job.org 来实现更频繁的定时任务：

1. 注册 [cron-job.org](https://cron-job.org/) 账户
2. 创建一个新的 cron job
3. 设置以下参数：
   - URL: `https://your-site-name.netlify.app/api/cron`
   - Schedule: 根据需要设置执行频率（例如每5分钟）
   - Authorization header: `Bearer your-cron-secret-here`
4. 保存并启用 cron job

### 6. 部署

1. 推送代码到 master 分支
2. Netlify 会自动开始构建和部署
3. 部署完成后，访问你的站点 URL

## 高级配置

### 自定义定时频率

如果您想使用 Netlify 的内置定时功能，可以编辑 `netlify/functions/cron-job.js` 文件中的 schedule 表达式：

```javascript
// 每小时执行
export default schedule("@hourly", handler);

// 每天执行
// export default schedule("@daily", handler);

// 自定义 cron 表达式（例如每5分钟）
// export default schedule("*/5 * * * *", handler);
```

### Neon 数据库优化

Neon 提供了一些独特的功能，您可以利用：

1. 无服务器架构：自动扩展
2. 分支功能：用于开发和测试
3. 内置连接池：提高性能

确保在连接字符串中使用适当的 SSL 模式。

## 故障排除

### 构建失败

1. 检查依赖是否正确安装
2. 确认 Node.js 版本兼容（建议使用 Netlify 默认版本）
3. 查看构建日志中的具体错误信息

### 数据库连接问题

1. 验证 DATABASE_URL 是否正确
2. 检查数据库是否允许来自 Netlify 的连接
3. 确认数据库凭证是否正确
4. 确保 Neon 项目处于活动状态

### 定时任务不执行

1. 检查 cron-job.org 的任务状态
2. 验证 CRON_URL 环境变量是否正确设置
3. 确认 CRON_SECRET 是否匹配
4. 查看 Netlify 函数日志确认是否有错误

## 成本说明

- Netlify 免费套餐提供：
  - 100GB 带宽/月
  - 300 分钟构建时间/月
  - 125K 函数调用/月
  - 100 小时函数执行时间/月

- Neon PostgreSQL 数据库：
  - 免费套餐提供 1GB 存储和 10GB 传输/月

- cron-job.org：
  - 免费套餐提供每5分钟执行一次的定时任务

对于中小型应用，免费套餐通常足够使用。