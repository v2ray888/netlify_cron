"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    timestamp?: string;
    environment?: Record<string, string>;
    message?: string;
  } | null>(null);

  useEffect(() => {
    // 检查应用健康状态
    const checkHealth = async () => {
      try {
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const response = await fetch('/api/health', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 检查响应状态
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 检查内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON but got ${contentType || 'unknown type'}. Response: ${text.substring(0, 200)}`);
        }
        
        const data = await response.json();
        setHealthStatus(data);
      } catch (error: any) {
        console.error('Health check failed:', error);
        
        // 处理不同类型的错误
        let errorMessage = '未知错误';
        if (error.name === 'AbortError') {
          errorMessage = '请求超时';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setHealthStatus({ 
          status: 'error', 
          message: errorMessage
        });
      }
    };

    checkHealth();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-lg text-gray-700">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">自动化定时任务平台</span>
              </div>
            </div>
            <div className="flex items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">欢迎, {session.user?.email}</span>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    控制台
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main>
        {/* 英雄区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
              <span className="block">自动化定时任务平台</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-600">
              专业的企业级定时任务管理系统，帮助您自动化网站访问、健康检查和数据抓取等任务
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  进入控制台
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    立即注册
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    登录账户
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 功能介绍 */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">核心功能</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                为企业提供全面的定时任务管理解决方案
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">精准定时</h3>
                      <p className="mt-5 text-base text-gray-500">
                        支持每分钟级别的精确任务调度，确保您的任务按时执行
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">实时监控</h3>
                      <p className="mt-5 text-base text-gray-500">
                        实时监控任务执行状态，提供详细的执行日志和性能指标
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">灵活配置</h3>
                      <p className="mt-5 text-base text-gray-500">
                        支持自定义HTTP方法、请求头和请求体，满足各种复杂场景需求
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">系统状态</h2>
              <div className="mt-8 max-w-3xl mx-auto">
                <div className={`rounded-lg p-6 ${healthStatus?.status === 'ok' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-center">
                    {healthStatus?.status === 'ok' ? (
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className={`ml-3 text-lg font-medium ${healthStatus?.status === 'ok' ? 'text-green-800' : 'text-red-800'}`}>
                      系统状态: {healthStatus?.status === 'ok' ? '正常运行' : '异常'}
                    </span>
                  </div>
                  {healthStatus?.message && (
                    <p className={`mt-2 text-center ${healthStatus?.status === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                      {healthStatus.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; 2025 自动化定时任务平台. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}