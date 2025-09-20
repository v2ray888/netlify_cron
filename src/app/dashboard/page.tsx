"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// This interface now matches the Prisma model for Task
interface Task {
  id: string;
  url: string;
  intervalMin: number;
  active: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
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
  }, [fetchTasks]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete task");
      }
      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to execute this task now?")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/execute`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to execute task");
      }
      alert("Task execution triggered successfully!");
      fetchTasks(); // Refresh to show updated run times
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to execute task");
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {session?.user?.email}</span>
            <Link href="/dashboard/new" className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700">
              New Task
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700">
              Sign Out
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Interval (min)</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Next Run</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{task.url}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.intervalMin}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${task.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {task.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.lastRun ? new Date(task.lastRun).toLocaleString() : "N/A"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.nextRun ? new Date(task.nextRun).toLocaleString() : "N/A"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleExecuteTask(task.id)} className="text-green-600 hover:text-green-900">Execute</button>
                      <Link href={`/dashboard/edit/${task.id}`} className="ml-4 text-indigo-600 hover:text-indigo-900">Edit</Link>
                      <button onClick={() => handleDeleteTask(task.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}