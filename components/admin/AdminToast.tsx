"use client";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface AdminToastProps {
  message: string;
  variant?: ToastVariant;
  action?: ToastAction;
  onDismiss?: () => void;
  progress?: number;
  paused?: boolean;
  entered?: boolean;
  onPauseChange?: (paused: boolean) => void;
}

const iconPaths: Record<ToastVariant, React.ReactNode> = {
  success: <path d="m4.5 12 5 5L20 6.5" />,
  error: <path d="m7 7 10 10M17 7 7 17" />,
  info: <path d="M12 11v6m0-10h.01" />,
  warning: <path d="M12 9v4m0 4h.01M10.3 4.6 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />,
};

export default function AdminToast({
  message,
  variant = "success",
  action,
  onDismiss,
  progress = 1,
  paused = false,
  entered = true,
  onPauseChange,
}: AdminToastProps) {
  const pause = () => onPauseChange?.(true);
  const resume = () => onPauseChange?.(false);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border bg-admin-surface text-admin-fg-primary shadow-lg transition duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-opacity",
        entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0",
        variant === "success" && "border-admin-success",
        variant === "error" && "border-admin-danger",
        variant === "warning" && "border-admin-warning",
        variant === "info" && "border-admin-border-subtle",
      )}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume();
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3 pr-10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            variant === "success" && "text-admin-success",
            variant === "error" && "text-admin-danger",
            variant === "warning" && "text-admin-warning",
            variant === "info" && "text-admin-fg-primary",
          )}
        >
          {variant !== "warning" && <circle cx="12" cy="12" r="9" />}
          {iconPaths[variant]}
        </svg>
        <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
        {action && (
          <button
            type="button"
            className="shrink-0 text-sm font-semibold underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-admin-fg-primary"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-admin-fg-primary"
        aria-label="Dismiss notification"
      >
        ×
      </button>
      <div className="h-1 bg-admin-border-subtle" aria-hidden="true">
        <div
          className={cn(
            "h-full origin-left",
            !paused && "transition-[width] duration-100 ease-linear",
            variant === "success" && "bg-admin-success",
            variant === "error" && "bg-admin-danger",
            variant === "warning" && "bg-admin-warning",
            variant === "info" && "bg-admin-fg-primary",
          )}
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        />
      </div>
    </div>
  );
}
