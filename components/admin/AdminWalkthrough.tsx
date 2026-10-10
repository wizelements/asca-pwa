'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'asca_admin_walkthrough_v2';

interface WalkthroughStep {
  group: string;
  title: string;
  body: string;
  useFor: string;
  bestPractice: string;
  href: string;
  action: string;
  external?: boolean;
}

const STEPS: WalkthroughStep[] = [
  {
    group: 'Start here',
    title: 'Welcome to the ASCA Client Workspace',
    body: 'The admin panel is designed for routine site and relationship management without touching code. The navigation is grouped by the kind of work you are doing: People, Operations, Website, and Support.',
    useFor: 'Running the ASCA website, responding to people, keeping records current, and publishing approved public content.',
    bestPractice: 'Start from Dashboard each time you sign in. It tells you what needs attention before you begin making changes.',
    href: '/admin',
    action: 'Open Dashboard',
  },
  {
    group: 'Workspace',
    title: 'Dashboard — your daily starting point',
    body: 'Dashboard summarizes new messages, open tasks, published events, active members, recent activity, and shortcuts to common updates. It is also where you download a content backup.',
    useFor: 'Seeing priorities at a glance and creating a safety copy after important content changes.',
    bestPractice: 'Review New messages and Open tasks first. Download a backup after a major member, event, gallery, or website update.',
    href: '/admin',
    action: 'Open Dashboard',
  },
  {
    group: 'Operations',
    title: 'Messages — website inquiries',
    body: 'Messages is ASCA’s website-response inbox. The current Contact form and Event Updates form save here first and are linked to Contacts. Historical membership/volunteer submissions remain identifiable as legacy sources.',
    useFor: 'Contact requests and event-update interest submitted from the current public website, plus clearly labeled historical form records.',
    bestPractice: 'Do not leave handled messages marked New. Mark Replied after responding and Resolved when no further action is needed.',
    href: '/admin/forms',
    action: 'Open Messages',
  },
  {
    group: 'People',
    title: 'Contacts — relationship records',
    body: 'Contacts is the broad relationship database for members, leads, volunteers, sponsors, partners, and organizations. Search and filter by status, source, or lifecycle to find the right people quickly.',
    useFor: 'Keeping contact details, relationship type, source, status, and notes organized in one place.',
    bestPractice: 'Use Contacts for the relationship history. Create a Task when someone needs a concrete follow-up instead of relying on notes alone.',
    href: '/admin/contacts',
    action: 'Open Contacts',
  },
  {
    group: 'People',
    title: 'Members — official member records',
    body: 'Members stores ASCA’s private roster: name, email, join date, roles, internal photo/bio, active status, and verification state. Individual roster records are not published as a directory.',
    useFor: 'Maintaining the private ASCA member roster. The number of records marked Active supplies the public member count on Meet ASCA.',
    bestPractice: 'Use Contacts for broader relationship history and Members for the official roster. Keep Active status accurate because that count is public; do not delete historical members just to remove them from the count.',
    href: '/admin/members',
    action: 'Open Members',
  },
  {
    group: 'Operations',
    title: 'Tasks — follow-up that cannot be forgotten',
    body: 'Tasks turns conversations and responsibilities into visible action items. Tasks can carry a due date, priority, description, and related contact.',
    useFor: 'Member follow-up, sponsor outreach, event preparation, promised callbacks, and other work that needs a clear next action.',
    bestPractice: 'If a message or contact needs action later, create a task. Close the task when the work is actually complete.',
    href: '/admin/tasks',
    action: 'Open Tasks',
  },
  {
    group: 'Operations',
    title: 'Events — the public calendar',
    body: 'Events controls ASCA meetings, rides, community activities, dates, locations, descriptions, images, registration links, and published state.',
    useFor: 'Adding a new public event, changing event details, marking a date TBA, or removing an event from public view.',
    bestPractice: 'Check the public date label, sort date, location, image alt text, and registration link before publishing. Use View site after any important calendar change.',
    href: '/admin/events',
    action: 'Open Events',
  },
  {
    group: 'Website',
    title: 'Gallery albums — activity photos',
    body: 'Gallery albums is the canonical place for public activity photography. Create a draft, add multiple photos, write descriptive alt text and captions, choose a cover, then complete privacy review before publishing.',
    useFor: 'Trail rides, outreach events, fellowship activities, and other ASCA photo collections.',
    bestPractice: 'Prepare the album as a draft first. Administrators handle privacy approval, publishing, homepage featuring, archive, Trash, and recovery.',
    href: '/admin/albums',
    action: 'Open Gallery albums',
  },
  {
    group: 'Website',
    title: 'Horses — public horse profiles',
    body: 'Horses controls the profiles displayed on the public horse section. Each profile can include a name, description, primary image, supporting images, alt text, captions, and publication state.',
    useFor: 'Adding a horse, updating its profile or photography, publishing a completed profile, or archiving an older profile.',
    bestPractice: 'Use a clear primary image and descriptive alt text. Preview the public horse page after publishing or changing photography.',
    href: '/admin/horses',
    action: 'Open Horses',
  },
  {
    group: 'Website',
    title: 'Page images — photography used around the site',
    body: 'Page Images controls fixed website photography such as hero and supporting images. Every card names its exact public destination and tells you whether the image is always visible or only a fallback behind Gallery content.',
    useFor: 'Replacing a hero/section image, updating alt text, restoring a default, and immediately opening the affected public page to verify the result.',
    bestPractice: 'Do not judge a fallback slot by whether it appears while featured Gallery content is active. Follow the destination/status explanation on the card, then verify the linked public page.',
    href: '/admin/media',
    action: 'Open Page images',
  },
  {
    group: 'Website',
    title: 'Appearance — brand settings',
    body: 'Appearance controls brand colors, fonts, logo, button colors, and other theme settings. The page includes contrast checks so unreadable color combinations cannot be published accidentally.',
    useFor: 'Approved brand refreshes and visual changes that should apply consistently across the public site.',
    bestPractice: 'Treat Appearance as occasional configuration, not daily content. Keep WCAG contrast checks passing and preview the site before considering a brand change complete.',
    href: '/admin/theme',
    action: 'Open Appearance',
  },
  {
    group: 'Website',
    title: 'Contact, social & giving — public operational settings',
    body: 'This section controls the official public contact email, Facebook/Instagram/TikTok links, and donation handles used on the live site.',
    useFor: 'Changing the email visitors see, official social profiles, or approved Cash App/Zelle information.',
    bestPractice: 'Double-check every email, handle, and external URL before saving. Verify the footer and Support ASCA after consequential changes.',
    href: '/admin/settings',
    action: 'Open public settings',
  },
  {
    group: 'Support',
    title: 'Account — protect admin access',
    body: 'Account Security is where you change your admin password and manage your own sign-in security.',
    useFor: 'Changing a password or responding to an account-security concern.',
    bestPractice: 'Use a unique password and do not share a personal admin login. Account changes should be intentional and separate from normal content work.',
    href: '/admin/account',
    action: 'Open Account',
  },
  {
    group: 'Quality control',
    title: 'Preview — verify what visitors actually see',
    body: 'The View site button opens the public ASCA site in a separate tab. This is the final visual check after editing events, gallery content, horse profiles, page images, appearance, or donation settings.',
    useFor: 'Confirming that a saved admin change produced the intended customer-facing result.',
    bestPractice: 'A successful Save message is not the same as a verified public outcome. Check the affected public page after consequential changes.',
    href: '/',
    action: 'View public site',
    external: true,
  },
  {
    group: 'Quality control',
    title: 'Backups and Help — finish safely',
    body: 'Dashboard can download a content backup, including the canonical gallery data. Help & walkthrough remains available from the sidebar whenever you need task-specific instructions or want to restart this tour.',
    useFor: 'Creating a recovery point and looking up the correct workflow before an unfamiliar change.',
    bestPractice: 'Download a backup after major updates. For advanced maintenance tools, use the Help page instead of experimenting with migration or integrity screens.',
    href: '/admin/help',
    action: 'Open Help & walkthrough',
  },
];

