'use client'

import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
}

export default function TaskCreateModal({ isOpen, onClose, onTaskCreated }: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUrl: '',
    httpMethod: 'GET',
    headers: '',
    body: '',
    cronExpression: '',
    frequencyMinutes: 5,
    timeoutSeconds: 30,
    retryAttempts: 3,
    retryDelaySeconds: 60
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let headers = null
      if (formData.headers.trim()) {
        try {
          headers = JSON.parse(formData.headers)
        } catch {
          throw new Error('请输入有效的 JSON 格式的请求头')
        }
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          headers,
          body: formData.body || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '创建任务失败')
      }

      onTaskCreated()
      onClose()
      setFormData({
        name: '',
        description: '',
        targetUrl: '',
        httpMethod: 'GET',
        headers: '',
        body: '',
        cronExpression: '',
        frequencyMinutes: 5,
        timeoutSeconds: 30,
        retryAttempts: 3,
        retryDelaySeconds: 60
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建任务失败')
    } finally {
      setLoading(false)
    }
  }

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  创建新任务
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        任务名称 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入任务名称"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HTTP 方法
                      </label>
                      <select
                        value={formData.httpMethod}
                        onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      目标 URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/api/endpoint"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="任务描述（可选）"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        执行频率（分钟）*
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.frequencyMinutes}
                        onChange={(e) => setFormData({ ...formData, frequencyMinutes: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        超时时间（秒）
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={formData.timeoutSeconds}
                        onChange={(e) => setFormData({ ...formData, timeoutSeconds: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        重试次数
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.retryAttempts}
                        onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      请求头（JSON 格式）
                    </label>
                    <textarea
                      value={formData.headers}
                      onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    />
                  </div>

                  {(formData.httpMethod === 'POST' || formData.httpMethod === 'PUT') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        请求体
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="请求体内容"
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                    >
                      {loading ? '创建中...' : '创建任务'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}