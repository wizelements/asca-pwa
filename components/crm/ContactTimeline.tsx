import type { TimelineEvent } from "@/lib/crm/types";

export interface ContactTimelineProps {
  events: TimelineEvent[];
}

const TYPE_ICONS: Record<TimelineEvent["type"], string> = {
  note_added: "📝",
  task_created: "✅",
  task_completed: "🎉",
  submission_received: "📬",
  status_changed: "🏷️",
  tag_added: "🔖",
  event_rsvp: "📅",
  communication_sent: "✉️",
  ai_suggestion_viewed: "💡",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function ContactTimeline({ events }: ContactTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-admin-fg-muted">No timeline events yet.</p>
    );
  }

  return (
    <div className="relative pl-4">
      <div className="absolute left-[21px] top-2 bottom-2 w-px bg-admin-border-subtle" />
      <ul className="space-y-4">
        {events.map((event) => (
          <li key={event.id} className="relative flex items-start gap-3">
            <span className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-admin-bg-subtle text-xs">
              {TYPE_ICONS[event.type] || "•"}
            </span>
            <div className="flex-1 rounded-lg border border-admin-border-subtle bg-admin-surface p-3">
              <p className="text-sm font-medium text-admin-fg-primary">{event.title}</p>
              {event.description && (
                <p className="mt-1 text-sm text-admin-fg-secondary">{event.description}</p>
              )}
              <time className="mt-1 block text-xs text-admin-fg-muted">
                {formatDate(event.createdAt)} at {formatTime(event.createdAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
