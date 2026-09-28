import Link from 'next/link';

import AdminCard from '@/components/admin/AdminCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const sections = [
  {
    label: 'Dashboard',
    href: '/admin',
    purpose: 'Your daily starting point for priorities, recent activity, common updates, and backups.',
    workflow: 'Review New messages and Open tasks first. Use the quick actions for routine updates. Download a backup after major changes.',
    publicEffect: 'None by itself. Dashboard summarizes work and provides navigation.',
  },
  {
    label: 'Messages',
    href: '/admin/forms',
    purpose: 'Website inquiries and form submissions that need review or follow-up.',
    workflow: 'Open the message, respond outside the site as appropriate, then mark Replied. Mark Resolved when no further action is needed.',
    publicEffect: 'Internal only. Status changes do not alter the public website.',
  },
  {
    label: 'Contacts',
    href: '/admin/contacts',
    purpose: 'Relationship records for members, leads, volunteers, sponsors, partners, and organizations.',
    workflow: 'Keep contact details and relationship status current. Add concise notes and create Tasks when a follow-up is required.',
    publicEffect: 'Internal only. Contact records do not publish to the public website.',
  },
  {
    label: 'Members',
    href: '/admin/members',
    purpose: 'Official ASCA member records, including roles, join date, photo, bio, active status, and verification state.',
    workflow: 'Update the member record when membership details change. Prefer inactive status over deleting a historical member when the record should be retained.',
    publicEffect: 'Member data may be used by member-facing parts of the site depending on the record settings.',
  },
  {
    label: 'Tasks',
    href: '/admin/tasks',
    purpose: 'Follow-ups, reminders, and action items with due dates, priority, and optional contact association.',
    workflow: 'Create a task whenever work must happen later. Keep due dates realistic and close the task only when the work is complete.',
    publicEffect: 'Internal only.',
  },
  {
    label: 'Events',
    href: '/admin/events',
    purpose: 'The public event calendar: meetings, rides, community events, locations, images, descriptions, and registration links.',
    workflow: 'Create or edit the event, verify the public date label and sort date, check the image and alt text, then publish and use View site.',
    publicEffect: 'Published event changes can appear on the public website immediately.',
  },
  {
    label: 'Gallery albums',
    href: '/admin/albums',
    purpose: 'The canonical public photo-album system for ASCA activities.',
    workflow: 'Create a draft, upload photos, write alt text/captions, choose a cover, save, complete privacy review, then publish. Archive instead of deleting when you only want to remove an album from public view.',
    publicEffect: 'Published albums and featured albums appear publicly. Drafts, archived albums, and restricted content do not.',
  },
  {
    label: 'Horses',
    href: '/admin/horses',
    purpose: 'Public horse profiles and their primary/supporting photography.',
    workflow: 'Create or edit the profile, add descriptive images, choose the primary photo, save, then publish and verify the public horse page.',
    publicEffect: 'Published horse profiles appear on the public site.',
  },
  {
    label: 'Page images',
    href: '/admin/media',
    purpose: 'Managed photography used in page heroes and website sections rather than Gallery albums.',
    workflow: 'Change only the intended image slot, maintain useful alt text, save, then verify the affected public page.',
    publicEffect: 'Saved page-image changes affect the corresponding public website sections.',
  },
  {
    label: 'Appearance',
    href: '/admin/theme',
    purpose: 'Brand colors, fonts, logo, button colors, and site-wide visual settings.',
    workflow: 'Use only for intentional brand changes. Keep contrast checks passing, save, then review several public pages on desktop and mobile.',
    publicEffect: 'Can affect the appearance of the entire public site.',
  },
  {
    label: 'Social & donations',
    href: '/admin/settings',
    purpose: 'Official social links and donation/payment handles shown to visitors.',
    workflow: 'Double-check every URL, handle, and email before saving. Verify the public Support ASCA experience after any donation change.',
    publicEffect: 'Changes affect visitor links and payment/donation information.',
  },
  {
    label: 'Account',
    href: '/admin/account',
    purpose: 'Your own admin account security and password.',
    workflow: 'Use a unique password. Do not share a personal admin login. Change credentials intentionally and separately from content work.',
    publicEffect: 'None. This controls admin access.',
  },
];

const taskRecipes = [
  {
    title: 'Someone submits a website inquiry',
    steps: 'Messages → open the inquiry → respond → mark Replied → create a Task if follow-up is still needed → mark Resolved when complete.',
  },
  {
    title: 'Add or change an event',
    steps: 'Events → create/edit → verify date, time, location, image, alt text, and link → publish → View site → confirm the public calendar.',
  },
  {
    title: 'Post photos from an ASCA activity',
    steps: 'Gallery albums → Create album → add photos → complete alt text/captions → choose cover → Save draft → privacy review → Publish → View site.',
  },
  {
    title: 'Update a member relationship',
    steps: 'Contacts for relationship history and notes → Members for the official member record → Tasks for any promised follow-up.',
  },
  {
    title: 'Change a website photo',
    steps: 'Page images → locate the exact page/slot → replace image → verify alt text → Save → View site → check the affected page.',
  },
  {
    title: 'Make a major site update',
    steps: 'Make the change → verify the affected public page → return to Dashboard → Download backup.',
  },
];

