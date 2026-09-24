import Link from 'next/link';

import AdminCard from '@/components/admin/AdminCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const dailyWorkflow = [
  {
    title: '1. Review what needs attention',
    body: 'Open Dashboard first. New messages and open tasks are the priority items for the day.',
  },
  {
    title: '2. Keep the calendar current',
    body: 'Use Events to add or update meetings, rides, and community activities. Preview the public site after publishing.',
  },
  {
    title: '3. Follow up with people',
    body: 'Use Contacts, Members, Messages, and Tasks together so conversations have a clear owner and next step.',
  },
  {
    title: '4. Keep the website fresh',
    body: 'Use Gallery albums, Horses, Page images, Appearance, and Social & donations for routine content changes.',
  },
  {
    title: '5. Verify and back up',
    body: 'Use View site after important edits. Download a backup from Dashboard after major content updates.',
  },
];

const advancedTools = [
  { label: 'Categories', href: '/admin/categories', body: 'Manage gallery classification.' },
  { label: 'Media integrity', href: '/admin/media-integrity', body: 'Diagnose missing or inconsistent media references.' },
  { label: 'Legacy review', href: '/admin/legacy-review', body: 'Review older gallery migration records.' },
  { label: 'Legacy gallery', href: '/admin/gallery', body: 'Access the previous gallery manager when maintenance requires it.' },
];

export default function AdminHelp() {
  return (
    <>
      <AdminPageHeader
        title="Help & walkthrough"
        subtitle="Simple guidance for the everyday ASCA workflow, plus advanced maintenance tools when they are actually needed."
        primaryAction={
          <Link
            href="/admin?tour=1"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-admin-primary px-5 text-sm font-semibold text-white transition hover:bg-admin-primary-dark"
          >
            Start walkthrough
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard>
          <h2 className="text-lg font-bold text-admin-fg-primary">Recommended workflow</h2>
          <div className="mt-5 space-y-5">
            {dailyWorkflow.map((item) => (
              <section key={item.title}>
                <h3 className="text-sm font-bold text-admin-fg-primary">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-admin-fg-secondary">{item.body}</p>
              </section>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-bold text-admin-fg-primary">Fast answers</h2>
          <dl className="mt-5 space-y-5">
            <div>
              <dt className="text-sm font-bold text-admin-fg-primary">Where do I update events?</dt>
              <dd className="mt-1 text-sm leading-6 text-admin-fg-secondary">
                Go to <Link href="/admin/events" className="font-semibold text-admin-primary hover:underline">Events</Link>.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-admin-fg-primary">Where do website inquiries go?</dt>
              <dd className="mt-1 text-sm leading-6 text-admin-fg-secondary">
                Go to <Link href="/admin/forms" className="font-semibold text-admin-primary hover:underline">Messages</Link>.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-admin-fg-primary">How do I change photos?</dt>
              <dd className="mt-1 text-sm leading-6 text-admin-fg-secondary">
                Use <Link href="/admin/albums" className="font-semibold text-admin-primary hover:underline">Gallery albums</Link> for activity photos and <Link href="/admin/media" className="font-semibold text-admin-primary hover:underline">Page images</Link> for website photography.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-admin-fg-primary">How do I preview my changes?</dt>
              <dd className="mt-1 text-sm leading-6 text-admin-fg-secondary">
                Select <strong>View site</strong> in the top-right corner of the admin workspace.
              </dd>
            </div>
          </dl>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-fg-muted">Advanced maintenance</p>
          <h2 className="mt-2 text-lg font-bold text-admin-fg-primary">Tools you usually do not need</h2>
          <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">
            These are intentionally removed from the main navigation so the everyday client workflow stays clean. Use them only for maintenance, migration, or troubleshooting.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {advancedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-admin-border-subtle bg-admin-bg-body p-4 transition hover:border-admin-primary/30 hover:bg-admin-bg-subtle"
            >
              <p className="text-sm font-bold text-admin-fg-primary">{tool.label}</p>
              <p className="mt-1 text-sm leading-5 text-admin-fg-secondary">{tool.body}</p>
            </Link>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
