"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import {
  ContactNotes,
  ContactProfileHeader,
  ContactTimeline,
  TaskListItem,
} from "@/components/crm";
import { getAdminToken, logout } from "@/components/AdminGuard";
import type {
  Contact,
  ContactActivity,
  ContactMessage,
  ContactNote,
  ContactTag,
  ContactTask,
  NoteVisibility,
  TaskPriority,
  TaskStatus,
} from "@/lib/crm/types";
import {
  contactDisplayName,
  mapActivityToTimelineEvent,
  mapContactForComponent,
  mapNoteForComponent,
  mapTaskForComponent,
  messageStatusLabel,
  taskStatusLabel,
} from "@/lib/crm/types";

export default function ContactDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [contact, setContact] = useState<Contact | null>(null);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [tasks, setTasks] = useState<ContactTask[]>([]);
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("viewer");
  const [userId, setUserId] = useState<number>(0);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ note: "", visibility: "admin" as NoteVisibility });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as TaskPriority,
    assignedTo: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    const token = getAdminToken();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError("Unable to load contact.");
        return;
      }
      const data = await res.json();
      setContact(data.contact || null);
      setTags(data.tags || []);
      setMessages(data.messages || []);
      setNotes(data.notes || []);
      setTasks(data.tasks || []);
      setActivities(data.activities || []);
      setEditForm(data.contact || {});
      // Decode a minimal token payload for role/user id (no secret needed, server validates)
      try {
        const payload = JSON.parse(atob(token?.split(".")[1] || ""));
        setUserRole(payload.role || "viewer");
        setUserId(Number(payload.sub) || 0);
      } catch {
        setUserRole("viewer");
      }
    } catch {
      setError("Unable to load contact.");
    } finally {
      setLoading(false);
    }
  };

  const canWrite = userRole === "admin" || userRole === "editor";

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError("");
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/contacts/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteForm),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to add note.");
        return;
      }
      setNoteModalOpen(false);
      setNoteForm({ note: "", visibility: "admin" });
      await fetchData();
    } catch {
      setError("Unable to add note.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError("");
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/contacts/${id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...taskForm,
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
          assignedTo: taskForm.assignedTo ? Number(taskForm.assignedTo) : undefined,
        }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to add task.");
        return;
      }
      setTaskModalOpen(false);
      setTaskForm({ title: "", description: "", dueDate: "", priority: "medium", assignedTo: "" });
      await fetchData();
    } catch {
      setError("Unable to add task.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    if (!canWrite) return;
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
      if (res.ok) await fetchData();
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError("");
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to update contact.");
        return;
      }
      setEditModalOpen(false);
      await fetchData();
    } catch {
      setError("Unable to update contact.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading contact...</div>;

  if (!contact) {
    return (
      <AdminEmptyState
        icon="🤝"
        title="Contact not found"
        description="This contact does not exist or has been removed."
        action={{ label: "Back to contacts", href: "/admin/contacts" }}
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title={contactDisplayName(contact)}
        backHref="/admin/contacts"
        secondaryAction={
          canWrite ? (
            <AdminActionButton variant="secondary" size="sm" onClick={() => setEditModalOpen(true)}>
              Edit contact
            </AdminActionButton>
          ) : undefined
        }
        primaryAction={
          canWrite ? (
            <AdminActionButton size="sm" onClick={() => setNoteModalOpen(true)}>
              + Add note
            </AdminActionButton>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <ContactProfileHeader contact={mapContactForComponent(contact, tags)} tags={tags} />

          <AdminSection title={`Tasks (${tasks.length})`}>
            {canWrite && (
              <div className="mb-3">
                <AdminActionButton size="sm" onClick={() => setTaskModalOpen(true)}>
                  + Add task
                </AdminActionButton>
              </div>
            )}
            {tasks.length === 0 ? (
              <p className="text-sm text-admin-fg-muted">No tasks for this contact yet.</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={mapTaskForComponent(task)}
                    onToggle={() => handleToggleTask(task.id)}
                  />
                ))}
              </ul>
            )}
          </AdminSection>

          <AdminSection title={`Messages (${messages.length})`}>
            {messages.length === 0 ? (
              <p className="text-sm text-admin-fg-muted">No messages yet.</p>
            ) : (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-lg border border-admin-border-subtle bg-admin-surface p-3">
                    <p className="text-sm font-medium text-admin-fg-primary">{m.subject || "Message"}</p>
                    <p className="mt-1 text-sm text-admin-fg-secondary line-clamp-3">{m.message || "-"}</p>
                    <p className="mt-2 text-xs text-admin-fg-muted">{messageStatusLabel(m.status)}</p>
                  </li>
                ))}
              </ul>
            )}
          </AdminSection>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AdminSection title="Timeline">
            <ContactTimeline
              events={activities.map(mapActivityToTimelineEvent)}
            />
          </AdminSection>

          <AdminSection title={`Notes (${notes.length})`}>
            <ContactNotes
              notes={notes.map(mapNoteForComponent)}
              userRole={userRole}
            />
          </AdminSection>
        </div>
      </div>

      {noteModalOpen && (
        <Modal onClose={() => setNoteModalOpen(false)} title="Add Note">
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Note</label>
              <textarea
                value={noteForm.note}
                onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Visibility</label>
              <select
                value={noteForm.visibility}
                onChange={(e) => setNoteForm({ ...noteForm, visibility: e.target.value as NoteVisibility })}
                className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
              >
                <option value="admin">Admin visible</option>
                <option value="sensitive">Sensitive (admin/editor only)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setNoteModalOpen(false)} className="rounded-lg border border-admin-border-subtle px-4 py-2 text-admin-fg-primary hover:bg-admin-bg-subtle">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-admin-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
                {saving ? "Saving..." : "Add note"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {taskModalOpen && (
        <Modal onClose={() => setTaskModalOpen(false)} title="Add Task">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Title</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Due date</label>
                <input
                  type="datetime-local"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Assigned to (user ID)</label>
              <input
                type="number"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setTaskModalOpen(false)} className="rounded-lg border border-admin-border-subtle px-4 py-2 text-admin-fg-primary hover:bg-admin-bg-subtle">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-admin-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
                {saving ? "Saving..." : "Add task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editModalOpen && contact && (
        <Modal onClose={() => setEditModalOpen(false)} title="Edit Contact">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">First name</label>
                <input
                  type="text"
                  value={editForm.firstName ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value || undefined })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Last name</label>
                <input
                  type="text"
                  value={editForm.lastName ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value || undefined })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Email</label>
                <input
                  type="email"
                  value={editForm.email ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value || undefined })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value || undefined })}
                  className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Notes summary</label>
              <textarea
                value={editForm.notesSummary ?? ""}
                onChange={(e) => setEditForm({ ...editForm, notesSummary: e.target.value || undefined })}
                rows={3}
                className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg border border-admin-border-subtle px-4 py-2 text-admin-fg-primary hover:bg-admin-bg-subtle">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-admin-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-admin-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-admin-fg-primary">{title}</h2>
          <button onClick={onClose} className="rounded-lg border border-admin-border-subtle px-3 py-1 text-sm text-admin-fg-primary hover:bg-admin-bg-subtle">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
