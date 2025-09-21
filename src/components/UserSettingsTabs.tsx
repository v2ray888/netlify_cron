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

interface UserSettingsTabsProps {
  user: User
}

export default function UserSettingsTabs({ user }: UserSettingsTabsProps) {
  const pathname = usePathname()

  // 获取当前激活的标签页
  const getActiveTab = () => {
    if (pathname?.includes('/settings/password')) return 'password'
    if (pathname?.includes('/settings/profile')) return 'profile'
    return 'profile'
  }

  const activeTab = getActiveTab()

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

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/dashboard/settings/profile"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              个人信息
            </Link>
            <Link
              href="/dashboard/settings/password"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              修改密码
            </Link>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === 'profile' && <ChangeEmailForm user={user} />}
          {activeTab === 'password' && <ChangePasswordForm user={user} />}
        </div>
      </main>
    </div>
  )
}