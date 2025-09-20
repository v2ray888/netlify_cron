"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    timestamp: string;
    environment: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    // 检查应用健康状态
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => setHealthStatus({ status: 'error', message: err.message }));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-4xl font-bold text-gray-900">
          定时任务管理系统
        </h1>
        
        {/* 健康状态显示 */}
        {healthStatus && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            healthStatus.status === 'ok' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            系统状态: {healthStatus.status} 
            {healthStatus.message && ` - ${healthStatus.message}`}
          </div>
        )}

        {session ? (
          <div className="text-center">
            <p className="mb-4 text-lg text-gray-700">
              欢迎回来，{session.user?.email}！
            </p>
            <p className="mb-6 text-gray-600">
              您的角色是：{session.user?.role}
            </p>
            <div className="space-x-4">
              <Link
                href="/dashboard"
                className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                前往控制台
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="inline-block rounded-md border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                退出登录
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-lg text-gray-700">
              请登录或注册以使用定时任务管理系统。
            </p>
            <div className="space-x-4">
              <Link
                href="/auth/signin"
                className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="inline-block rounded-md border border-transparent bg-gray-200 px-6 py-3 text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}