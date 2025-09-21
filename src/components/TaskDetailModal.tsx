'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string | null
}

export default function TaskDetailModal({ isOpen, onClose, taskId }: TaskDetailModalProps) {
  const [task, setTask] = useState<{
    id: string
    name: string
    targetUrl: string
    logs?: Array<{
      id: string
      status: string
      httpStatusCode?: number
      responseTimeMs?: number
      errorMessage?: string
      executedAt: string
    }>
  } | null>(null)
  const [loading, setLoading] = useState(false)


  useEffect(() => {
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

    if (isOpen && taskId) {
      fetchTaskDetails()
    }
  }, [isOpen, taskId])

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

                    {/* Content */}
                    <div className="px-6 py-4 max-h-96 overflow-y-auto">
                      <div className="space-y-3">
                        {task.logs && task.logs.length > 0 ? (
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
                                  <span>{formatDuration(log.responseTimeMs || null)}</span>
                                </div>
                              </div>
                              
                              {log.errorMessage && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  {log.errorMessage}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            暂无执行日志
                          </div>
                        )}
                      </div>
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