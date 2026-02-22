import type { Metadata } from 'next'
import { Poppins, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Atlanta Saddle Club Association',
  description: 'We Ride To Inspire - Premier equestrian community',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ASCA',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'theme-color': '#1f6b3a',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        <style>{`
          :root {
            --brand-bg-body: #f7f3ea;
            --brand-bg-elevated: #ffffff;
            --brand-bg-subtle: #f0e9dd;
            --brand-bg-soft: #ece3d3;
            --brand-bg-soft-alt: #e3dac9;
            --brand-fg-primary: #1f1f1f;
            --brand-fg-secondary: #4f4f4f;
            --brand-fg-muted: #8a8174;
            --brand-fg-on-soft: #2b2521;
            --brand-border-subtle: rgba(111, 97, 84, 0.18);
            --brand-border-strong: #d2c4ad;
            --brand-accent: #e7bc47;
            --brand-accent-muted: #f0c65d;
            --brand-forest: #1f6b3a;
            --brand-forest-muted: #2f7c4c;
            --brand-danger: #d8514a;
            --font-sans: ${inter.style.fontFamily};
            --font-display: ${poppins.style.fontFamily};
            --font-serif: Georgia, serif;
          }
        `}</style>
        <meta name="theme-color" content="#1f6b3a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ASCA" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-brand-bg-body text-brand-fg-primary font-sans">
        <ServiceWorkerRegister />
        <div id="app">{children}</div>
      </body>
    </html>
  )
}
