'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // 新增状态来控制主内容区域显示的内容
  const [mainContent, setMainContent] = useState<'dashboard' | 'new' | 'settings'>('dashboard')
  const [settingsSubPage, setSettingsSubPage] = useState<'profile' | 'password'>('profile')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: enabled })
      })
      
      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const executeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        fetchTasks()
      } else {
        const errorData = await response.json()
        console.error('Failed to execute task:', errorData.message)
      }
    } catch (error) {
      console.error('Failed to execute task:', error)
    }
  }

  const deleteTask = async (taskId: string, taskName: string) => {
    if (!confirm(`确定要删除任务 "${taskName}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        fetchTasks()
      } else {
        const errorData = await response.json()
        console.error('Failed to delete task:', errorData.message)
        alert(`删除任务失败: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('删除任务时发生错误')
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
  const handleSidebarNavigation = (content: 'dashboard' | 'new' | 'settings', subPage?: 'profile' | 'password') => {
    setMainContent(content)
    if (content === 'settings' && subPage) {
      setSettingsSubPage(subPage)
    }
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg hidden md:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">任务平台</span>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{session?.user?.email}</p>
                <p className="text-xs text-gray-500">管理员</p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button
              onClick={() => handleSidebarNavigation('dashboard')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'dashboard'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
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
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新建任务
            </button>

            <button
              onClick={() => handleSidebarNavigation('settings')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'settings'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
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

      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 移动端侧边栏 */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">任务平台</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button
              onClick={() => handleSidebarNavigation('dashboard')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'dashboard'
                  ? 'bg-indigo-100 text-indigo-800'
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
                  ? 'bg-indigo-100 text-indigo-800'
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
              onClick={() => handleSidebarNavigation('settings')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full text-left ${
                activeItem === 'settings'
                  ? 'bg-indigo-100 text-indigo-800'
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

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' })
                setSidebarOpen(false)
              }}
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
      <div className="md:ml-64">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 md:ml-0 text-xl font-bold text-gray-900">
                {activeItem === 'dashboard' && '任务管理面板'}
                {activeItem === 'new' && '新建任务'}
                {activeItem === 'settings' && '用户设置'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline text-sm text-gray-700">
                欢迎, {session?.user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {mainContent === 'dashboard' && children}
            {mainContent === 'new' && (
              <iframe 
                src="/dashboard/new" 
                className="w-full h-[80vh] border-0"
                title="新建任务"
              ></iframe>
            )}
            {mainContent === 'settings' && (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* 左侧导航树 */}
                <div className="lg:w-1/4">
                  <nav className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">账户设置</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <button 
                        onClick={() => setSettingsSubPage('profile')}
                        className={`block w-full text-left px-6 py-4 text-sm font-medium ${
                          settingsSubPage === 'profile' 
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
                      </button>
                      <button 
                        onClick={() => setSettingsSubPage('password')}
                        className={`block w-full text-left px-6 py-4 text-sm font-medium ${
                          settingsSubPage === 'password' 
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
                      </button>
                    </div>
                  </nav>
                </div>

                {/* 右侧内容区域 */}
                <div className="lg:w-3/4">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <iframe 
                      key={`${settingsSubPage}-${mainContent}`}
                      src={`/dashboard/settings/${settingsSubPage}`} 
                      className="w-full h-[80vh] border-0"
                      title="用户设置"
                    ></iframe>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}