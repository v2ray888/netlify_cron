"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// 任务接口定义，匹配 Prisma 模型
interface Task {
  id: string;
  name: string;
  targetUrl: string;
  frequencyMinutes: number;
  isEnabled: boolean;
  lastExecutedAt: string | null;
  nextExecutionAt: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 分页状态
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  const totalPages = Math.ceil(totalTasks / pageSize);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchTasks = useCallback(async () => {
    if (status === "authenticated") {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/tasks?page=${page}&pageSize=${pageSize}`);
        if (!response.ok) {
          throw new Error("获取任务失败");
        }
        const data = await response.json();
        setTasks(data.tasks || []);
        setTotalTasks(data.totalTasks || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取任务失败");
      } finally {
        setLoading(false);
      }
    }
  }, [status, page, pageSize]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("确定要删除这个任务吗？")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "删除任务失败");
      }
      fetchTasks(); // 刷新任务列表
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除任务失败");
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    if (!window.confirm("确定要立即执行这个任务吗？")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/execute`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "执行任务失败");
      }
      alert("任务执行成功触发！");
      fetchTasks(); // 刷新以显示更新的执行时间
    } catch (err) {
      alert(err instanceof Error ? err.message : "执行任务失败");
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">我的任务</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">欢迎，{session?.user?.email}</span>
            <Link href="/dashboard/new" className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700">
              新建任务
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700">
              退出登录
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">任务名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">目标URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">频率(分钟)</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">上次执行</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">下次执行</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{task.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.targetUrl}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.frequencyMinutes}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${task.isEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {task.isEnabled ? "启用" : "禁用"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.lastExecutedAt ? new Date(task.lastExecutedAt).toLocaleString() : "未执行"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.nextExecutionAt ? new Date(task.nextExecutionAt).toLocaleString() : "未安排"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleExecuteTask(task.id)} className="text-green-600 hover:text-green-900">执行</button>
                      <Link href={`/dashboard/edit/${task.id}`} className="ml-4 text-indigo-600 hover:text-indigo-900">编辑</Link>
                      <button onClick={() => handleDeleteTask(task.id)} className="ml-4 text-red-600 hover:text-red-900">删除</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">暂无任务。点击&ldquo;新建任务&rdquo;开始创建您的第一个定时任务。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              上一页
            </button>
            <span className="text-sm text-gray-700">第 {page} 页，共 {totalPages} 页</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}