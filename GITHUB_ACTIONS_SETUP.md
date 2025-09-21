# GitHub Actions 定时任务设置指南 (Netlify 版本)

## 概述
由于 Netlify 的 Scheduled Functions 免费账户只支持每小时 cron 任务，而 cron-job.org 提供了更灵活的定时任务选项，我们保留 GitHub Actions 作为备用方案。

## 设置步骤

### 1. 在 GitHub 仓库中设置 Secrets

前往你的 GitHub 仓库 → Settings → Secrets and variables → Actions，添加以下 secrets：

#### 必需的 Secrets：
- **`NETLIFY_CRON_URL`**: 你的 Netlify 应用的 cron API 地址
  ```
  https://your-site-name.netlify.app/api/cron
  ```

- **`CRON_SECRET`**: 用于认证的密钥（与 Netlify 环境变量中的值相同）
  ```
  例如: your-cron-secret-here
  ```

### 2. 在 Netlify 中设置环境变量

前往 Netlify Dashboard → 你的项目 → Settings → Environment Variables，添加：

- **`CRON_SECRET`**: 用于认证的密钥（与 GitHub Secrets 中设置的相同值）

### 3. 使用 cron-job.org（推荐）

1. 注册 [cron-job.org](https://cron-job.org/) 账户
2. 创建一个新的 cron job
3. 设置以下参数：
   - URL: `https://your-site-name.netlify.app/api/cron`
   - Schedule: 根据需要设置执行频率（例如每5分钟）
   - Authorization header: `Bearer your-cron-secret-here`
4. 保存并启用 cron job

### 4. 工作流文件

已创建的 `.github/workflows/cron-trigger.yml` 文件会：
- 每5分钟执行一次（UTC 时间）
- 调用你的 `/api/cron` 端点
- 使用简单的认证机制
- 支持手动触发

### 5. 验证设置

1. **推送代码**到 GitHub
2. **等待几分钟**让 GitHub Actions 开始运行（如果启用）
3. **在 cron-job.org 中检查任务执行情况**
4. **查看你的应用日志**确认任务正在执行

## 工作流特性

- ⏰ **每5分钟执行**: `*/5 * * * *`
- 🔒 **安全认证**: Bearer token 保护
- 🔄 **自动重试**: 失败时重试3次
- 📝 **详细日志**: 记录执行时间和状态
- 🎯 **手动触发**: 支持在 Actions 页面手动运行

## 时间说明

- GitHub Actions 使用 **UTC 时间**
- 每5分钟执行一次：00:00, 00:05, 00:10, 00:15...
- 北京时间 = UTC + 8小时

## 故障排除

### 如果任务没有执行：
1. 检查 cron-job.org 页面是否有错误
2. 确认 Secrets 设置正确
3. 检查 Netlify 环境变量
4. 查看 Netlify 函数日志

### 如果认证失败：
1. 确保 `CRON_SECRET` 在 GitHub、Netlify 和 cron-job.org 中完全一致
2. 检查 secret 名称拼写
3. 重新部署 Netlify 应用

## 成本说明

- ✅ **cron-job.org**: 免费账户支持每5分钟执行一次
- ✅ **GitHub Actions**: 免费账户每月 2000 分钟
- ✅ **每5分钟执行**: 每月约 8640 次执行
- ✅ **每次执行约 10 秒**: 每月约 1440 分钟
- ✅ **完全免费**: 在免费额度内

推荐使用 cron-job.org 作为主要的定时任务触发器，GitHub Actions 作为备用方案。