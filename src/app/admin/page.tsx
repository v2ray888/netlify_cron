"use client";

import { useSession, signOut } from "next-auth/react"; // Import signOut
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: string;
}

interface Task {
  id: string;
  url: string;
  intervalMin: number;
  active: boolean;
  lastRun: string | null;
  nextRun: string | null;
  user: {
    email: string;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]); // New state for tasks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");

  const handleExecuteTask = async (taskId: string) => {
    if (window.confirm("确定要立即执行此任务吗？")) {
      try {
        const response = await fetch(`/api/tasks/${taskId}/execute`, {
          method: "POST",
        });
        if (response.ok) {
          alert("任务已成功触发执行！");
          fetchTasks(); // Refresh tasks to see potential log updates
        } else {
          const errorData = await response.json();
          alert(`执行任务失败: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error executing task:", error);
        alert("执行任务时发生错误。");
      }
    }
  };

  // Pagination states for tasks
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize] = useState(10); // 每页显示10条
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const totalTaskPages = Math.ceil(totalTasksCount / taskPageSize);

  const fetchUsers = useCallback(async () => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      }
    }
  }, [session, status]);

  const fetchTasks = useCallback(async () => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/tasks?page=${taskPage}&pageSize=${taskPageSize}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks);
        setTotalTasksCount(data.totalTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }
  }, [session, status, taskPage, taskPageSize]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/"); // Redirect non-admin users
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchUsers();
      fetchTasks();
    }
  }, [fetchUsers, fetchTasks]);

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      await fetchUsers(); // Refresh user list
      setShowRoleModal(false);
      setEditingUser(null);
      setNewRole("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除此用户吗？所有相关的任务和日志也将被删除。")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers(); // Refresh user list
      await fetchTasks(); // Also refresh tasks as some might be deleted
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
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

  if (session?.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-red-600">无权访问此页面。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700"
          >
            退出登录
          </button>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-gray-800">用户管理</h2>
        {users.length === 0 ? (
          <p className="text-center text-gray-600">没有注册用户。</p>
        ) : (
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    邮箱
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    角色
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditRole(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        编辑角色
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        删除用户
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="mb-4 text-2xl font-semibold text-gray-800">所有任务</h2>
        {tasks.length === 0 && totalTasksCount === 0 ? (
          <p className="text-center text-gray-600">没有任务。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    创建者
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
                      {task.url}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.intervalMin}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.active ? "启用" : "禁用"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.lastRun
                        ? new Date(task.lastRun).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.nextRun
                        ? new Date(task.nextRun).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleExecuteTask(task.id)}
                        className="rounded-md bg-green-600 px-3 py-1 text-white shadow-sm hover:bg-green-700 text-xs"
                      >
                        立即执行
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls for Tasks */}
            {totalTaskPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setTaskPage((prev) => Math.max(prev - 1, 1))}
                  disabled={taskPage === 1}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-700">
                  第 {taskPage} / {totalTaskPages} 页 (共 {totalTasksCount} 条任务)
                </span>
                <button
                  onClick={() => setTaskPage((prev) => Math.min(prev + 1, totalTaskPages))}
                  disabled={taskPage === totalTaskPages}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}

        {/* Role Edit Modal */}
        {showRoleModal && editingUser && (
          <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-gray-500 bg-opacity-75">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                编辑用户角色
              </h2>
              <p className="mb-4 text-gray-700">
                正在编辑用户: {editingUser.email}
              </p>
              <div className="mb-4">
                <label
                  htmlFor="newRole"
                  className="block text-sm font-medium text-gray-700"
                >
                  新角色
                </label>
                <select
                  id="newRole"
                  name="newRole"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveRole}
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}