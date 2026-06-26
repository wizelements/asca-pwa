import AdminHeader from "./AdminHeader";
import AdminSidebar, { NAV_GROUPS } from "./AdminSidebar";
import MobileAdminNav from "./MobileAdminNav";

export interface AdminShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  primaryAction?: React.ReactNode;
  activeHref?: string;
}

export default function AdminShell({
  children,
  pageTitle,
  primaryAction,
  activeHref,
}: AdminShellProps) {
  const homeItem = NAV_GROUPS[0].items[0];
  const active = activeHref || homeItem.href;

  return (
    <div className="flex min-h-screen bg-admin-bg-body">
      <AdminSidebar activeHref={active} />
      <MobileAdminNav activeHref={active} />
      <div className="flex flex-1 flex-col">
        <AdminHeader pageTitle={pageTitle} primaryAction={primaryAction} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
