"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AdminToast, { ToastAction, ToastVariant } from "./AdminToast";

export interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

export interface ShowToastOptions extends ToastOptions {
  message: string;
  variant: ToastVariant;
}

export interface ToastApi {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  show: (options: ShowToastOptions) => void;
}

interface ToastRecord extends ShowToastOptions {
  id: number;
}

const ToastContext = createContext<{ toast: ToastApi } | null>(null);
const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 4;

function ToastTimer({ item, dismiss }: { item: ToastRecord; dismiss: (id: number) => void }) {
  const duration = Math.max(0, item.duration ?? DEFAULT_DURATION);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(1);
  const remaining = useRef(duration);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    lastTick.current = Date.now();
    if (paused) return;
    if (duration === 0) {
      dismiss(item.id);
      return;
    }

    const tick = () => {
      const now = Date.now();
      remaining.current -= now - lastTick.current;
      lastTick.current = now;
      setProgress(remaining.current / duration);
      if (remaining.current <= 0) dismiss(item.id);
    };
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [paused, duration, dismiss, item.id]);

  return (
    <AdminToast
      message={item.message}
      variant={item.variant}
      action={item.action}
      progress={progress}
      paused={paused}
      entered={entered}
      onPauseChange={setPaused}
      onDismiss={() => dismiss(item.id)}
    />
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);
  const show = useCallback((options: ShowToastOptions) => {
    const item = { ...options, id: ++nextId.current };
    setToasts((current) => [item, ...current].slice(0, MAX_VISIBLE));
  }, []);
  const toast = useMemo<ToastApi>(() => ({
    show,
    success: (message, options) => show({ message, variant: "success", ...options }),
    error: (message, options) => show({ message, variant: "error", ...options }),
    info: (message, options) => show({ message, variant: "info", ...options }),
    warning: (message, options) => show({ message, variant: "warning", ...options }),
  }), [show]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 md:inset-x-auto md:bottom-6 md:right-6 md:w-full md:max-w-sm"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <div className="pointer-events-auto" key={item.id}>
            <ToastTimer item={item} dismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
