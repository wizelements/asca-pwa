import Link from 'next/link';

const eventCategories = [
  'Hosted by ASCA',
  'ASCA Will Be There',
  'Sponsored by ASCA',
];

const monthlyChecklist = [
  'Review the public Event Calendar page after editing events.',
  'Mark old or cancelled events as Draft instead of deleting if you may need them later.',
  'Check new messages and mark each one Replied or Resolved.',
  'Add recent photos to Gallery with clear alt text.',
  'Download a content backup after major updates.',
];

export default function AdminHelp() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-fg-primary">Admin Help</h1>
        <p className="mt-2 max-w-3xl text-brand-fg-secondary">
          A quick guide for keeping the ASCA website updated without changing the approved design or site structure.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-brand-fg-primary">Event Calendar</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-fg-secondary">
            Events appear on the public Event Calendar page when Published is checked. Use the public date label for
            display text such as 7/1, 10/9–10/11, or Date TBA. Sort Date and Sort Order control the timeline order.
          </p>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-brand-forest">Approved categories</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-fg-secondary">
            {eventCategories.map((category) => (
              <li key={category} className="flex gap-2">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-forest" aria-hidden="true" />
                {category}
              </li>
            ))}
          </ul>
          <Link href="/admin/events" className="mt-5 inline-flex rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">
            Manage Event Calendar
          </Link>
        </section>

        <section className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-brand-fg-primary">Photos</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-fg-secondary">
            Gallery and member image fields accept an existing image path/URL or an uploaded JPG, PNG, or WebP. Uploaded
            images are optimized in the browser and saved with the record. Always write alt text that describes the photo.
          </p>
          <Link href="/admin/gallery" className="mt-5 inline-flex rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">
            Manage Gallery
          </Link>
        </section>

        <section className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-brand-fg-primary">Messages</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-fg-secondary">
            Messages are a backup inbox for website contacts and event-update requests. Use Email Submitter to
            reply, then mark the submission Replied or Resolved so the team knows it was handled.
          </p>
          <Link href="/admin/forms" className="mt-5 inline-flex rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">
            Review Messages
          </Link>
        </section>

        <section className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-brand-fg-primary">Maintenance Checklist</h2>
          <ul className="mt-3 space-y-2 text-sm text-brand-fg-secondary">
            {monthlyChecklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-brand-forest" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