export default function AdminWalkthrough({ restartNonce = 0 }: { restartNonce?: number }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const forced = search.get('tour') === '1';
    const requestedStep = Number(search.get('tourStep'));
    const initialStep = Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep < STEPS.length
      ? requestedStep
      : 0;

    try {
      if (forced || localStorage.getItem(STORAGE_KEY) !== 'complete') {
        setStep(initialStep);
        setOpen(true);
      }
    } catch {
      setStep(initialStep);
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
      // The walkthrough remains usable even when storage is unavailable.
    }
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <section
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-admin-border-subtle bg-admin-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-walkthrough-title"
      >
        <div className="border-b border-admin-border-subtle px-5 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-primary">
                {current.group}
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

        <div className="max-h-[65vh] overflow-y-auto px-5 py-6 md:px-8">
          <div className="mb-6 flex gap-1.5" aria-label={'Step ' + (step + 1) + ' of ' + STEPS.length}>
            {STEPS.map((item, index) => (
              <span
                key={item.title}
                className={'h-1.5 flex-1 rounded-full ' + (index <= step ? 'bg-admin-primary' : 'bg-admin-border-subtle')}
              />
            ))}
          </div>

          <p className="text-base leading-7 text-admin-fg-secondary">{current.body}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-admin-bg-body p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-admin-fg-muted">Use this for</p>
              <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">{current.useFor}</p>
            </div>
            <div className="rounded-xl border border-admin-primary/20 bg-admin-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-admin-primary">Best practice</p>
              <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">{current.bestPractice}</p>
            </div>
          </div>

          <Link
            href={current.href}
            target={current.external ? '_blank' : undefined}
            rel={current.external ? 'noopener noreferrer' : undefined}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-xl border border-admin-border-subtle px-4 text-sm font-semibold text-admin-fg-primary transition hover:bg-admin-bg-subtle"
          >
            {current.action}
            {current.external && <span className="ml-1.5" aria-hidden="true">↗</span>}
          </Link>

          <p className="mt-3 text-xs leading-5 text-admin-fg-muted">
            You can close the walkthrough, use the section, and restart it at any time from the Walkthrough button in the admin header.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-admin-border-subtle bg-admin-bg-body px-5 py-4 md:px-8">
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
            {isLast ? 'Finish tour' : 'Next'}
          </button>
        </div>
      </section>
    </div>
  );
}
