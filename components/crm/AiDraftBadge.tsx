import { cn } from "@/lib/utils";

export interface AiDraftBadgeProps {
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export default function AiDraftBadge({
  children,
  className,
  compact = false,
}: AiDraftBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-purple-300 bg-purple-50 p-3 text-sm text-purple-900",
        compact && "inline-flex items-center gap-2 px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className="font-semibold">🤖 AI suggestion</span>
      {!compact && (
        <span className="ml-2 text-purple-700">
          Review before using. AI will not act on your behalf.
        </span>
      )}
      {children}
    </div>
  );
}
