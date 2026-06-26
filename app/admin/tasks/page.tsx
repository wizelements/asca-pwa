"use client";

import { useEffect, useMemo, useState } from "react";

import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import { TaskListItem } from "@/components/crm";
import { getAdminToken, logout } from "@/components/AdminGuard";
import type { ContactTask, TaskPriority, TaskStatus } from "@/lib/crm/types";
import { mapTaskForComponent, priorityLabel, taskStatusLabel } from "@/lib/crm/types";

const STATUSES: TaskStatus[] = ["open", "in_progress", "done", "cancelled"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<ContactTask[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | TaskStatus>("");
  const [priority, setPriority] = useState<"" | TaskPriority>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("viewer");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as TaskPriority,
    contactId: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [status, priority]);

  const fetchTasks = async () => {
    const token = getAdminToken();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const res = await fetch(`/api/admin/tasks?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError("Unable to load tasks.");
        return;
      }
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      try {
        const payload = JSON.parse(atob(token?.split(".")[1] || ""));
        setUserRole(payload.role || "viewer");
      } catch {
        setUserRole("viewer");
      }
    } catch {
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return result.sort(
      (a, b) =>
        new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
    );
  }, [tasks, query]);

  const toggleTask = async (taskId: number) => {
    if (userRole !== "admin" && userRole !== "editor") return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === "done" ? "open" : "done";
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) await fetchTasks();
    } catch {
      // ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "admin" && userRole !== "editor") return;
    setSaving(true);
    setError("");
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/contacts/${Number(form.contactId) || 0}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          priority: form.priority,
          assignedTo: form.assignedTo ? Number(form.assignedTo) : undefined,
        }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to create task.");
        return;
      }
      setModalOpen(false);
      setForm({ title: "", description: "", dueDate: "", priority: "medium", contactId: "", assignedTo: "" });
      await fetchTasks();
    } catch {
      setError("Unable to create task.");
    } finally {
      setSaving(false);
    }
  };

  const canAdd = userRole === "admin" || userRole === "editor";

  return (
    <>
      <AdminPageHeader
        title="Tasks"
        subtitle="Follow-ups, reminders, and action items for the ASCA team."
        primaryAction={
          canAdd ? (
            <AdminActionButton size="md" onClick={() => setModalOpen(true)}>
              + New task
            </AdminActionButton>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <AdminSection title="Filters">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-admin-fg-muted">Search</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Task title or description"
              className="mt-1 w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-admin-fg-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | TaskStatus)}
              className="mt-1 w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{taskStatusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-admin-fg-muted">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "" | TaskPriority)}
              className="mt-1 w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{priorityLabel(p)}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminSection>

      <div className="mt-6">
        {loading ? (
          <div className="text-sm text-admin-fg-muted">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon="☑️"
            title="No tasks found"
            description="Adjust filters or create your first follow-up."
            action={canAdd ? { label: "New task", onClick: () => setModalOpen(true) } : undefined}
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtered.map((task) => (
              <TaskListItem
                key={task.id}
                task={mapTaskForComponent(task)}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-admin-surface p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-admin-fg-primary">New Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Due date</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{priorityLabel(p)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Assigned to (user ID)</label>
                  <input
                    type="number"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Contact ID</label>
                <input
                  type="number"
                  value={form.contactId}
                  onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-admin-border-subtle px-4 py-2 text-admin-fg-primary hover:bg-admin-bg-subtle">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-admin-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
                  {saving ? "Saving..." : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
