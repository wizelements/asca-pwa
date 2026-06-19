'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getAdminToken } from '@/components/AdminGuard';

interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  totalMembers: number;
  activeMembers: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
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
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    totalFormSubmissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setRecentActivity(data.recentActivity?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon, color }: any) => (
    <div className={`rounded-xl p-6 shadow-sm border border-brand-border-subtle transition-all hover:shadow-md ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-brand-fg-muted uppercase tracking-wider">{label}</p>
          <p className="mt-3 text-3xl font-bold text-brand-fg-primary">{loading ? '—' : value}</p>
        </div>
        <div className="text-3xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Dashboard</h1>
          <p className="mt-1 text-brand-fg-secondary">Welcome back. Here&apos;s what&apos;s happening with your site.</p>
        </div>
        <button className="px-6 py-3 rounded-full bg-brand-forest text-white font-semibold hover:bg-brand-forest/90 transition-colors">
          Last 30 Days
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Published Events"
          value={stats.publishedEvents}
          icon="📅"
          color="bg-gradient-to-br from-blue-50 to-blue-100/50"
        />
        <StatCard
          label="Active Members"
          value={stats.activeMembers}
          icon="👥"
          color="bg-gradient-to-br from-green-50 to-green-100/50"
        />
        <StatCard
          label="Published Blog Posts"
          value={stats.publishedBlogPosts}
          icon="📝"
          color="bg-gradient-to-br from-purple-50 to-purple-100/50"
        />
        <StatCard
          label="Form Submissions"
          value={stats.totalFormSubmissions}
          icon="📬"
          color="bg-gradient-to-br from-orange-50 to-orange-100/50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-brand-bg-elevated rounded-xl shadow-sm border border-brand-border-subtle p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-fg-primary">Quick Actions</h2>
            <span className="text-xs uppercase tracking-wider text-brand-forest font-semibold">Create or Edit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/events"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 transition-all hover:shadow-md border border-blue-200/50 hover:border-blue-300"
            >
              <div className="relative z-10">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-sm font-medium text-brand-fg-muted">Create New Event</p>
                <p className="text-xs text-brand-fg-muted/60 mt-1">Add events to your calendar</p>
              </div>
            </Link>

            <Link
              href="/admin/blog"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 transition-all hover:shadow-md border border-purple-200/50 hover:border-purple-300"
            >
              <div className="relative z-10">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm font-medium text-brand-fg-muted">Write Blog Post</p>
                <p className="text-xs text-brand-fg-muted/60 mt-1">Share updates with members</p>
              </div>
            </Link>

            <Link
              href="/admin/members"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 p-6 transition-all hover:shadow-md border border-green-200/50 hover:border-green-300"
            >
              <div className="relative z-10">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-sm font-medium text-brand-fg-muted">Manage Members</p>
                <p className="text-xs text-brand-fg-muted/60 mt-1">View and edit member info</p>
              </div>
            </Link>

            <Link
              href="/admin/theme"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 transition-all hover:shadow-md border border-orange-200/50 hover:border-orange-300"
            >
              <div className="relative z-10">
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm font-medium text-brand-fg-muted">Edit Theme</p>
                <p className="text-xs text-brand-fg-muted/60 mt-1">Customize colors & branding</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Site Status */}
        <div className="bg-brand-bg-elevated rounded-xl shadow-sm border border-brand-border-subtle p-8">
          <h3 className="text-lg font-bold text-brand-fg-primary mb-4">Site Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-brand-bg-subtle rounded-lg">
              <span className="text-sm font-medium text-brand-fg-primary">Service Worker</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-bg-subtle rounded-lg">
              <span className="text-sm font-medium text-brand-fg-primary">Database</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-bg-subtle rounded-lg">
              <span className="text-sm font-medium text-brand-fg-primary">Cache</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-bg-subtle rounded-lg">
              <span className="text-sm font-medium text-brand-fg-primary">Last Updated</span>
              <span className="text-xs text-brand-fg-muted">Just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-brand-bg-elevated rounded-xl shadow-sm border border-brand-border-subtle p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-fg-primary">Recent Activity</h2>
          <Link href="/admin/activity" className="text-sm font-medium text-brand-forest hover:underline">
            View All →
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-brand-bg-subtle rounded-lg hover:bg-brand-bg-soft transition-colors">
                <div className="mt-1">
                  <div className="w-2 h-2 bg-brand-forest rounded-full" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-fg-primary">{activity.title}</p>
                  <p className="text-xs text-brand-fg-muted">{activity.type} • by {activity.user}</p>
                </div>
                <time className="text-xs text-brand-fg-muted whitespace-nowrap">{activity.timestamp}</time>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-brand-fg-secondary">No recent activity yet.</p>
            <p className="text-xs text-brand-fg-muted mt-1">Changes will appear here as you manage your site.</p>
          </div>
        )}
      </div>

      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-brand-forest to-brand-forest-muted p-8 text-white border border-brand-forest/30">
        <h3 className="text-lg font-bold mb-2">Welcome to ASCA Admin</h3>
        <p className="text-sm opacity-90">
          All changes are saved to MongoDB and reflected on the public site instantly. Your service worker ensures the app works offline too.
        </p>
      </div>
    </div>
  );
}
