"use client";

import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ToastProvider from "@/components/admin/ToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <>{children}</>;
  }

  return (
    <AdminGuard requiredRole="editor">
      <ToastProvider>
        <AdminShell activeHref={pathname}>{children}</AdminShell>
      </ToastProvider>
    </AdminGuard>
  );
}
