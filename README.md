# 定时任务管理系统

一个基于 Next.js 15 的定时任务管理系统，支持用户注册登录后添加定时访问网站的任务。

## 功能特性

- 🔐 用户注册和登录系统
- ⏰ 创建和管理定时任务
- 🎯 自定义访问频率（分钟级别）
- 📊 任务执行历史记录
- 👨‍💼 管理员面板
- 🔄 自动定时执行（基于 Netlify Scheduled Functions）

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Neon)
- **认证**: NextAuth.js
- **ORM**: Prisma
- **部署**: Netlify

## 环境变量

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.netlify.app"
CRON_URL="https://your-domain.netlify.app/api/cron"
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
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - CRON_URL

### 定时任务配置：

Netlify 使用 Scheduled Functions 来执行定时任务，默认每小时执行一次。
如果需要更频繁的执行（如每分钟），建议使用外部服务如 cron-job.org 来触发 Netlify 函数。

---

最后更新: 2025/9/21