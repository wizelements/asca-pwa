import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #1a1a1a)',
        secondary: 'var(--color-secondary, #4a4b02)',
        accent: 'var(--color-accent, #f5d800)',
        neutral: 'var(--color-neutral, #ffffff)',
      },
      fontFamily: {
        sans: 'var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)',
        serif: 'var(--font-serif, ui-serif, Georgia, serif)',
      },
    },
  },
  plugins: [],
}
export default config
