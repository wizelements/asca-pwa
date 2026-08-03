import { cn } from "@/lib/utils";
import type { Task } from "@/lib/crm/types";
import { priorityLabel, taskStatusLabel } from "@/lib/crm/types";

export interface TaskListItemProps {
  task: Task;
  contactName?: string;
  onToggle?: () => void;
}

function formatDue(date?: string | Date): string {
  if (!date) return "No due date";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskListItem({
  task,
  contactName,
  onToggle,
}: TaskListItemProps) {
  const done = task.status === "done" || task.status === "cancelled";

  return (
    <li className="flex items-start gap-3 rounded-xl border border-admin-border-subtle bg-admin-surface p-4 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? "Mark as open" : "Mark as done"}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors",
          done
            ? "border-admin-success bg-admin-success text-white"
            : "border-admin-border-subtle bg-admin-surface hover:border-admin-primary"
        )}
      >
        {done && "✓"}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "font-semibold text-admin-fg-primary",
              done && "line-through text-admin-fg-muted"
            )}
          >
            {task.title}
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              task.priority === "high" && "bg-red-100 text-admin-danger",
              task.priority === "medium" && "bg-yellow-100 text-yellow-700",
              task.priority === "low" && "bg-blue-100 text-blue-700"
            )}
          >
            {priorityLabel(task.priority)}
          </span>
        </div>

        {task.description && (
          <p className="mt-1 text-sm text-admin-fg-secondary">{task.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-admin-fg-muted">
          <span className={cn(done && "text-admin-success")}>
            {taskStatusLabel(task.status)}
          </span>
          <span>Due {formatDue(task.dueDate)}</span>
          {task.assignedToName && <span>Assigned to {task.assignedToName}</span>}
          {contactName && <span>Related to {contactName}</span>}
        </div>
      </div>
    </li>
  );
}
