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
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户设置</h1>
        <p className="mt-1 text-gray-600">管理您的账户设置和安全选项</p>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
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
    </div>
  )
}