'use client';

import { useEffect, useState } from 'react';
import { getAdminToken, logout } from '@/components/AdminGuard';

function sanitizeSocial(social: any) {
  return {
    facebook: typeof social?.facebook === 'string' ? social.facebook : '',
    instagram: typeof social?.instagram === 'string' ? social.instagram : '',
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...data, social: sanitizeSocial(data.social) });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
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
    const token = getAdminToken();

    try {
      const payload: any = {};
      if (section === 'general') {
        payload.siteName = settings.siteName;
        payload.siteDescription = settings.siteDescription;
        payload.tagline = settings.tagline;
        payload.contactEmail = settings.contactEmail;
        payload.phone = settings.phone;
        payload.address = settings.address;
      } else if (section === 'social') {
        payload.social = sanitizeSocial(settings.social);
      } else if (section === 'donations') {
        payload.venmo = settings.venmo;
        payload.cashApp = settings.cashApp;
      } else if (section === 'notifications') {
        payload.notificationsEnabled = settings.notificationsEnabled;
        payload.maintenanceMode = settings.maintenanceMode;
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
        setSettings(updated);
        setMessage('Saved successfully');
      } else {
        setMessage('Save failed');
      }
    } catch (error) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-brand-fg-primary">Site Settings</h1>
        {message && <span className="text-sm font-medium text-green-600">{message}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">General</h2>
          <div className="space-y-4">
            {[
              { label: 'Site Name', key: 'siteName', type: 'text' },
              { label: 'Site Description', key: 'siteDescription', type: 'text' },
              { label: 'Tagline', key: 'tagline', type: 'text' },
              { label: 'Contact Email', key: 'contactEmail', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'text' },
              { label: 'Address', key: 'address', type: 'text' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={settings[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>
            ))}
            <button
              onClick={() => handleSave('general')}
              disabled={saving}
              className="w-full py-2 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        </div>

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
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Donations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Venmo Username</label>
              <input
                type="text"
                value={settings.venmo?.username || ''}
                onChange={(e) => updateField('venmo.username', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Venmo Presets (comma-separated)</label>
              <input
                type="text"
                value={(settings.venmo?.presets || []).join(', ')}
                onChange={(e) => updateField('venmo.presets', e.target.value.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean))}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">CashApp Handle</label>
              <input
                type="text"
                value={settings.cashApp || ''}
                onChange={(e) => updateField('cashApp', e.target.value)}
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

        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Notifications & Status</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateField('notificationsEnabled', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-brand-fg-primary">Enable email notifications on form submissions</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateField('maintenanceMode', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-brand-fg-primary">Maintenance mode</span>
            </label>
            <button
              onClick={() => handleSave('notifications')}
              disabled={saving}
              className="w-full py-2 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Status Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
