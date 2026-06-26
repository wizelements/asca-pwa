import { cn } from "@/lib/utils";
import type { Note } from "@/lib/crm/types";

export interface ContactNotesProps {
  notes: Note[];
  userRole?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactNotes({ notes, userRole = "viewer" }: ContactNotesProps) {
  const visibleNotes =
    userRole === "admin" || userRole === "editor"
      ? notes
      : notes.filter((n) => n.visibility !== "sensitive");

  if (visibleNotes.length === 0) {
    return (
      <p className="text-sm text-admin-fg-muted">
        {notes.some((n) => n.visibility === "sensitive")
          ? "Notes exist but are not visible at your permission level."
          : "No notes yet."}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {visibleNotes.map((note) => (
        <li
          key={note.id}
          className={cn(
            "rounded-lg border p-3",
            note.visibility === "sensitive"
              ? "border-red-200 bg-red-50"
              : "border-admin-border-subtle bg-admin-surface"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-admin-fg-secondary">
              {note.authorName || "Unknown author"}
            </span>
            <span className="text-xs text-admin-fg-muted">{formatDate(note.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-admin-fg-primary">{note.body}</p>
          {note.visibility === "sensitive" && (
            <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Sensitive — admin/editor only
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
