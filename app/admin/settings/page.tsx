'use client';

import { useEffect, useState } from 'react';
import { getAdminToken, logout } from '@/components/AdminGuard';
import { DONATION_METHODS } from '@/lib/content/site';

const DEFAULT_CASH_APP = DONATION_METHODS.find((method) => method.label === 'Cash App')?.handle || '$therealasca1';
const DEFAULT_ZELLE = DONATION_METHODS.find((method) => method.label === 'Zelle')?.handle || 'therealasca@gmail.com';

function sanitizeSocial(social: any) {
  return {
    facebook: typeof social?.facebook === 'string' ? social.facebook : '',
    instagram: typeof social?.instagram === 'string' ? social.instagram : '',
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
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(normalizeSettings(data));
      } else {
        setError('Unable to load social and donation settings.');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Unable to load social and donation settings.');
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
    const token = getAdminToken();

    try {
      const payload: any = {};
      if (section === 'social') {
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const updated = await res.json();
        setSettings(normalizeSettings(updated));
        setMessage('Saved successfully');
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
        <h1 className="text-4xl font-bold text-brand-fg-primary">Social & Donation Settings</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || 'Unable to load social and donation settings.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Social & Donation Settings</h1>
          <p className="mt-2 max-w-3xl text-sm text-brand-fg-secondary">
            These are the public-site settings ASCA can safely manage here. Facebook and Instagram update the site header/footer. Cash App and Zelle update the Support ASCA donation cards.
          </p>
        </div>
        {message && <span className="text-sm font-medium text-green-600">{message}</span>}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Social Links</h2>
          <div className="space-y-4">
            {[
              { label: 'Facebook', key: 'social.facebook' },
              { label: 'Instagram', key: 'social.instagram' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">{field.label}</label>
                <input
                  type="url"
                  value={settings.social?.[field.key.split('.')[1]] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>
            ))}
            <div className="rounded-lg border border-brand-border-subtle bg-brand-bg-subtle p-4">
              <p className="text-sm font-semibold text-brand-fg-primary">TikTok</p>
              <p className="mt-1 text-sm text-brand-fg-secondary">Coming soon — shown as text on the public footer, not a link.</p>
            </div>
            <button
              onClick={() => handleSave('social')}
              disabled={saving}
              className="w-full py-2 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        </div>

        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Donation Methods</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">CashApp Handle</label>
              <input
                type="text"
                value={settings.donation?.cashApp || ''}
                onChange={(e) => updateField('donation.cashApp', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Zelle Email</label>
              <input
                type="email"
                value={settings.donation?.zelle || ''}
                onChange={(e) => updateField('donation.zelle', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              />
            </div>
            <button
              onClick={() => handleSave('donations')}
              disabled={saving}
              className="w-full py-2 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Donation Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
