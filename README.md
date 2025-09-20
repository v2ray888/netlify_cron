# 定时任务管理系统

一个基于 Next.js 15 的定时任务管理系统，支持用户注册登录后添加定时访问网站的任务。

## 功能特性

- 🔐 用户注册和登录系统
- ⏰ 创建和管理定时任务
- 🎯 自定义访问频率（分钟级别）
- 📊 任务执行历史记录
- 👨‍💼 管理员面板
- 🔄 自动定时执行（基于 Vercel Cron Jobs）

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Neon)
- **认证**: NextAuth.js
- **ORM**: Prisma
- **部署**: Vercel

## 环境变量

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"
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

项目已配置自动部署到 Vercel，推送到 master 分支即可触发部署。

---

最后更新: 2025/9/20