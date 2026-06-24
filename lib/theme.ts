export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headingFont?: string;
  bodyFont?: string;
  logoImageId?: string;
  tagline?: string;
}

export const ASCA_DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#1f6b3a',
  secondaryColor: '#2f7c4c',
  accentColor: '#e6d543',
  backgroundColor: '#ffffff',
  textColor: '#1f1f1f',
  buttonColor: '#1f6b3a',
  buttonTextColor: '#ffffff',
  headingFont: 'var(--font-poppins), system-ui, sans-serif',
  bodyFont: 'var(--font-inter), system-ui, sans-serif',
};

interface DbThemeLike {
  colors?: Record<string, string | undefined>;
  fonts?: Record<string, string | undefined>;
  logo?: string;
}

function isHex(value: string | undefined): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value));
}

function pickHex(...values: Array<string | undefined>): string | undefined {
  return values.find(isHex);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

export function mixHex(base: string, overlay: string, amount: number): string {
  const a = hexToRgb(base);
  const b = hexToRgb(overlay);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount,
  );
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

export function resolveThemeSettings(theme?: DbThemeLike | null, tagline?: string): ThemeSettings {
  const colors = theme?.colors || {};
  const fonts = theme?.fonts || {};
  const primaryColor = pickHex(colors.primaryColor, colors.brandPrimary) || ASCA_DEFAULT_THEME.primaryColor;
  const secondaryColor = pickHex(colors.secondaryColor, colors.secondary) || ASCA_DEFAULT_THEME.secondaryColor;
  const accentColor = pickHex(colors.accentColor, colors.accent) || ASCA_DEFAULT_THEME.accentColor;
  const backgroundColor = pickHex(colors.backgroundColor, colors.neutral) || ASCA_DEFAULT_THEME.backgroundColor;
  const textColor = pickHex(colors.textColor) || ASCA_DEFAULT_THEME.textColor;
  const buttonColor = pickHex(colors.buttonColor) || primaryColor;
  const buttonTextColor = pickHex(colors.buttonTextColor) || (contrastRatio('#ffffff', buttonColor) >= 4.5 ? '#ffffff' : '#1f1f1f');

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
    buttonColor,
    buttonTextColor,
    headingFont: fonts.heading || fonts.serif || ASCA_DEFAULT_THEME.headingFont,
    bodyFont: fonts.body || fonts.sans || ASCA_DEFAULT_THEME.bodyFont,
    logoImageId: theme?.logo || undefined,
    tagline,
  };
}

export function themeSettingsToDbPayload(settings: ThemeSettings) {
  return {
    colors: {
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      backgroundColor: settings.backgroundColor,
      textColor: settings.textColor,
      buttonColor: settings.buttonColor,
      buttonTextColor: settings.buttonTextColor,
      primary: settings.primaryColor,
      secondary: settings.secondaryColor,
      accent: settings.accentColor,
      neutral: settings.backgroundColor,
    },
    fonts: {
      heading: settings.headingFont,
      body: settings.bodyFont,
      serif: settings.headingFont,
      sans: settings.bodyFont,
    },
    logo: settings.logoImageId || '',
  };
}

export function themeSettingsToCss(settings: ThemeSettings): string {
  const primarySoft = mixHex(settings.backgroundColor, settings.primaryColor, 0.06);
  const primarySoftAlt = mixHex(settings.backgroundColor, settings.primaryColor, 0.1);
  const accentMuted = mixHex(settings.accentColor, settings.backgroundColor, 0.25);
  const fgSecondary = mixHex(settings.textColor, settings.backgroundColor, 0.28);
  const fgMuted = mixHex(settings.textColor, settings.primaryColor, 0.45);
  const buttonHover = mixHex(settings.buttonColor, '#000000', 0.18);

  return `
    --brand-bg-body: ${settings.backgroundColor};
    --brand-bg-elevated: ${settings.backgroundColor};
    --brand-bg-subtle: ${primarySoft};
    --brand-bg-soft: ${primarySoft};
    --brand-bg-soft-alt: ${primarySoftAlt};
    --brand-fg-primary: ${settings.textColor};
    --brand-fg-secondary: ${fgSecondary};
    --brand-fg-muted: ${fgMuted};
    --brand-fg-on-soft: ${settings.textColor};
    --brand-border-subtle: rgba(${hexToRgb(settings.primaryColor).r}, ${hexToRgb(settings.primaryColor).g}, ${hexToRgb(settings.primaryColor).b}, 0.16);
    --brand-border-strong: rgba(${hexToRgb(settings.primaryColor).r}, ${hexToRgb(settings.primaryColor).g}, ${hexToRgb(settings.primaryColor).b}, 0.28);
    --brand-accent: ${settings.accentColor};
    --brand-accent-muted: ${accentMuted};
    --brand-forest: ${settings.primaryColor};
    --brand-forest-muted: ${settings.secondaryColor};
    --brand-danger: #d8514a;
    --brand-button: ${settings.buttonColor};
    --brand-button-hover: ${buttonHover};
    --brand-button-text: ${settings.buttonTextColor};
    --font-sans: ${settings.bodyFont || ASCA_DEFAULT_THEME.bodyFont};
    --font-display: ${settings.headingFont || ASCA_DEFAULT_THEME.headingFont};
    --font-serif: ${settings.headingFont || 'Georgia, serif'};
  `;
}
