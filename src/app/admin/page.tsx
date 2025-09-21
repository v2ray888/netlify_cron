"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  targetUrl: string;
  frequencyMinutes: number;
  isEnabled: boolean;
  lastExecutedAt: string | null;
  nextExecutionAt: string | null;
  user: {
    email: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User management modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");

  // Pagination for tasks
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize] = useState(10);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const totalTaskPages = Math.ceil(totalTasksCount / taskPageSize);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tasks?page=${taskPage}&pageSize=${taskPageSize}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data.tasks);
      setTotalTasksCount(data.totalTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [taskPage, taskPageSize]);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        fetchUsers();
        fetchTasks();
      } else {
        router.push("/dashboard"); // Redirect non-admins
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, session?.user?.role, router, fetchUsers, fetchTasks]);

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新失败");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("确定要删除这个用户吗？这将删除用户及其所有任务。")) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
      fetchTasks(); // Refresh tasks as they might have been deleted
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role !== 'admin')) {
    return <div className="flex min-h-screen items-center justify-center">加载中或重定向...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">管理员控制台</h1>
          <button onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700">
            退出登录
          </button>
        </div>
        
        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        {/* User Management */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">用户管理</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">邮箱</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">角色</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role === 'admin' ? '管理员' : '用户'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditingUser(user); setNewRole(user.role); }} className="text-indigo-600 hover:text-indigo-900">编辑角色</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="ml-4 text-red-600 hover:text-red-900">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Management */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">所有任务</h2>
          {loading ? (
            <p>加载任务中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">任务名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">目标URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">频率(分钟)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">所有者</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">上次执行</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">下次执行</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tasks.length > 0 ? (
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
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.user.email}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.lastExecutedAt ? new Date(task.lastExecutedAt).toLocaleString() : "未执行"}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.nextExecutionAt ? new Date(task.nextExecutionAt).toLocaleString() : "未安排"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">暂无任务。</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalTaskPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => setTaskPage((p) => Math.max(1, p - 1))} disabled={taskPage === 1} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    上一页
                  </button>
                  <span className="text-sm text-gray-700">第 {taskPage} 页，共 {totalTaskPages} 页</span>
                  <button onClick={() => setTaskPage((p) => Math.min(totalTaskPages, p + 1))} disabled={taskPage === totalTaskPages} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    下一页
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-full max-w-md rounded-lg bg-white p-8">
            <h3 className="mb-4 text-xl font-bold">编辑 {editingUser.email} 的角色</h3>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="mb-4 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="user">用户</option>
              <option value="admin">管理员</option>
            </select>
            <div className="flex justify-end gap-4">
              <button onClick={() => setEditingUser(null)} className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300">取消</button>
              <button onClick={handleUpdateRole} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}