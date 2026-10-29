'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const TASKS = [
  { title: 'Change the monthly meeting', href: '/admin/meeting', instructions: 'Update the place, address, day or time. Save, then check the public meeting information.' },
  { title: 'Add or change an event', href: '/admin/events', instructions: 'Enter the date, location and details. Publish only when ready, then open the public calendar.' },
  { title: 'Upload and publish photos', href: '/admin/albums', instructions: 'Create an album, add images and descriptive text, choose a cover, complete privacy review and verify the public gallery.' },
  { title: 'Change website wording', href: '/admin/content', instructions: 'Choose the specific page, edit its wording, save that page and inspect the matching public page.' },
  { title: 'Replace a website image', href: '/admin/media', instructions: 'Find the named image location, upload its replacement, save and inspect the destination page. Some slots are fallbacks.' },
  { title: 'Manage horse profiles', href: '/admin/horses', instructions: 'Add a horse and its approved photographs. Publish, then confirm public horse profiles are enabled and visible.' },
  { title: 'Respond to inquiries', href: '/admin/forms', instructions: 'Open new messages, respond through the appropriate channel, and mark handled requests resolved.' },
  { title: 'Manage members', href: '/admin/members', instructions: 'Update official member records carefully. Private roster details must not appear on public pages.' },
  { title: 'Change contact and social details', href: '/admin/settings', instructions: 'Update approved public information, save, then check the homepage, footer and support page.' },
  { title: 'Protect my account', href: '/admin/account', instructions: 'Update your own sign-in security. Never share a personal admin password.' },
];
export default function AdminWalkthrough({ restartNonce = 0 }: { restartNonce?: number }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') setOpen(true);
  }, []);
  useEffect(() => { if (restartNonce > 0) setOpen(true); }, [restartNonce]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])') ?? []);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open]);
  if (!open) return null;
  const filtered = TASKS.map((task, index) => ({ ...task, index })).filter(task => (task.title + ' ' + task.instructions).toLowerCase().includes(query.toLowerCase()));
  const current = TASKS[selected];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="asca-help-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-admin-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-admin-border-subtle p-5">
          <div><h2 id="asca-help-title" className="text-2xl font-bold text-admin-fg-primary">What do you need to do?</h2><p className="mt-1 text-sm text-admin-fg-secondary">Choose a task to see where to go. No tour required.</p></div>
          <button ref={closeRef} type="button" aria-label="Close help" onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-admin-border-subtle px-4 font-semibold text-admin-fg-primary">Close</button>
        </header>
        <div className="overflow-y-auto p-5">
          <label htmlFor="admin-task-search" className="block text-sm font-semibold text-admin-fg-primary">Find a task</label>
          <input id="admin-task-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="For example: meeting, photos, events" className="mt-2 min-h-11 w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-3 text-admin-fg-primary" />
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <nav aria-label="Admin tasks" className="flex flex-col gap-2">
              {filtered.map(task => <button type="button" key={task.href} onClick={() => setSelected(task.index)} aria-pressed={selected === task.index} className={'min-h-11 rounded-lg border p-3 text-left text-sm font-semibold ' + (selected === task.index ? 'border-admin-primary bg-admin-bg-subtle text-admin-fg-primary' : 'border-admin-border-subtle text-admin-fg-secondary')}>{task.title}</button>)}
              {!filtered.length && <p role="status" className="text-sm text-admin-fg-secondary">No matching task. Try another word or open Help.</p>}
            </nav>
            <div className="self-start rounded-xl border border-admin-border-subtle bg-admin-bg-body p-5">
              <h3 className="text-lg font-bold text-admin-fg-primary">{current.title}</h3>
              <p className="mt-3 text-sm leading-6 text-admin-fg-secondary">{current.instructions}</p>
              <p className="mt-4 text-sm font-semibold text-admin-fg-primary">How to confirm it worked</p>
              <p className="mt-1 text-sm leading-6 text-admin-fg-secondary">Save the change, open the affected public page, and confirm visitors see the intended result. A save confirmation alone does not mean it is published.</p>
              <Link href={current.href} onClick={() => setOpen(false)} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-admin-primary px-5 font-semibold text-white">Go to this task</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
