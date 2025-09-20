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
  url: string;
  intervalMin: number;
  active: boolean;
  lastRun: string | null;
  nextRun: string | null;
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
      if (session.user?.role === "admin") {
        fetchUsers();
        fetchTasks();
      } else {
        router.push("/dashboard"); // Redirect non-admins
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, session, router, fetchUsers, fetchTasks]);

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
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure? This will delete the user and all their tasks.")) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
      fetchTasks(); // Refresh tasks as they might have been deleted
    } catch (err) {
      alert(err instanceof Error ? err.message : "Deletion failed");
    }
  };

  if (status === "loading" || (status === "authenticated" && session.user.role !== 'admin')) {
    return <div className="flex min-h-screen items-center justify-center">Loading or redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700">
            Sign Out
          </button>
        </div>
        
        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        {/* User Management */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* ... table head ... */}
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditingUser(user); setNewRole(user.role); }} className="text-indigo-600 hover:text-indigo-900">Edit Role</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Management */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">All Tasks</h2>
          {/* ... task table ... */}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-full max-w-md rounded-lg bg-white p-8">
            <h3 className="mb-4 text-xl font-bold">Edit Role for {editingUser.email}</h3>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="mb-4 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <div className="flex justify-end gap-4">
              <button onClick={() => setEditingUser(null)} className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300">Cancel</button>
              <button onClick={handleUpdateRole} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}