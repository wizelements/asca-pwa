'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'asca_admin_walkthrough_v1';

const STEPS = [
  {
    title: 'Your dashboard',
    body: 'Start here to see new messages, open tasks, member activity, and quick links to the work that needs attention.',
    href: '/admin',
    action: 'Open dashboard',
  },
  {
    title: 'Events and messages',
    body: 'Use Events to publish calendar updates. Use Messages to review website inquiries and mark each one replied or resolved.',
    href: '/admin/events',
    action: 'Manage events',
  },
  {
    title: 'People and follow-up',
    body: 'Contacts and Members keep relationship details organized. Tasks give the team a clear next action instead of relying on memory.',
    href: '/admin/contacts',
    action: 'View contacts',
  },
  {
    title: 'Website content',
    body: 'Gallery albums, horses, page images, appearance, and donation settings are grouped under Website so routine edits stay easy to find.',
    href: '/admin/albums',
    action: 'Manage gallery',
  },
  {
    title: 'Preview, verify, and back up',
    body: 'Use View site after important edits, then download a backup from the dashboard after major content changes. Help is always available from the sidebar.',
    href: '/',
    action: 'Preview public site',
    external: true,
  },
] as const;

export default function AdminWalkthrough({ restartNonce = 0 }: { restartNonce?: number }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'complete') {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (restartNonce > 0) {
      setStep(0);
      setOpen(true);
    }
  }, [restartNonce]);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, step]);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'complete');
    } catch {
      // Walkthrough remains optional even when storage is unavailable.
    }
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <section
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-admin-border-subtle bg-admin-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-walkthrough-title"
      >
        <div className="border-b border-admin-border-subtle px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-primary">
                Admin walkthrough
              </p>
              <h2 id="admin-walkthrough-title" className="mt-2 text-2xl font-bold text-admin-fg-primary">
                {current.title}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-admin-fg-muted transition hover:bg-admin-bg-subtle hover:text-admin-fg-primary"
              aria-label="Close walkthrough"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-6 md:px-8">
          <div className="mb-6 flex gap-2" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((item, index) => (
              <span
                key={item.title}
                className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-admin-primary' : 'bg-admin-border-subtle'}`}
              />
            ))}
          </div>

          <p className="text-base leading-7 text-admin-fg-secondary">{current.body}</p>

          <Link
            href={current.href}
            target={current.external ? '_blank' : undefined}
            rel={current.external ? 'noopener noreferrer' : undefined}
            onClick={() => {
              if (!current.external) setOpen(false);
            }}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-xl border border-admin-border-subtle px-4 text-sm font-semibold text-admin-fg-primary transition hover:bg-admin-bg-subtle"
          >
            {current.action}
            {current.external && <span className="ml-1.5" aria-hidden="true">↗</span>}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-admin-border-subtle bg-admin-bg-body px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="min-h-[44px] rounded-xl px-4 text-sm font-semibold text-admin-fg-secondary transition hover:bg-admin-bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <p className="text-xs font-medium text-admin-fg-muted">
            {step + 1} of {STEPS.length}
          </p>

          <button
            type="button"
            onClick={() => {
              if (isLast) finish();
              else setStep((value) => Math.min(STEPS.length - 1, value + 1));
            }}
            className="min-h-[44px] rounded-xl bg-admin-primary px-5 text-sm font-semibold text-white transition hover:bg-admin-primary-dark"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </section>
    </div>
  );
}
