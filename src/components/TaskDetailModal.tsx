'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Task, TaskLog } from '@prisma/client'

interface TaskWithLogs extends Task {
  logs: TaskLog[]
  notifications: any[]
}

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string | null
}

export default function TaskDetailModal({ isOpen, onClose, taskId }: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskWithLogs | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('logs')

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails()
    }
  }, [isOpen, taskId])

  const fetchTaskDetails = async () => {
    if (!taskId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data)
      }
    } catch (error) {
      console.error('Failed to fetch task details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'timeout': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (!isOpen) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : task ? (
                  <>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                            {task.name}
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 mt-1">{task.targetUrl}</p>
                        </div>
                        <button
                          onClick={onClose}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="px-6 py-4 bg-gray-50 border-b">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{task.successCount}</div>
                          <div className="text-sm text-gray-500">成功次数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{task.failureCount}</div>
                          <div className="text-sm text-gray-500">失败次数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {task.successCount + task.failureCount > 0 
                              ? ((task.successCount / (task.successCount + task.failureCount)) * 100).toFixed(1)
                              : 0}%
                          </div>
                          <div className="text-sm text-gray-500">成功率</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatDuration(task.avgResponseTime)}
                          </div>
                          <div className="text-sm text-gray-500">平均响应时间</div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 py-4 border-b">
                      <nav className="flex space-x-8">
                        <button
                          onClick={() => setActiveTab('logs')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'logs'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          执行日志
                        </button>
                        <button
                          onClick={() => setActiveTab('config')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'config'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          配置信息
                        </button>
                      </nav>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 max-h-96 overflow-y-auto">
                      {activeTab === 'logs' ? (
                        <div className="space-y-3">
                          {task.logs.length > 0 ? (
                            task.logs.map((log) => (
                              <div key={log.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                                      {log.status}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(log.executedAt).toLocaleString('zh-CN')}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    {log.httpStatusCode && (
                                      <span>HTTP {log.httpStatusCode}</span>
                                    )}
                                    <span>{formatDuration(log.responseTimeMs)}</span>
                                    <span>{formatSize(log.responseSize)}</span>
                                  </div>
                                </div>
                                
                                {log.errorMessage && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                    {log.errorMessage}
                                  </div>
                                )}
                                
                                {log.responseBody && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                      查看响应内容
                                    </summary>
                                    <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-x-auto">
                                      {log.responseBody}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              暂无执行日志
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">HTTP 方法</label>
                              <div className="text-sm text-gray-900">{task.httpMethod}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">执行频率</label>
                              <div className="text-sm text-gray-900">每 {task.frequencyMinutes} 分钟</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">超时时间</label>
                              <div className="text-sm text-gray-900">{task.timeoutSeconds} 秒</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">重试次数</label>
                              <div className="text-sm text-gray-900">{task.retryAttempts} 次</div>
                            </div>
                          </div>
                          
                          {task.description && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                              <div className="text-sm text-gray-900">{task.description}</div>
                            </div>
                          )}
                          
                          {task.headers && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">请求头</label>
                              <pre className="text-sm bg-gray-50 p-2 rounded border overflow-x-auto">
                                {JSON.stringify(task.headers, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {task.body && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">请求体</label>
                              <pre className="text-sm bg-gray-50 p-2 rounded border overflow-x-auto">
                                {task.body}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        关闭
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    任务不存在或加载失败
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}