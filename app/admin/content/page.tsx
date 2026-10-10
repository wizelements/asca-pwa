'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  SITE_CONTENT_PAGES,
  getDefaultSiteContent,
  type SiteContentFieldDefinition,
} from '@/lib/content/site-content';

type Values = Record<string, string | string[]>;

function valueForInput(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join('\n') : value || '';
}

export default function AdminPageText() {
  const defaults = useMemo(() => getDefaultSiteContent(), []);
  const [values, setValues] = useState<Values>(defaults);
  const [savedValues, setSavedValues] = useState<Values>(defaults);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
    // defaults is stable by useMemo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/site-content', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to load page text.');
      const next = { ...defaults, ...(data.values || {}) };
      setValues(next);
      setSavedValues(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load page text.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: SiteContentFieldDefinition, raw: string) => {
    setValues((current) => ({
      ...current,
      [field.key]: field.type === 'list'
        ? raw.split('\n').map((item) => item.trim()).filter(Boolean)
        : raw,
    }));
  };

  const pageUpdates = (pageId: string) => {
    const page = SITE_CONTENT_PAGES.find((item) => item.id === pageId);
    if (!page) return {};
    const keys = page.sections.flatMap((section) => section.fields.map((field) => field.key));
    return Object.fromEntries(keys.map((key) => [key, values[key]]));
  };

  const isDirty = (pageId: string) => {
    const updates = pageUpdates(pageId);
    return Object.entries(updates).some(([key, value]) =>
      JSON.stringify(value) !== JSON.stringify(savedValues[key])
    );
  };

  const save = async (pageId: string) => {
    const token = getAdminToken();
    setSavingPage(pageId);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ updates: pageUpdates(pageId) }),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to save page text.');
      const next = { ...defaults, ...(data.values || {}) };
      setValues(next);
      setSavedValues(next);
      const page = SITE_CONTENT_PAGES.find((item) => item.id === pageId);
      setMessage(`${page?.label || 'Page'} text saved. Open the public page to verify it in context.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save page text.');
    } finally {
      setSavingPage('');
    }
  };

  const restorePageDefaults = (pageId: string) => {
    const page = SITE_CONTENT_PAGES.find((item) => item.id === pageId);
    if (!page) return;
    const next = { ...values };
    for (const section of page.sections) {
      for (const field of section.fields) {
        next[field.key] = Array.isArray(field.defaultValue)
          ? [...field.defaultValue]
          : field.defaultValue;
      }
    }
    setValues(next);
    setMessage('Defaults restored in the editor. Save this page to publish them.');
    setError('');
  };

  if (loading) return <p className="p-8 text-admin-fg-muted">Loading page text…</p>;

  return (
    <>
      <AdminPageHeader
        title="Page Text"
        subtitle="Edit visitor-facing wording without touching code. Each group names the public page affected; dynamic records such as Events, Gallery Albums, Horses, Members, images, social links, and donation handles stay in their dedicated editors."
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <strong>Safe text only.</strong> These fields accept plain text and simple lists—no HTML, scripts, URLs, or layout code. Saving changes the wording, not the structure of the site.
        </div>

        {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {SITE_CONTENT_PAGES.map((page) => (
          <section key={page.id} className="rounded-2xl border border-admin-border-subtle bg-admin-surface shadow-sm">
            <div className="flex flex-col gap-3 border-b border-admin-border-subtle p-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-admin-fg-primary">{page.label}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-admin-fg-secondary">{page.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={page.publicPath} target="_blank" className="btn-admin-secondary">
                  View public page ↗
                </Link>
                <button type="button" onClick={() => restorePageDefaults(page.id)} className="btn-admin-secondary">
                  Restore defaults
                </button>
                <button
                  type="button"
                  onClick={() => void save(page.id)}
                  disabled={savingPage === page.id || !isDirty(page.id)}
                  className="btn-admin-primary disabled:opacity-50"
                >
                  {savingPage === page.id ? 'Saving…' : isDirty(page.id) ? 'Save page text' : 'Saved'}
                </button>
              </div>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-2">
              {page.sections.map((section) => (
                <div key={section.label} className="rounded-xl bg-admin-bg-body p-4">
                  <h3 className="font-bold text-admin-fg-primary">{section.label}</h3>
                  <div className="mt-4 space-y-4">
                    {section.fields.map((field) => {
                      const display = valueForInput(values[field.key]);
                      return (
                        <label key={field.key} className="block">
                          <span className="text-sm font-semibold text-admin-fg-secondary">{field.label}</span>
                          {field.type === 'text' ? (
                            <input
                              type="text"
                              value={display}
                              maxLength={field.maxLength}
                              onChange={(event) => update(field, event.target.value)}
                              className="form-input mt-1 w-full"
                            />
                          ) : (
                            <textarea
                              rows={field.type === 'list' ? Math.max(3, Math.min(8, (values[field.key] as string[] | undefined)?.length || 3)) : 4}
                              value={display}
                              maxLength={field.type === 'list' ? undefined : field.maxLength}
                              onChange={(event) => update(field, event.target.value)}
                              className="form-input mt-1 w-full"
                            />
                          )}
                          <span className="mt-1 block text-xs leading-5 text-admin-fg-muted">
                            {field.type === 'list'
                              ? `One item per line · up to ${field.maxLength} characters per item.`
                              : field.help || `Up to ${field.maxLength} characters.`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
