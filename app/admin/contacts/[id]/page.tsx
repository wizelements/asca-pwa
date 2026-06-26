"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

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
import {
  getMockContactById,
  getMockNotesForContact,
  getMockTags,
  getMockTasks,
  getMockTimelineForContact,
} from "@/lib/crm/mock-data";
import { contactDisplayName } from "@/lib/crm/types";

export default function ContactDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const tags = useMemo(() => getMockTags(), []);
  const contact = useMemo(() => getMockContactById(id), [id]);
  const notes = useMemo(() => getMockNotesForContact(id), [id]);
  const timeline = useMemo(() => getMockTimelineForContact(id), [id]);
  const allTasks = useMemo(() => getMockTasks(), []);
  const contactTasks = useMemo(
    () => allTasks.filter(
        (t) => t.relatedEntityType === "contact" && t.relatedEntityId === id
      ),
    [allTasks, id]
  );

  const [tasks, setTasks] = useState(contactTasks);

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
        title={contactDisplayName(contact)}
        backHref="/admin/contacts"
        secondaryAction={
          <AdminActionButton variant="secondary" size="sm">Edit contact</AdminActionButton>
        }
        primaryAction={
          <AdminActionButton size="sm">+ Add note</AdminActionButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <ContactProfileHeader contact={contact} tags={tags} />

          <AdminSection title={`Tasks (${tasks.length})`}>
            {tasks.length === 0 ? (
              <p className="text-sm text-admin-fg-muted">No tasks for this contact yet.</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                  />
                ))}
              </ul>
            )}
          </AdminSection>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AdminSection title="Timeline">
            <ContactTimeline events={timeline} />
          </AdminSection>

          <AdminSection title={`Notes (${notes.length})`}>
            <ContactNotes notes={notes} userRole="editor" />
          </AdminSection>
        </div>
      </div>
    </>
  );
}
