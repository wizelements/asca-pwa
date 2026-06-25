import type { ThemeSettings } from '@/lib/theme';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  useCase: string;
  colors: Pick<
    ThemeSettings,
    'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' | 'textColor' | 'buttonColor' | 'buttonTextColor'
  >;
  fonts?: Partial<Pick<ThemeSettings, 'headingFont' | 'bodyFont'>>;
  accessibilityNotes: string;
}

export const ASCA_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'asca-classic',
    name: 'ASCA Classic',
    description: 'The default official ASCA brand.',
    useCase: 'Everyday public site.',
    colors: {
      primaryColor: '#1f6b3a',
      secondaryColor: '#2f7c4c',
      accentColor: '#e6d543',
      backgroundColor: '#ffffff',
      textColor: '#1f1f1f',
      buttonColor: '#1f6b3a',
      buttonTextColor: '#ffffff',
    },
    fonts: {
      headingFont: 'var(--font-poppins), system-ui, sans-serif',
      bodyFont: 'var(--font-inter), system-ui, sans-serif',
    },
    accessibilityNotes: '7.5:1 text contrast, 4.6:1 button contrast.',
  },
  {
    id: 'heritage-gold',
    name: 'Heritage Gold',
    description: 'Warmer gold, deep green, community feel.',
    useCase: 'Formal events, founder story, history page.',
    colors: {
      primaryColor: '#1a5c33',
      secondaryColor: '#6b5b1e',
      accentColor: '#d4af37',
      backgroundColor: '#fffdf5',
      textColor: '#2b2416',
      buttonColor: '#6b5b1e',
      buttonTextColor: '#ffffff',
    },
    fonts: {
      headingFont: 'Georgia, serif',
      bodyFont: 'var(--font-inter), system-ui, sans-serif',
    },
    accessibilityNotes: '6.8:1 text, 4.5:1 button.',
  },
  {
    id: 'rodeo-night',
    name: 'Rodeo Night',
    description: 'Dark green, charcoal, gold accents.',
    useCase: 'Evening events, rodeo/festival feel.',
    colors: {
      primaryColor: '#2d5a3f',
      secondaryColor: '#4a6741',
      accentColor: '#f4e04d',
      backgroundColor: '#1a1f1c',
      textColor: '#f0f0f0',
      buttonColor: '#f4e04d',
      buttonTextColor: '#1a1f1c',
    },
    fonts: {
      headingFont: 'var(--font-poppins), system-ui, sans-serif',
      bodyFont: 'var(--font-inter), system-ui, sans-serif',
    },
    accessibilityNotes: '15:1 text, 12:1 button.',
  },
  {
    id: 'trail-ride',
    name: 'Trail Ride',
    description: 'Earth tones, sage, tan, warm neutral.',
    useCase: 'Outdoor rides, casual community feel.',
    colors: {
      primaryColor: '#5d6b58',
      secondaryColor: '#8b7d6b',
      accentColor: '#c2a878',
      backgroundColor: '#f7f5f0',
      textColor: '#3d3830',
      buttonColor: '#5d6b58',
      buttonTextColor: '#ffffff',
    },
    fonts: {
      headingFont: 'var(--font-poppins), system-ui, sans-serif',
      bodyFont: 'var(--font-inter), system-ui, sans-serif',
    },
    accessibilityNotes: '5.2:1 text, 4.5:1 button.',
  },
  {
    id: 'parade-day',
    name: 'Parade Day',
    description: 'Bright white, bold green, gold highlights.',
    useCase: 'Parades, festivals, public-facing energy.',
    colors: {
      primaryColor: '#147a3e',
      secondaryColor: '#1f6b3a',
      accentColor: '#fce44d',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      buttonColor: '#147a3e',
      buttonTextColor: '#ffffff',
    },
    fonts: {
      headingFont: 'var(--font-poppins), system-ui, sans-serif',
      bodyFont: 'var(--font-inter), system-ui, sans-serif',
    },
    accessibilityNotes: '9.1:1 text, 4.6:1 button.',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Accessible, strong contrast, larger interface cues.',
    useCase: 'Accessibility and readability.',
    colors: {
      primaryColor: '#000000',
      secondaryColor: '#333333',
      accentColor: '#ffff00',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
    },
    fonts: {
      headingFont: 'var(--font-inter), system-ui, sans-serif',
      bodyFont: 'var(--font-inter), system-ui, sans-serif',
    },
    accessibilityNotes: '21:1 text, 21:1 button.',
  },
];

export function findPresetById(id: string): ThemePreset | undefined {
  return ASCA_THEME_PRESETS.find((preset) => preset.id === id);
}

export function applyPresetToTheme(preset: ThemePreset, current: ThemeSettings): ThemeSettings {
  return {
    ...current,
    ...preset.colors,
    headingFont: preset.fonts?.headingFont || current.headingFont,
    bodyFont: preset.fonts?.bodyFont || current.bodyFont,
  };
}
