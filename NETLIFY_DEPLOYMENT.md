# Netlify 部署指南

## 概述

本文档详细说明如何将定时任务管理系统部署到 Netlify 平台。

## 部署步骤

### 1. 准备工作

确保你已经：
- 注册了 Netlify 账户
- 准备好了 PostgreSQL 数据库（推荐使用 Neon）
- 生成了 NextAuth 所需的密钥

### 2. 数据库设置

1. 在 Neon 或其他 PostgreSQL 服务上创建数据库
2. 获取数据库连接字符串，格式如下：
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
```

### 5. 定时任务配置

Netlify 提供了 Scheduled Functions 功能来执行定时任务：

1. 系统默认使用 `netlify/functions/cron-job.js` 函数
2. 默认每小时执行一次（@hourly）
3. 该函数会调用你的应用的 `/api/cron` 端点

如果需要更频繁的执行（如每分钟），可以：
1. 使用外部服务如 cron-job.org
2. 配置该服务定期调用你的 Netlify 站点的 `/api/cron` 端点

### 6. 部署

1. 推送代码到 master 分支
2. Netlify 会自动开始构建和部署
3. 部署完成后，访问你的站点 URL

## 高级配置

### 自定义定时频率

如果需要修改定时任务的执行频率，可以编辑 `netlify/functions/cron-job.js` 文件中的 schedule 表达式：

```javascript
// 每小时执行
export default schedule("@hourly", handler);

// 每天执行
// export default schedule("@daily", handler);

// 自定义 cron 表达式（例如每5分钟）
// export default schedule("*/5 * * * *", handler);
```

### 更换数据库提供商

如果不想使用 Neon，可以使用其他 PostgreSQL 服务：
- Supabase
- AWS RDS
- Google Cloud SQL
- Heroku Postgres

只需确保：
1. 数据库可从 Netlify 访问
2. 正确配置了连接字符串
3. 防火墙规则允许连接

## 故障排除

### 构建失败

1. 检查依赖是否正确安装
2. 确认 Node.js 版本兼容（建议使用 Netlify 默认版本）
3. 查看构建日志中的具体错误信息

### 数据库连接问题

1. 验证 DATABASE_URL 是否正确
2. 检查数据库是否允许来自 Netlify 的连接
3. 确认数据库凭证是否正确

### 定时任务不执行

1. 检查 Netlify Functions 是否正确部署
2. 查看函数日志确认是否有错误
3. 验证 CRON_URL 环境变量是否正确设置

## 成本说明

- Netlify 免费套餐提供：
  - 100GB 带宽/月
  - 300 分钟构建时间/月
  - 125K 函数调用/月
  - 100 小时函数执行时间/月

- PostgreSQL 数据库（以 Neon 为例）：
  - 免费套餐提供 1GB 存储和 10GB 传输/月

对于中小型应用，免费套餐通常足够使用。