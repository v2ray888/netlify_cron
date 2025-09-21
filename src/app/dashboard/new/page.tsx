"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModernDashboardLayout from '@/components/ModernDashboardLayout';

export default function NewTaskPage() {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [frequencyMinutes, setFrequencyMinutes] = useState(5);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("请输入任务名称");
      return;
    }
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      setError("请输入有效的URL，以 http:// 或 https:// 开头");
      return;
    }
    if (frequencyMinutes < 1) {
      setError("执行频率至少为1分钟");
      return;
    }

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
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          targetUrl, 
          httpMethod, 
          headers: parsedHeaders,
          body: body.trim() || undefined,
          frequencyMinutes 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create task");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  return (
    <ModernDashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">创建新任务</h1>
            <p className="mt-1 text-sm text-gray-500">设置一个新的定时任务来定期访问指定的URL</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">任务名称</label>
                <input
                  id="name"
                  type="text"
                  placeholder="我的定时任务"
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
                  placeholder="https://example.com"
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
              
              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  取消
                </Link>
                <button
                  type="submit"
                  className="justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  创建任务
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
}