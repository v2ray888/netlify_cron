"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [intervalMin, setIntervalMin] = useState(5);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task data");
        }
        const data = await response.json();
        setUrl(data.url);
        setIntervalMin(data.intervalMin);
        setActive(data.active);
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
        body: JSON.stringify({ url, intervalMin, active }),
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
    return <div className="flex min-h-screen items-center justify-center">Loading task...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">Edit Task</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Target URL</label>
            <input
              id="url"
              type="url"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="intervalMin" className="block text-sm font-medium text-gray-700">Interval (in minutes)</label>
            <input
              id="intervalMin"
              type="number"
              required
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={intervalMin}
              onChange={(e) => setIntervalMin(parseInt(e.target.value, 10))}
            />
          </div>
          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Task is Active</label>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Cancel
            </Link>
            <button
              type="submit"
              className="justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}