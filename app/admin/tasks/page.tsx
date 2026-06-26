"use client";

import { useMemo, useState } from "react";

import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import { TaskListItem } from "@/components/crm";
import { getMockContacts, getMockTasks } from "@/lib/crm/mock-data";
import type { Task, TaskPriority, TaskStatus } from "@/lib/crm/types";
import { priorityLabel, taskStatusLabel } from "@/lib/crm/types";

const STATUSES: TaskStatus[] = ["open", "in_progress", "done", "cancelled"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export default function TasksPage() {
  const initialTasks = useMemo(() => getMockTasks(), []);
  const contacts = useMemo(() => getMockContacts(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | TaskStatus>("");
  const [priority, setPriority] = useState<"" | TaskPriority>("");

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
    if (status) result = result.filter((t) => t.status === status);
    if (priority) result = result.filter((t) => t.priority === priority);
    return result.sort(
      (a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
    );
  }, [tasks, query, status, priority]);

  const toggleTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const done = t.status === "done";
        return {
          ...t,
          status: done ? "open" : "done",
          completedAt: done ? undefined : new Date().toISOString(),
        };
      })
    );
  };

  return (
    <>
      <AdminPageHeader
        title="Tasks"
        subtitle="Follow-ups, reminders, and action items for the ASCA team."
        primaryAction={
          <AdminActionButton size="md">+ New task</AdminActionButton>
        }
      />

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
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon="☑️"
            title="No tasks found"
            description="Adjust filters or create your first follow-up."
            action={{ label: "New task" }}
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtered.map((task) => {
              const related =
                task.relatedEntityType === "contact" && task.relatedEntityId
                  ? contacts.find((c) => c.id === task.relatedEntityId)
                  : undefined;
              return (
                <TaskListItem
                  key={task.id}
                  task={task}
                  contactName={
                    related
                      ? `${related.firstName} ${related.lastName}`
                      : undefined
                  }
                  onToggle={() => toggleTask(task.id)}
                />
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs text-admin-fg-muted">
        Demo tasks for foundation preview. Data resets on page refresh.
      </p>
    </>
  );
}
