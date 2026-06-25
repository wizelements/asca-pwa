import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import MobileAdminNav from './MobileAdminNav';

export interface AdminShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  primaryAction?: React.ReactNode;
}

export default function AdminShell({ children, pageTitle, primaryAction }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-admin-bg-body">
      <AdminSidebar />
      <MobileAdminNav />
      <div className="flex flex-1 flex-col">
        <AdminHeader pageTitle={pageTitle} primaryAction={primaryAction} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
