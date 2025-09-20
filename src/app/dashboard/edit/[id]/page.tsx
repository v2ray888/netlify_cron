"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Task {
  id: string;
  name: string;
  targetUrl: string;
  frequencyMinutes: number;
  isEnabled: boolean;
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [frequencyMinutes, setFrequencyMinutes] = useState(5);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task");
        }
        const data: Task = await response.json();
        setTask(data);
        setName(data.name);
        setTargetUrl(data.targetUrl);
        setFrequencyMinutes(data.frequencyMinutes);
        setIsEnabled(data.isEnabled);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, targetUrl, frequencyMinutes, isEnabled }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "更新任务失败");
        return;
      }

      setSuccess("任务更新成功！");
      router.push("/dashboard"); // Redirect to dashboard after successful update
    } catch (err) {
      setError("发生错误，请稍后再试。");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-red-600">错误: {error}</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">任务未找到。</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          编辑任务
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              任务名称
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="targetUrl"
              className="block text-sm font-medium text-gray-700"
            >
              目标URL
            </label>
            <input
              id="targetUrl"
              name="targetUrl"
              type="url"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="frequencyMinutes"
              className="block text-sm font-medium text-gray-700"
            >
              访问频率 (分钟)
            </label>
            <input
              id="frequencyMinutes"
              name="frequencyMinutes"
              type="number"
              required
              min="1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={frequencyMinutes}
              onChange={(e) => setFrequencyMinutes(parseInt(e.target.value, 10))}
            />
          </div>
          <div className="flex items-center">
            <input
              id="isEnabled"
              name="isEnabled"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
            />
            <label
              htmlFor="isEnabled"
              className="ml-2 block text-sm text-gray-900"
            >
              启用任务
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              更新任务
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-500">
            返回仪表盘
          </Link>
        </p>
      </div>
    </div>
  );
}