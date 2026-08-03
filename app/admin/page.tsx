"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminCard from "@/components/admin/AdminCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { getAdminToken, logout } from "@/components/AdminGuard";

interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  totalMembers: number;
  activeMembers: number;
  totalGalleryImages: number;
  totalFormSubmissions: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    publishedEvents: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalGalleryImages: 0,
    totalFormSubmissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [crmStats, setCrmStats] = useState({
    totalContacts: 0,
    activeMembers: 0,
    newMessages: 0,
    openTasks: 0,
  });
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch("/api/admin/stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setRecentActivity(data.recentActivity?.slice(0, 5) || []);
        const crmRes = await fetch('/api/admin/crm-stats', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (crmRes.ok) {
          const crmData = await crmRes.json();
          setCrmStats(crmData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async () => {
    setExporting(true);
    setExportError("");
    const token = getAdminToken();
    try {
      const res = await fetch("/api/admin/export", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setExportError("Unable to download backup.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `asca-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Unable to download backup.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back. Here’s what’s happening with ASCA."
        primaryAction={
          <button
            onClick={downloadBackup}
            disabled={exporting}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-admin-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-admin-primary-dark disabled:bg-admin-primary/50"
          >
            {exporting ? "Preparing Backup..." : "Download Backup"}
          </button>
        }
      />

      {exportError && (
        <div className="mb-6 rounded-lg border border-admin-danger/30 bg-red-50 p-3 text-sm text-admin-danger">
          {exportError}
        </div>
      )}

      <AdminSection title="Site overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Published Events"
            value={loading ? "—" : stats.publishedEvents}
            icon="📅"
            href="/admin/events"
          />
          <AdminStatCard
            label="Member Records"
            value={loading ? "—" : stats.activeMembers}
            icon="👥"
            href="/admin/members"
          />
          <AdminStatCard
            label="Gallery Images"
            value={loading ? "—" : stats.totalGalleryImages}
            icon="🖼️"
            href="/admin/gallery"
          />
          <AdminStatCard
            label="Messages"
            value={loading ? "—" : stats.totalFormSubmissions}
            icon="📬"
            href="/admin/forms"
          />
        </div>
      </AdminSection>

      <AdminSection title="CRM preview" className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Total Contacts"
            value={loading ? "—" : crmStats.totalContacts}
            icon="🤝"
            href="/admin/contacts"
          />
          <AdminStatCard
            label="CRM Members"
            value={loading ? "—" : crmStats.activeMembers}
            icon="👥"
            href="/admin/contacts?lifecycleStage=member"
          />
          <AdminStatCard
            label="New Messages"
            value={loading ? "—" : crmStats.newMessages}
            icon="📬"
            href="/admin/forms?status=new"
          />
          <AdminStatCard
            label="Open Tasks"
            value={loading ? "—" : crmStats.openTasks}
            icon="☑️"
            href="/admin/tasks"
          />
        </div>
        <p className="mt-4 text-xs text-admin-fg-muted">
          CRM stats update as contacts, messages, and tasks are created.
        </p>
      </AdminSection>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-admin-fg-primary">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAction href="/admin/events" icon="📅" label="Manage Event Calendar" />
            <QuickAction href="/admin/contacts" icon="🤝" label="Manage Contacts" />
            <QuickAction href="/admin/tasks" icon="☑️" label="Manage Tasks" />
            <QuickAction href="/admin/forms" icon="📬" label="Triage Messages" />
            <QuickAction href="/admin/members" icon="👥" label="Manage Member Records" />
            <QuickAction href="/admin/theme" icon="🎨" label="Edit Theme" />
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-lg font-bold text-admin-fg-primary">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-admin-border-subtle bg-admin-bg-body p-3"
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-admin-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-admin-fg-primary">{activity.title}</p>
                    <p className="text-xs text-admin-fg-muted">
                      {activity.type} • {activity.user}
                    </p>
                  </div>
                  <time className="text-xs text-admin-fg-muted">{activity.timestamp}</time>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-admin-fg-muted">No recent activity yet.</p>
          )}
        </AdminCard>
      </div>
    </>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-admin-border-subtle bg-admin-bg-body p-4 transition-colors hover:bg-admin-bg-subtle"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-admin-fg-primary">{label}</span>
    </Link>
  );
}
