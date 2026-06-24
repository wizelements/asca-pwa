'use client';

import { useEffect, useMemo, useState } from 'react';

import AdminImageField from '@/components/AdminImageField';
import { getAdminToken, logout } from '@/components/AdminGuard';
import {
  ASCA_DEFAULT_THEME,
  contrastRatio,
  resolveThemeSettings,
  themeSettingsToDbPayload,
  type ThemeSettings,
} from '@/lib/theme';

const COLOR_FIELDS: Array<{ key: keyof ThemeSettings; label: string; helper: string }> = [
  { key: 'primaryColor', label: 'Primary color', helper: 'Main ASCA brand color used for nav, cards, and callouts.' },
  { key: 'secondaryColor', label: 'Secondary color', helper: 'Hover and supporting brand color.' },
  { key: 'accentColor', label: 'Accent / gold color', helper: 'Highlights, badges, and callout labels.' },
  { key: 'backgroundColor', label: 'Background color', helper: 'Primary page background.' },
  { key: 'textColor', label: 'Text color', helper: 'Primary readable text color.' },
  { key: 'buttonColor', label: 'Button color', helper: 'Primary call-to-action button background.' },
  { key: 'buttonTextColor', label: 'Button text color', helper: 'Text color on primary buttons.' },
];

const FONT_OPTIONS = [
  { label: 'ASCA Default', value: 'var(--font-poppins), system-ui, sans-serif' },
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

function ColorControl({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-fg-primary">{label}</label>
      <div className="flex items-center gap-4">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-14 cursor-pointer rounded-lg border-2 border-brand-border-subtle"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="#[0-9a-fA-F]{6}"
          className="flex-1 rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 font-mono text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
          aria-label={`${label} hex value`}
        />
      </div>
      <p className="mt-1 text-xs text-brand-fg-muted">{helper}</p>
    </div>
  );
}

export default function AdminTheme() {
  const [theme, setTheme] = useState<ThemeSettings>(ASCA_DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const textContrast = useMemo(() => contrastRatio(theme.textColor, theme.backgroundColor), [theme]);
  const buttonContrast = useMemo(() => contrastRatio(theme.buttonTextColor, theme.buttonColor), [theme]);
  const hasContrastIssue = textContrast < 4.5 || buttonContrast < 4.5;

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    setLoading(true);
    try {
      const [themeRes, settingsRes] = await Promise.all([fetch('/api/theme'), fetch('/api/settings')]);
      const themeData = themeRes.ok ? await themeRes.json() : null;
      const settingsData = settingsRes.ok ? await settingsRes.json() : null;
      setTheme(resolveThemeSettings(themeData, settingsData?.tagline));
    } catch {
      setError('Unable to load theme settings.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setTheme((current) => ({ ...current, [key]: value }));
  };

  const resetDefaults = () => {
    setTheme({ ...ASCA_DEFAULT_THEME, tagline: theme.tagline });
    setMessage('Default ASCA theme restored in the editor. Click Save Theme Changes to publish it.');
    setError('');
  };

  const handleSave = async () => {
    if (hasContrastIssue) {
      setMessage('');
      setError('Theme changes were not saved. Text and button contrast must both meet WCAG AA 4.5:1 before publishing.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');
    const token = getAdminToken();
    try {
      const payload = themeSettingsToDbPayload(theme);
      const themeRes = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (themeRes.status === 401) {
        logout();
        return;
      }
      if (!themeRes.ok) {
        setError('Unable to save theme.');
        return;
      }

      if (theme.tagline !== undefined) {
        const settingsRes = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tagline: theme.tagline }),
        });
        if (settingsRes.status === 401) {
          logout();
          return;
        }
      }

      const updated = await themeRes.json();
      setTheme(resolveThemeSettings(updated, theme.tagline));
      setMessage('Theme saved. Public pages consume these CSS variables on reload.');
    } catch {
      setError('Unable to save theme.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading theme...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Theme / Brand Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-fg-secondary">
            Update ASCA colors, fonts, logo, and tagline. These settings persist and are used by the public site through CSS variables.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={resetDefaults} className="rounded-lg border border-brand-border-subtle px-5 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle">
            Reset Defaults
          </button>
          <button type="button" onClick={handleSave} disabled={saving || hasContrastIssue} className="rounded-lg bg-brand-forest px-5 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Theme Changes'}
          </button>
        </div>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm" aria-labelledby="theme-colors-heading">
          <h2 id="theme-colors-heading" className="mb-6 text-2xl font-bold text-brand-fg-primary">Colors</h2>
          <div className="space-y-6">
            {COLOR_FIELDS.map((field) => (
              <ColorControl
                key={field.key}
                label={field.label}
                helper={field.helper}
                value={theme[field.key] as string}
                onChange={(value) => updateField(field.key, value as never)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-brand-fg-primary">Fonts & Brand</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Heading Font</label>
                <select value={theme.headingFont || ''} onChange={(e) => updateField('headingFont', e.target.value)} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary">
                  {FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Body Font</label>
                <select value={theme.bodyFont || ''} onChange={(e) => updateField('bodyFont', e.target.value)} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary">
                  {FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Site Tagline</label>
                <input type="text" value={theme.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" />
              </div>
              <AdminImageField
                label="Logo image path, URL, or upload"
                value={theme.logoImageId || ''}
                onChange={(logo) => updateField('logoImageId', logo)}
                placeholder="/images/asca/logo.png or https://..."
                helper="Controls the header/footer logo. Leave blank to use the default ASCA logo."
                previewAlt="ASCA logo preview"
              />
            </div>
          </div>

          <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-brand-fg-primary">Preview & Contrast</h2>
            <div className="rounded-lg p-6" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>Atlanta Saddle Club Association</p>
              <h3 className="mt-3 text-3xl font-bold" style={{ fontFamily: theme.headingFont }}>We Ride To Inspire</h3>
              <p className="mt-3" style={{ fontFamily: theme.bodyFont }}>Sample public page text using the selected background and text color.</p>
              <button className="mt-5 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide" style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }}>
                Sample Button
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className={textContrast >= 4.5 ? 'text-green-700' : 'text-red-700'}>
                Text contrast: {textContrast.toFixed(2)}:1 {textContrast >= 4.5 ? '✓' : '— increase contrast to meet WCAG AA'}
              </p>
              <p className={buttonContrast >= 4.5 ? 'text-green-700' : 'text-red-700'}>
                Button contrast: {buttonContrast.toFixed(2)}:1 {buttonContrast >= 4.5 ? '✓' : '— adjust button or button text color'}
              </p>
              {hasContrastIssue && (
                <p className="font-semibold text-red-700">Saving is disabled until both contrast checks pass WCAG AA.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
