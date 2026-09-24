'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminCard from '@/components/admin/AdminCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSection from '@/components/admin/AdminSection';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { logout } from '@/components/AdminGuard';

interface DashboardStats {
  publishedEvents: number;
  activeMembers: number;
  totalGalleryImages: number;
  totalFormSubmissions: number;
  recentActivity?: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user: string;
}

interface CrmStats {
  totalContacts: number;
  activeMembers: number;
  newMessages: number;
  openTasks: number;
}

const EMPTY_CRM: CrmStats = {
  totalContacts: 0,
  activeMembers: 0,
  newMessages: 0,
  openTasks: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    publishedEvents: 0,
    activeMembers: 0,
    totalGalleryImages: 0,
    totalFormSubmissions: 0,
    recentActivity: [],
  });
  const [crmStats, setCrmStats] = useState<CrmStats>(EMPTY_CRM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [statsResponse, crmResponse] = await Promise.all([
          fetch('/api/admin/stats', { credentials: 'same-origin', cache: 'no-store' }),
          fetch('/api/admin/crm-stats', { credentials: 'same-origin', cache: 'no-store' }),
        ]);

        if (statsResponse.status === 401 || crmResponse.status === 401) {
          await logout();
          return;
        }

        if (!statsResponse.ok || !crmResponse.ok) {
          throw new Error('Dashboard data unavailable');
        }

        const [statsData, crmData] = await Promise.all([
          statsResponse.json(),
          crmResponse.json(),
        ]);

        if (!active) return;
        setStats(statsData);
        setCrmStats(crmData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        if (active) setLoadError('Some dashboard data could not be loaded. Your content is still safe.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const downloadBackup = async () => {
    setExporting(true);
    setExportError('');

    try {
      const response = await fetch('/api/admin/export', {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (response.status === 401) {
        await logout();
        return;
      }
      if (!response.ok) throw new Error('Backup failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asca-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Backup could not be prepared. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const recentActivity = stats.recentActivity?.slice(0, 5) ?? [];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Your daily workspace for what needs attention, recent activity, and common site updates."
        primaryAction={
          <button
            type="button"
            onClick={downloadBackup}
            disabled={exporting}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-admin-border-subtle bg-admin-surface px-4 text-sm font-semibold text-admin-fg-primary transition hover:bg-admin-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? 'Preparing backup…' : 'Download backup'}
          </button>
        }
      />

      {(loadError || exportError) && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          {exportError || loadError}
        </div>
      )}

      <AdminSection title="Needs attention">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="New messages"
            value={loading ? '—' : crmStats.newMessages}
            href="/admin/forms?status=new"
          />
          <AdminStatCard
            label="Open tasks"
            value={loading ? '—' : crmStats.openTasks}
            href="/admin/tasks"
          />
          <AdminStatCard
            label="Published events"
            value={loading ? '—' : stats.publishedEvents}
            href="/admin/events"
          />
          <AdminStatCard
            label="Active members"
            value={loading ? '—' : stats.activeMembers}
            href="/admin/members"
          />
        </div>
      </AdminSection>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <AdminCard>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-admin-fg-primary">Common updates</h2>
            <p className="mt-1 text-sm text-admin-fg-secondary">Go directly to the work you do most often.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction
              href="/admin/events"
              label="Update events"
              description="Publish meetings, rides, and community events."
            />
            <QuickAction
              href="/admin/forms"
              label="Review messages"
              description="Reply to inquiries and close resolved conversations."
            />
            <QuickAction
              href="/admin/albums"
              label="Update gallery"
              description="Create albums and manage recent activity photos."
            />
            <QuickAction
              href="/admin/media"
              label="Update page images"
              description="Change key website photography without touching code."
            />
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-bold text-admin-fg-primary">At a glance</h2>
          <dl className="mt-5 divide-y divide-admin-border-subtle">
            <SummaryRow label="Contacts" value={loading ? '—' : crmStats.totalContacts} />
            <SummaryRow label="Gallery images" value={loading ? '—' : stats.totalGalleryImages} />
            <SummaryRow label="All form submissions" value={loading ? '—' : stats.totalFormSubmissions} />
          </dl>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-admin-fg-primary">Recent activity</h2>
            <p className="mt-1 text-sm text-admin-fg-secondary">A quick record of recent changes in the workspace.</p>
          </div>
          <Link href="/admin/help" className="text-sm font-semibold text-admin-primary hover:underline">
            Need help?
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-admin-border-subtle">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-admin-fg-primary">{activity.title}</p>
                  <p className="text-xs text-admin-fg-muted">
                    {activity.type} · {activity.user}
                  </p>
                </div>
                <time className="text-xs text-admin-fg-muted">{activity.timestamp}</time>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-admin-bg-body p-4 text-sm text-admin-fg-muted">
            No recent activity yet. New edits will appear here.
          </p>
        )}
      </AdminCard>
    </>
  );
}

function QuickAction({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-admin-border-subtle bg-admin-bg-body p-4 transition hover:border-admin-primary/30 hover:bg-admin-bg-subtle"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-admin-fg-primary">{label}</span>
        <span className="text-admin-fg-muted transition group-hover:translate-x-0.5 group-hover:text-admin-primary" aria-hidden="true">→</span>
      </div>
      <p className="mt-2 text-sm leading-5 text-admin-fg-secondary">{description}</p>
    </Link>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-admin-fg-secondary">{label}</dt>
      <dd className="text-sm font-bold text-admin-fg-primary">{value}</dd>
    </div>
  );
}
