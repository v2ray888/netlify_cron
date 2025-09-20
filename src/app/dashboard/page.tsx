"use client";

import { useSession, signOut } from "next-auth/react"; // Import signOut
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 每页显示10条
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
      try {
        const response = await fetch(`/api/tasks?page=${page}&pageSize=${pageSize}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks);
        setTotalTasks(data.totalTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }
  }, [status, page, pageSize]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // 当 status 或 page 改变时重新获取任务

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("确定要删除此任务吗？")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      fetchTasks(); // 刷新任务列表
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    if (!confirm("确定要立即执行此任务吗？")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to execute task");
      }

      alert("任务已成功触发执行！");
      fetchTasks(); // 刷新任务列表以显示更新后的执行时间
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute task");
    }
  };

  if (status === "loading" || loading) {
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          我的定时任务
        </h1>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            欢迎, {session?.user?.email}
          </h2>
          <div className="flex space-x-4">
            <Link
              href="/dashboard/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700"
            >
              添加新任务
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700"
            >
              退出登录
            </button>
          </div>
        </div>

        {tasks.length === 0 && totalTasks === 0 ? (
          <p className="text-center text-gray-600">
            您还没有创建任何任务。点击“添加新任务”开始吧！
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    任务名称
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    目标URL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    频率 (分钟)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    状态
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    上次执行
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    下次执行
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {task.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.targetUrl}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.frequencyMinutes}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.isEnabled ? "启用" : "禁用"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.lastExecutedAt
                        ? new Date(task.lastExecutedAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.nextExecutionAt
                        ? new Date(task.nextExecutionAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/edit/${task.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleExecuteTask(task.id)}
                        className="ml-4 text-green-600 hover:text-green-900"
                      >
                        立即执行
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-700">
                  第 {page} / {totalPages} 页 (共 {totalTasks} 条任务)
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}