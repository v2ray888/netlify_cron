"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModernDashboardLayout from '@/components/ModernDashboardLayout';

interface TaskLog {
  id: string;
  executedAt: string;
  status: string;
  httpStatusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
}

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const router = useRouter();

  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [frequencyMinutes, setFrequencyMinutes] = useState(5);
  const [isEnabled, setIsEnabled] = useState(true);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task data");
        }
        const data = await response.json();
        setName(data.name);
        setTargetUrl(data.targetUrl);
        setHttpMethod(data.httpMethod || "GET");
        setHeaders(data.headers ? JSON.stringify(data.headers, null, 2) : "");
        setBody(data.body || "");
        setFrequencyMinutes(data.frequencyMinutes);
        setIsEnabled(data.isEnabled);
        // 获取前30条执行日志
        setLogs(data.logs?.slice(0, 30) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 验证并解析请求头
    let parsedHeaders = null;
    if (headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (err) {
        setError("请求头格式错误，请输入有效的JSON格式");
        return;
      }
    }

    // 验证请求体（仅对POST/PUT有效）
    if (body.trim() && httpMethod !== "POST" && httpMethod !== "PUT") {
      setError("只有POST和PUT方法才能设置请求体");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          targetUrl, 
          httpMethod,
          headers: parsedHeaders,
          body: body.trim() || undefined,
          frequencyMinutes, 
          isEnabled 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update task");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  const executeTask = async () => {
    try {
      setExecuting(true);
      const response = await fetch(`/api/tasks/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // 重新获取任务数据以更新执行记录
        const taskResponse = await fetch(`/api/tasks/${id}`);
        if (taskResponse.ok) {
          const data = await taskResponse.json();
          // 获取前30条执行日志
          setLogs(data.logs?.slice(0, 30) || []);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "执行任务失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "执行任务时发生未知错误");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">编辑任务</h1>
            <p className="mt-1 text-sm text-gray-500">修改定时任务的配置</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">任务名称</label>
                <input
                  id="name"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="httpMethod" className="block text-sm font-medium text-gray-700">HTTP 方法</label>
                <select
                  id="httpMethod"
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">目标URL</label>
                <input
                  id="targetUrl"
                  type="url"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="headers" className="block text-sm font-medium text-gray-700">
                  请求头 (JSON格式, 可选)
                </label>
                <textarea
                  id="headers"
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  请输入有效的JSON格式，例如: {`{"Authorization": "Bearer token"}`}
                </p>
              </div>
              
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                  请求体 (仅对POST/PUT有效, 可选)
                </label>
                <textarea
                  id="body"
                  placeholder='{"key": "value"}'
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={httpMethod !== "POST" && httpMethod !== "PUT"}
                />
                <p className="mt-1 text-xs text-gray-500">
                  请输入请求体内容，仅对POST和PUT方法有效
                </p>
              </div>
              
              <div>
                <label htmlFor="frequencyMinutes" className="block text-sm font-medium text-gray-700">执行频率（分钟）</label>
                <input
                  id="frequencyMinutes"
                  type="number"
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={frequencyMinutes}
                  onChange={(e) => setFrequencyMinutes(parseInt(e.target.value, 10))}
                />
              </div>
              <div className="flex items-center">
                <input
                  id="isEnabled"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
                <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-900">启用任务</label>
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={executeTask}
                  disabled={executing}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    executing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
                >
                  {executing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      执行中...
                    </>
                  ) : (
                    '立即执行'
                  )}
                </button>
                
                <div className="flex space-x-3">
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    取消
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    更新任务
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* 执行记录 */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">执行记录 (最近30条)</h2>
            <p className="mt-1 text-sm text-gray-500">查看任务的执行历史</p>
          </div>
          <div className="p-6">
            {logs.length === 0 ? (
              <p className="text-gray-500">暂无执行记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">执行时间</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HTTP状态码</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">响应时间</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">错误信息</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...logs].reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.executedAt).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : log.status === 'failed' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status === 'success' ? '成功' : log.status === 'failed' ? '失败' : log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.httpStatusCode || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.responseTimeMs ? `${log.responseTimeMs}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {log.errorMessage || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
}