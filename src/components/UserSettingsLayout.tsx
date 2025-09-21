'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ChangeEmailForm from './ChangeEmailForm'
import ChangePasswordForm from './ChangePasswordForm'

interface User {
  id: string
  email: string
  role: string
}

interface UserSettingsLayoutProps {
  user: User
}

export default function UserSettingsLayout({ user }: UserSettingsLayoutProps) {
  const pathname = usePathname()

  // 获取当前激活的标签页
  const getActiveTab = () => {
    if (pathname?.includes('/settings/password')) return 'password'
    if (pathname?.includes('/settings/profile')) return 'profile'
    return 'profile'
  }

  const activeTabState = getActiveTab()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">自动化定时任务平台</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden md:inline">欢迎, {user.email}</span>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                返回仪表板
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">用户设置</h1>
          <p className="mt-2 text-gray-600">管理您的账户设置和安全选项</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧导航树 */}
          <div className="lg:w-1/4">
            <nav className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">账户设置</h3>
              </div>
              <div className="divide-y divide-gray-200">
                <Link 
                  href="/dashboard/settings/profile"
                  className={`block px-6 py-4 text-sm font-medium ${
                    activeTabState === 'profile' 
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    个人信息
                  </div>
                </Link>
                <Link 
                  href="/dashboard/settings/password"
                  className={`block px-6 py-4 text-sm font-medium ${
                    activeTabState === 'password' 
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    修改密码
                  </div>
                </Link>
              </div>
            </nav>
          </div>

          {/* 右侧内容区域 */}
          <div className="lg:w-3/4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {activeTabState === 'profile' && <ChangeEmailForm user={user} />}
              {activeTabState === 'password' && <ChangePasswordForm user={user} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}