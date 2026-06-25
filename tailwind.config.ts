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
        color: {
          primary: 'var(--color-primary, #1f6b3a)',
          secondary: 'var(--color-secondary, #2f7c4c)',
          accent: 'var(--color-accent, #e6d543)',
          background: 'var(--color-background, #ffffff)',
          text: 'var(--color-text, #1f1f1f)',
          button: 'var(--color-button, #1f6b3a)',
          buttonText: 'var(--color-button-text, #ffffff)',
          neutral: 'var(--color-neutral, #ffffff)',
        },
        admin: {
          primary: '#1f6b3a',
          'primary-dark': '#174f2b',
          surface: '#ffffff',
          'bg-body': '#f8faf9',
          'bg-subtle': '#eef4f0',
          'fg-primary': '#1f1f1f',
          'fg-secondary': '#4a4a4a',
          'fg-muted': '#737373',
          'border-subtle': '#dce8e0',
          success: '#16a34a',
          warning: '#d97706',
          danger: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-poppins)', 'system-ui', 'sans-serif'],
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
