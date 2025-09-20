# GitHub Actions 定时任务设置指南

## 概述
由于 Vercel 免费账户只支持每日 cron 任务，我们使用 GitHub Actions 来实现每5分钟执行一次的定时任务。

## 设置步骤

### 1. 在 GitHub 仓库中设置 Secrets

前往你的 GitHub 仓库 → Settings → Secrets and variables → Actions，添加以下 secrets：

#### 必需的 Secrets：
- **`VERCEL_CRON_URL`**: 你的 Vercel 应用的 cron API 地址
  ```
  https://ds.121858.xyz/api/cron
  ```

- **`CRON_SECRET`**: 用于认证的密钥（自己设置一个强密码）
  ```
  例如: my-super-secret-cron-key-2024
  ```

### 2. 在 Vercel 中设置环境变量

前往 Vercel Dashboard → 你的项目 → Settings → Environment Variables，添加：

- **`CRON_SECRET`**: 与 GitHub Secrets 中设置的相同值

### 3. 工作流文件

已创建的 `.github/workflows/cron-trigger.yml` 文件会：
- 每5分钟执行一次（UTC 时间）
- 调用你的 `/api/cron` 端点
- 使用 Bearer token 认证
- 支持手动触发

### 4. 验证设置

1. **推送代码**到 GitHub
2. **等待几分钟**让 GitHub Actions 开始运行
3. **查看 Actions 页面**确认工作流正在执行
4. **检查你的应用日志**确认任务正在执行

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
1. 检查 GitHub Actions 页面是否有错误
2. 确认 Secrets 设置正确
3. 检查 Vercel 环境变量
4. 查看 Vercel 函数日志

### 如果认证失败：
1. 确保 `CRON_SECRET` 在 GitHub 和 Vercel 中完全一致
2. 检查 secret 名称拼写
3. 重新部署 Vercel 应用

## 成本说明

- ✅ **GitHub Actions**: 免费账户每月 2000 分钟
- ✅ **每5分钟执行**: 每月约 8640 次执行
- ✅ **每次执行约 10 秒**: 每月约 1440 分钟
- ✅ **完全免费**: 在免费额度内

这样你就可以绕过 Vercel 的 cron 限制，实现真正的每5分钟定时任务！🚀