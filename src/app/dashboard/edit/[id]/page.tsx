"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const router = useRouter();

  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [frequencyMinutes, setFrequencyMinutes] = useState(5);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
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
        setFrequencyMinutes(data.frequencyMinutes);
        setIsEnabled(data.isEnabled);
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

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, targetUrl, frequencyMinutes, isEnabled }),
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

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载任务中...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">编辑任务</h1>
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
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              取消
            </Link>
            <button
              type="submit"
              className="justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              更新任务
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}