const advancedTools = [
  { label: 'Gallery categories', href: '/admin/categories', body: 'Advanced control of album classification. Usually leave these alone unless the gallery structure needs to change.' },
  { label: 'Media integrity', href: '/admin/media-integrity', body: 'Diagnostic report for missing, orphaned, or multiply referenced media.' },
  { label: 'Legacy review', href: '/admin/legacy-review', body: 'Migration review for historical gallery records that still need classification/privacy decisions.' },
  { label: 'Legacy gallery archive', href: '/admin/gallery', body: 'Read-only historical flat-gallery records. Current public photo work belongs in Gallery albums.' },
];

export default function AdminHelp() {
  return (
    <>
      <AdminPageHeader
        title="Client guide & walkthrough"
        subtitle="A practical operating guide for the complete ASCA admin workspace — what each section does, when to use it, and what visitors will see."
        primaryAction={
          <Link
            href="/admin?tour=1"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-admin-primary px-5 text-sm font-semibold text-white transition hover:bg-admin-primary-dark"
          >
            Start full walkthrough
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-primary">Recommended daily workflow</p>
          <h2 className="mt-2 text-xl font-bold text-admin-fg-primary">Run the workspace in this order</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-admin-fg-secondary">
            <p><strong className="text-admin-fg-primary">1. Dashboard:</strong> review New messages and Open tasks.</p>
            <p><strong className="text-admin-fg-primary">2. Follow-up:</strong> process Messages, Contacts, Members, and Tasks so every conversation has a clear next step.</p>
            <p><strong className="text-admin-fg-primary">3. Operations:</strong> keep Events accurate before visitors rely on the calendar.</p>
            <p><strong className="text-admin-fg-primary">4. Website:</strong> update Gallery, Horses, Page images, Appearance, or Social & donations only when needed.</p>
            <p><strong className="text-admin-fg-primary">5. Verify:</strong> use View site after any public-facing change.</p>
            <p><strong className="text-admin-fg-primary">6. Protect:</strong> download a backup from Dashboard after major content work.</p>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-primary">Three rules</p>
          <h2 className="mt-2 text-xl font-bold text-admin-fg-primary">How to avoid most mistakes</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-admin-fg-secondary">
            <p><strong className="text-admin-fg-primary">Save is not verification.</strong> If the change affects visitors, use View site and inspect the result.</p>
            <p><strong className="text-admin-fg-primary">Draft before publish.</strong> Prepare gallery and other consequential content before making it public.</p>
            <p><strong className="text-admin-fg-primary">Archive before delete.</strong> Preserve recoverability when content is simply no longer current.</p>
          </div>
        </AdminCard>
      </div>

      <section className="mt-6" aria-labelledby="workspace-guide-heading">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-fg-muted">Section-by-section guide</p>
          <h2 id="workspace-guide-heading" className="mt-2 text-xl font-bold text-admin-fg-primary">What every admin section is for</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <AdminCard key={section.href}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-admin-fg-primary">{section.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">{section.purpose}</p>
                </div>
                <Link href={section.href} className="shrink-0 text-sm font-semibold text-admin-primary hover:underline">
                  Open →
                </Link>
              </div>
              <div className="mt-4 rounded-xl bg-admin-bg-body p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-admin-fg-muted">Recommended workflow</p>
                <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">{section.workflow}</p>
              </div>
              <p className="mt-4 text-xs leading-5 text-admin-fg-muted">
                <strong className="text-admin-fg-secondary">Public effect:</strong> {section.publicEffect}
              </p>
            </AdminCard>
          ))}
        </div>
      </section>

      <AdminCard className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-fg-muted">Common tasks</p>
        <h2 className="mt-2 text-xl font-bold text-admin-fg-primary">Quick recipes</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {taskRecipes.map((recipe) => (
            <section key={recipe.title} className="rounded-xl border border-admin-border-subtle bg-admin-bg-body p-4">
              <h3 className="text-sm font-bold text-admin-fg-primary">{recipe.title}</h3>
              <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">{recipe.steps}</p>
            </section>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="mt-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-fg-muted">Advanced maintenance</p>
          <h2 className="mt-2 text-xl font-bold text-admin-fg-primary">Tools most clients should rarely need</h2>
          <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">
            These tools are intentionally outside the everyday navigation. Use them for troubleshooting, migration, or structural maintenance — not routine content editing.
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
