"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./AdminSidebar";

export interface MobileAdminNavProps {
  activeHref?: string;
}

export default function MobileAdminNav({ activeHref }: MobileAdminNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((prev) => !prev);
    const button = document.querySelector("[data-mobile-menu-toggle]");
    button?.addEventListener("click", toggle);
    return () => button?.removeEventListener("click", toggle);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-admin-surface shadow-xl transition-transform duration-200 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-admin-border-subtle px-4">
          <span className="text-lg font-bold text-admin-fg-primary">ASCA Admin</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-admin-fg-primary hover:bg-admin-bg-subtle"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="h-[calc(100%-4rem)] overflow-y-auto p-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-admin-fg-muted">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-admin-bg-subtle text-admin-fg-primary"
                            : "text-admin-fg-secondary hover:bg-admin-bg-subtle hover:text-admin-fg-primary"
                        )}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
