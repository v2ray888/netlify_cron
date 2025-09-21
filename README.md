# 自动化定时任务平台

一个基于 Next.js 15 和 Netlify 的定时任务管理系统，支持创建、管理和监控定时 HTTP 请求任务。

## 功能特性

- ✅ 创建和管理定时任务
- ✅ 支持 Cron 表达式和简单频率设置
- ✅ 任务执行日志和统计
- ✅ 用户认证和权限管理
- ✅ 任务通知系统
- ✅ 系统状态监控
- ✅ 响应式设计，支持移动端

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 框架**: Tailwind CSS + Headless UI
- **后端**: Next.js API Routes + Netlify Functions
- **数据库**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **部署**: Netlify

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd netlify_cron

# 安装依赖
npm install
```

### 2. 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# 数据库连接
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# NeonDB 连接示例
# DATABASE_URL=postgresql://neondb_owner:your_password@ep-your-instance-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. 数据库初始化

```bash
# 运行数据库迁移
npm run db:init

# 或者使用 Prisma 命令
npx prisma migrate dev

# 查看数据库结构
npm run db:studio
# 或者
npx prisma studio
```

✅ **数据库表已成功创建**:
- User (用户表)
- Task (任务表)
- TaskLog (任务日志表)
- TaskNotification (任务通知表)
- SystemStats (系统统计表)

### 4. 开发

```bash
# 启动开发服务器
npm run dev
```

### 5. 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## Netlify 部署

### 自动部署

1. 将代码推送到 GitHub
2. 在 Netlify 上连接仓库并配置构建设置
3. 设置环境变量 (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET)
4. 触发部署

### 数据库迁移

Netlify 部署时会自动执行数据库迁移。如果需要手动初始化数据库，可以运行：

```bash
npm run db:init
```

这将应用所有必要的数据库迁移，创建所需的表结构。

## 定时任务配置

本系统使用 [cron-job.org](https://cron-job.org/) 作为外部定时任务触发器：

1. 在 cron-job.org 创建账户
2. 创建新的 cron job
3. 设置 URL 为: `https://your-site.netlify.app/api/cron`
4. 配置执行频率
5. 在 Authorization header 中添加: `Bearer your-cron-secret-here`
6. 保存设置

## 目录结构

```
├── app/                 # Next.js 15 App Router
│   ├── api/            # API 路由
│   ├── auth/           # 认证相关页面
│   ├── dashboard/      # 仪表板页面
│   └── tasks/          # 任务管理页面
├── components/         # React 组件
├── lib/                # 工具库和业务逻辑
├── prisma/             # Prisma 数据库 schema 和迁移
├── netlify/functions/  # Netlify Functions
└── public/             # 静态资源
```

## 故障排除

### 数据库连接问题

如果遇到数据库连接问题，请检查：

1. DATABASE_URL 环境变量是否正确配置
2. NeonDB 实例是否正在运行
3. 网络连接是否正常

### 注册/登录问题

如果注册或登录失败，请检查：

1. 数据库表是否已创建 (运行 `npm run db:init`)
2. NEXTAUTH_SECRET 是否已设置
3. 控制台错误信息

## 许可证

MIT