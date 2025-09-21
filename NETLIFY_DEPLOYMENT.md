# Netlify 部署指南

## 部署配置

### 1. Netlify 设置

在 Netlify 控制台中配置以下设置：

- **构建命令**: `node scripts/netlify-build.js`
- **发布目录**: `.next`
- **环境变量**:
  - `DATABASE_URL`: PostgreSQL 连接字符串
  - `NEXTAUTH_URL`: 站点 URL (例如: https://your-site.netlify.app)
  - `NEXTAUTH_SECRET`: 随机字符串用于加密

### 2. 构建过程

Netlify 构建过程包括以下步骤：

1. 生成 Prisma Client
2. 执行数据库迁移
3. 构建 Next.js 应用

### 3. 环境变量配置

在 Netlify 站点设置中配置以下环境变量：

```bash
DATABASE_URL=postgresql://neondb_owner:your_password@ep-your-instance-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=your_random_secret_string
```

### 4. 定时任务设置

使用 [cron-job.org](https://cron-job.org/) 设置定时任务：

1. 创建账户并登录
2. 点击 "CREATE CRONJOB"
3. 配置以下设置：
   - **Title**: 任意名称
   - **URL**: `https://your-site.netlify.app/api/cron`
   - **Execution**: 根据需要设置执行频率
   - **Authorization header**: `Bearer your-cron-secret-here`
4. 保存设置

### 5. 数据库初始化

Netlify 部署时会自动执行数据库迁移。构建脚本会按顺序执行以下操作：

1. 生成 Prisma Client
2. 部署数据库迁移
3. 构建 Next.js 应用

如果需要手动初始化数据库，可以运行：

```bash
npm run db:init
```

这将应用所有必要的数据库迁移，创建所需的表结构。

### 6. 验证部署

部署完成后，可以通过以下方式验证系统是否正常工作：

1. 访问站点主页
2. 尝试注册新账户
3. 登录并创建测试任务
4. 检查数据库表是否已创建：
   ```bash
   npx prisma studio
   ```

### 7. 故障排除

#### 数据库表未创建

如果发现数据库中没有表，请检查：

1. 构建日志中是否有数据库迁移错误
2. DATABASE_URL 环境变量是否正确配置
3. NeonDB 实例是否正在运行

#### API 路由问题

如果 API 路由返回 404 或 HTML 页面，请检查：

1. netlify.toml 重定向配置
2. API 路由文件路径是否正确
3. Netlify Functions 是否正确配置

#### 认证问题

如果登录/注册失败，请检查：

1. NEXTAUTH_URL 是否设置为正确的站点 URL
2. NEXTAUTH_SECRET 是否已设置
3. 数据库连接是否正常