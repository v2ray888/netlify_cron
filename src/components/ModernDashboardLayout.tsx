'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Task {
  id: string
  name: string
  targetUrl: string
  frequencyMinutes: number
  isEnabled: boolean
  lastExecutedAt: string | null
  nextExecutionAt: string | null
  logs: TaskLog[]
}

interface TaskLog {
  id: string
  executedAt: string
  status: string
  httpStatusCode: number | null
  responseTimeMs: number | null
  errorMessage: string | null
}

export default function ModernDashboardLayout({ 
  children,
  showSettings = false,
  settingsTab = 'profile'
}: { 
  children: React.ReactNode;
  showSettings?: boolean;
  settingsTab?: 'profile' | 'password';
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [mainContent, setMainContent] = useState<'dashboard' | 'new' | 'settings'>('dashboard')
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'password'>(settingsTab || 'profile')

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (showSettings) {
      setMainContent('settings')
      setSettingsSubTab(settingsTab || 'profile')
    }
  }, [showSettings, settingsTab])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  // 获取激活的侧边栏项
  const getActiveSidebarItem = () => {
    if (mainContent === 'settings') return 'settings'
    if (mainContent === 'new') return 'new'
    return 'dashboard'
  }

  const activeItem = getActiveSidebarItem()

  // 处理侧边栏导航
  const handleSidebarNavigation = (content: 'dashboard' | 'new' | 'settings', subTab?: 'profile' | 'password') => {
    setMainContent(content)
    if (content === 'settings' && subTab) {
      setSettingsSubTab(subTab)
    }
    setSidebarOpen(false)
    
    // 更新URL但不刷新页面
    if (content === 'dashboard') {
      window.history.pushState({}, '', '/dashboard')
    } else if (content === 'new') {
      window.history.pushState({}, '', '/dashboard/new')
    } else if (content === 'settings') {
      window.history.pushState({}, '', '/dashboard/settings')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-white">任务平台</span>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.email}</p>
                <p className="text-xs text-gray-500">管理员</p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => handleSidebarNavigation('dashboard')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClickCapture={() => setSidebarOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              仪表板
            </button>

            <button
              onClick={() => handleSidebarNavigation('new')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'new'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClickCapture={() => setSidebarOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新建任务
            </button>

            <button
              onClick={() => handleSidebarNavigation('settings', 'profile')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'settings'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClickCapture={() => setSidebarOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
          </nav>

          {/* 退出按钮 */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 lg:ml-0 text-xl font-bold text-gray-900">
                {activeItem === 'dashboard' && '任务管理面板'}
                {activeItem === 'new' && '新建任务'}
                {activeItem === 'settings' && '用户设置'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700 hidden md:inline">
                    {tasks.filter(t => t.isEnabled).length} 个活跃任务
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-700 hidden md:inline">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {mainContent === 'dashboard' && children}
          {mainContent === 'new' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <iframe 
                  src="/dashboard/new" 
                  className="w-full h-[80vh] border-0"
                  title="新建任务"
                ></iframe>
              </div>
            </div>
          )}
          {mainContent === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {/* 页面标题 */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">用户设置</h1>
                  <p className="mt-1 text-gray-600">管理您的账户设置和安全选项</p>
                </div>

                {/* 标签页导航 */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setSettingsSubTab('profile')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        settingsSubTab === 'profile'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      个人信息
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('password')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        settingsSubTab === 'password'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      修改密码
                    </button>
                  </nav>
                </div>

                {/* 内容区域 */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  {settingsSubTab === 'profile' && session?.user && <ChangeEmailForm user={session.user} />}
                  {settingsSubTab === 'password' && session?.user && <ChangePasswordForm user={session.user} />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

import ChangeEmailForm from './ChangeEmailForm'
import ChangePasswordForm from './ChangePasswordForm'