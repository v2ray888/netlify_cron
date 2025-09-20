export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">测试页面</h1>
        <p className="mt-4 text-gray-600">
          如果你能看到这个页面，说明 Next.js 路由工作正常。
        </p>
        <div className="mt-4">
          <p><strong>环境变量检查:</strong></p>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? '已配置' : '未配置'}</p>
          <p>DATABASE_URL: {process.env.DATABASE_URL ? '已配置' : '未配置'}</p>
        </div>
      </div>
    </div>
  );
}