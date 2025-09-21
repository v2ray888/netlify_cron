# 定时任务管理系统

一个基于 Next.js 15 的定时任务管理系统，支持用户注册登录后添加定时访问网站的任务。

## 功能特性

- 🔐 用户注册和登录系统
- ⏰ 创建和管理定时任务
- 🎯 自定义访问频率（分钟级别）
- 📊 任务执行历史记录
- 👨‍💼 管理员面板
- 🔄 自动定时执行（基于 Netlify Scheduled Functions 或 cron-job.org）

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Neon)
- **认证**: NextAuth.js
- **ORM**: Prisma
- **部署**: Netlify
- **定时任务**: cron-job.org

## 环境变量

```env
DATABASE_URL="postgresql://neondb_owner:npg_9rmeMWP3BZOg@ep-cold-haze-adtxrbhk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://zidonghua.netlify.app"
CRON_URL="https://zidonghua.netlify.app/api/cron"
CRON_SECRET="your-cron-secret"
```

## 本地开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建项目
npm run build
```

## 部署

项目已配置自动部署到 Netlify，推送到 master 分支即可触发部署。

### Netlify 部署步骤：

1. 在 Netlify 上创建新站点
2. 连接到你的 Git 仓库
3. 设置构建命令为 `npm run build`
4. 设置发布目录为 `.next`
5. 添加环境变量：
   - DATABASE_URL: `postgresql://neondb_owner:npg_9rmeMWP3BZOg@ep-cold-haze-adtxrbhk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - NEXTAUTH_SECRET: 生成一个强密钥
   - NEXTAUTH_URL: `https://zidonghua.netlify.app`
   - CRON_URL: `https://zidonghua.netlify.app/api/cron`
   - CRON_SECRET: 生成一个用于 cron 认证的密钥

### 定时任务配置：

系统支持多种定时任务触发方式：
1. Netlify Scheduled Functions (默认每小时执行)
2. cron-job.org (推荐，可自定义频率)
3. GitHub Actions (备用方案)

推荐使用 [cron-job.org](https://cron-job.org/) 来实现更频繁的定时任务执行。

访问地址：https://zidonghua.netlify.app

---

最后更新: 2025/9/21