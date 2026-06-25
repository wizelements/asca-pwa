import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AdminToastProps {
  message: string;
  variant?: 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
}

export default function AdminToast({ message, variant = 'success', duration = 4000, onDismiss }: AdminToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-4 py-3 text-sm font-medium shadow-lg md:bottom-6 md:left-auto md:right-6 md:translate-x-0',
        variant === 'success' && 'bg-admin-success text-white',
        variant === 'warning' && 'bg-admin-warning text-admin-fg-primary',
        variant === 'error' && 'bg-admin-danger text-white',
      )}
      role="status"
      aria-live="polite"
    >
      {message}
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full text-current opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
