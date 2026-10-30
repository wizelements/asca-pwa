'use client';

import { useEffect, useState } from 'react';
import { logout } from '@/components/AdminGuard';
import { DONATION_METHODS } from '@/lib/content/site';

const DEFAULT_CASH_APP = DONATION_METHODS.find((method) => method.label === 'Cash App')?.handle || '$therealasca1';
const DEFAULT_ZELLE = DONATION_METHODS.find((method) => method.label === 'Zelle')?.handle || 'therealasca@gmail.com';

function sanitizeSocial(social: any) {
  return {
    facebook: typeof social?.facebook === 'string' ? social.facebook : '',
    instagram: typeof social?.instagram === 'string' ? social.instagram : '',
    tiktok: typeof social?.tiktok === 'string' ? social.tiktok : '',
  };
}

function sanitizeDonationSettings(settings: any) {
  return {
    cashApp: typeof settings?.cashApp === 'string' && settings.cashApp ? settings.cashApp : DEFAULT_CASH_APP,
    zelle: typeof settings?.venmo?.zelle === 'string' && settings.venmo.zelle ? settings.venmo.zelle : DEFAULT_ZELLE,
  };
}

function normalizeSettings(settings: any) {
  return {
    ...settings,
    social: sanitizeSocial(settings?.social),
    donation: sanitizeDonationSettings(settings),
    contactEmail: typeof settings?.contactEmail === 'string' && settings.contactEmail
      ? settings.contactEmail
      : 'info@atlantasaddleclub.com',
    siteDescription: typeof settings?.siteDescription === 'string' && settings.siteDescription.trim()
      ? settings.siteDescription
      : 'We Ride To Inspire',
    tagline:
      typeof settings?.tagline === 'string' &&
      settings.tagline.trim() &&
      settings.tagline !== 'Promoting horsemanship, sportsmanship, and community'
        ? settings.tagline
        : "Atlanta's premiere saddle club — promoting horsemanship, fellowship, education, and community across metro Atlanta.",
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings', { credentials: 'same-origin', cache: 'no-store' });
      if (res.status === 401) { await logout(); return; }
      if (res.ok) {
        const data = await res.json();
        setSettings(normalizeSettings(data));
      } else {
        setError('Unable to load public website settings.');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Unable to load public website settings.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (path: string, value: any) => {
    setSettings((prev: any) => {
      const next = { ...prev };
      const keys = path.split('.');
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload: any = {};
      if (section === 'identity') {
        payload.siteDescription = settings.siteDescription.trim();
        payload.tagline = settings.tagline.trim();
      } else if (section === 'contact') {
        payload.contactEmail = settings.contactEmail.trim();
      } else if (section === 'social') {
        payload.social = sanitizeSocial(settings.social);
      } else if (section === 'donations') {
        payload.cashApp = settings.donation.cashApp;
        payload.venmo = {
          ...(settings.venmo || {}),
          zelle: settings.donation.zelle,
        };
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        await logout();
        return;
      }

      if (res.ok) {
        const updated = await res.json();
        const normalized = normalizeSettings(updated);
        // Only replace the saved section. Overwriting the entire editor here
        // would silently discard changes made to other sections.
        setSettings((current: any) => {
          if (!current) return normalized;
          if (section === 'identity') {
            return { ...current, siteDescription: normalized.siteDescription, tagline: normalized.tagline };
          }
          if (section === 'contact') return { ...current, contactEmail: normalized.contactEmail };
          if (section === 'social') return { ...current, social: normalized.social };
          if (section === 'donations') return { ...current, donation: normalized.donation, venmo: normalized.venmo };
          return current;
        });
        setMessage(section === 'identity' ? 'Homepage identity saved.' : section === 'contact' ? 'Contact email saved.' : section === 'social' ? 'Social links saved.' : 'Donation settings saved.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Save failed');
      }
    } catch (error) {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!settings) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-brand-fg-primary">Public Site Settings</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error || 'Unable to load public website settings.'}
        </div>
        <button type="button" onClick={() => void fetchSettings()} className="btn-admin-secondary">Retry loading settings</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Public Site Settings</h1>
          <p className="mt-2 max-w-3xl text-sm text-brand-fg-secondary">
            These controls are limited to settings the public website actually consumes: homepage identity copy, official contact email, social links, and donation handles. Each section below states where the change appears.
          </p>
        </div>
        {message && <span role="status" className="text-sm font-medium text-green-800">{message}</span>}
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-fg-primary">Homepage Identity</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-fg-secondary">
          These two lines are the main public introduction to ASCA. The motto appears as the homepage hero title and on the installed-app launch screen. The description appears directly beneath the homepage motto.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="site-motto" className="mb-1 block text-sm font-semibold text-brand-fg-primary">Public motto</label>
            <input
              id="site-motto"
              type="text"
              maxLength={80}
              value={settings.siteDescription || ''}
              onChange={(e) => updateField('siteDescription', e.target.value)}
              className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
            />
            <p className="mt-1 text-xs text-brand-fg-muted">Example: We Ride To Inspire</p>
          </div>
          <div>
            <label htmlFor="site-tagline" className="mb-1 block text-sm font-semibold text-brand-fg-primary">Homepage hero description</label>
            <textarea
              id="site-tagline"
              rows={3}
              maxLength={240}
              value={settings.tagline || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
            />
            <p className="mt-1 text-xs text-brand-fg-muted">Keep this concise enough to read comfortably over the hero image on a phone.</p>
          </div>
        </div>
        <button
          onClick={() => handleSave('identity')}
          disabled={saving || !settings.siteDescription?.trim() || !settings.tagline?.trim()}
          className="mt-5 min-h-[44px] rounded-lg bg-brand-forest px-5 py-2 font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Homepage Identity'}
        </button>
      </div>

      <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-fg-primary">Public Contact Email</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-fg-secondary">
          This is the official email visitors see in the site footer and on Support ASCA for sponsorship questions. Website form submissions are saved in Messages whether or not an email alert is delivered.
        </p>
        <div className="mt-5 max-w-xl">
          <label htmlFor="site-contact-email" className="mb-1 block text-sm font-semibold text-brand-fg-primary">Official contact email</label>
          <input
            id="site-contact-email"
            type="email"
            value={settings.contactEmail || ''}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
          />
          <button
            onClick={() => handleSave('contact')}
            disabled={saving || !settings.contactEmail}
            className="mt-4 min-h-[44px] rounded-lg bg-brand-forest px-5 py-2 font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Public Contact Email'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Social Links</h2>
          <div className="space-y-4">
            {[
              { label: 'Facebook', key: 'social.facebook' },
              { label: 'Instagram', key: 'social.instagram' },
              { label: 'TikTok', key: 'social.tiktok' },
            ].map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key.replace('.', '-')} className="block text-sm font-semibold text-brand-fg-primary mb-1">{field.label}</label>
                <input
                  id={field.key.replace('.', '-')}
                  type="url"
                  value={settings.social?.[field.key.split('.')[1]] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>
            ))}
            <div className="rounded-lg border border-brand-border-subtle bg-brand-bg-subtle p-4 text-sm text-brand-fg-secondary">
              Facebook, Instagram, and TikTok are used by the public social icons in the header/mobile menu and footer. Save a full http:// or https:// URL. Clear a field and save to hide that icon.
            </div>
            <button
              onClick={() => handleSave('social')}
              disabled={saving}
              className="w-full min-h-[44px] py-2 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        </div>

        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Donation Methods</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="site-cashapp" className="block text-sm font-semibold text-brand-fg-primary mb-1">CashApp Handle</label>
              <input
                id="site-cashapp"
                type="text"
                value={settings.donation?.cashApp || ''}
                onChange={(e) => updateField('donation.cashApp', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              />
            </div>
            <div>
              <label htmlFor="site-zelle" className="block text-sm font-semibold text-brand-fg-primary mb-1">Zelle Email</label>
              <input
                id="site-zelle"
                type="email"
                value={settings.donation?.zelle || ''}
                onChange={(e) => updateField('donation.zelle', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              />
            </div>
            <button
              onClick={() => handleSave('donations')}
              disabled={saving}
              className="w-full min-h-[44px] py-2 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Donation Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
