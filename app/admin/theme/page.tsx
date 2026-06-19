'use client';

import { useEffect, useState } from 'react';
import { getAdminToken } from '@/components/AdminGuard';

const DEFAULT_COLORS = {
  primary: '#1a1a1a',
  secondary: '#4a4b02',
  accent: '#f5d800',
  neutral: '#ffffff',
};

export default function AdminTheme() {
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme');
      if (res.ok) {
        const data = await res.json();
        setTheme(data);
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateColor = (key: string, value: string) => {
    setTheme((prev: any) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const updateFont = (key: string, value: string) => {
    setTheme((prev: any) => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const token = getAdminToken();

    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          colors: theme.colors,
          fonts: theme.fonts,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTheme(updated);
        setMessage('Theme saved successfully');
      } else {
        setMessage('Save failed');
      }
    } catch (error) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !theme) {
    return <div className="p-8">Loading...</div>;
  }

  const colors = theme.colors || DEFAULT_COLORS;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-brand-fg-primary">Theme Editor</h1>
        {message && <span className="text-sm font-medium text-green-600">{message}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Colors</h2>
          <div className="space-y-6">
            {Object.entries(DEFAULT_COLORS).map(([key, defaultValue]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-2 capitalize">
                  {key}
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={colors[key] || defaultValue}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-16 h-16 rounded-lg border-2 border-brand-border-subtle cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors[key] || defaultValue}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="flex-1 px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary font-mono focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Fonts</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">
                Sans Serif Font
              </label>
              <select
                value={theme.fonts?.sans || 'system-ui'}
                onChange={(e) => updateFont('sans', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              >
                <option value="system-ui">System UI</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="Roboto, sans-serif">Roboto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-fg-primary mb-1">
                Serif Font
              </label>
              <select
                value={theme.fonts?.serif || 'Georgia'}
                onChange={(e) => updateFont('serif', e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              >
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Garamond, serif">Garamond</option>
                <option value="'Playfair Display', serif">Playfair Display</option>
                <option value="Merriweather, serif">Merriweather</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-brand-bg-elevated p-6 rounded-xl shadow-sm border border-brand-border-subtle">
          <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">Preview</h2>
          <div
            className="p-6 rounded-lg min-h-64 flex flex-col items-center justify-center gap-4"
            style={{ backgroundColor: colors.secondary }}
          >
            <h3 style={{ color: colors.neutral, fontFamily: theme.fonts?.serif || 'Georgia' }}>
              Sample Heading
            </h3>
            <p style={{ color: colors.neutral, fontFamily: theme.fonts?.sans || 'system-ui' }}>
              This is sample body text using your selected fonts and colors.
            </p>
            <button
              style={{ backgroundColor: colors.accent, color: colors.primary }}
              className="px-6 py-2 rounded-lg font-semibold"
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-3 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Theme Changes'}
      </button>
    </div>
  );
}
