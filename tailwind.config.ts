import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: {
            body: 'var(--brand-bg-body)',
            elevated: 'var(--brand-bg-elevated)',
            subtle: 'var(--brand-bg-subtle)',
            soft: 'var(--brand-bg-soft)',
            softAlt: 'var(--brand-bg-soft-alt)',
          },
          fg: {
            primary: 'var(--brand-fg-primary)',
            secondary: 'var(--brand-fg-secondary)',
            muted: 'var(--brand-fg-muted)',
            onSoft: 'var(--brand-fg-on-soft)',
          },
          border: {
            subtle: 'var(--brand-border-subtle)',
            strong: 'var(--brand-border-strong)',
          },
          accent: 'var(--brand-accent)',
          accentMuted: 'var(--brand-accent-muted)',
          forest: 'var(--brand-forest)',
          forestMuted: 'var(--brand-forest-muted)',
          danger: 'var(--brand-danger)',
        },
        primary: 'var(--color-primary, #1a1a1a)',
        secondary: 'var(--color-secondary, #4a4b02)',
        accent: 'var(--color-accent, #f5d800)',
        neutral: 'var(--color-neutral, #ffffff)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'var(--font-display)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
export default config
