import type { Metadata, Viewport } from 'next'
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
  title: {
    default: 'Atlanta Saddle Club Association | We Ride To Inspire',
    template: '%s | ASCA',
  },
  description: 'Atlanta Saddle Club Association promotes horsemanship, fellowship, education, community service, and equestrian experiences across metro Atlanta.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://asca-pwa.vercel.app'),
  openGraph: {
    type: 'website',
    siteName: 'Atlanta Saddle Club Association',
    title: 'Atlanta Saddle Club Association | We Ride To Inspire',
    description: 'Atlanta Saddle Club Association promotes horsemanship, fellowship, education, community service, and equestrian experiences across metro Atlanta.',
    images: [{ url: '/images/asca/logo.png', width: 494, height: 406, alt: 'ASCA Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlanta Saddle Club Association | We Ride To Inspire',
    description: 'Atlanta Saddle Club Association promotes horsemanship, fellowship, education, community service, and equestrian experiences across metro Atlanta.',
    images: ['/images/asca/logo.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ASCA',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#e6d543',
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
            --brand-bg-body: #ffffff;
            --brand-bg-elevated: #ffffff;
            --brand-bg-subtle: #ffffff;
            --brand-bg-soft: #ffffff;
            --brand-bg-soft-alt: #ffffff;
            --brand-fg-primary: #1f1f1f;
            --brand-fg-secondary: #4f4f4f;
            --brand-fg-muted: #637064;
            --brand-fg-on-soft: #1f1f1f;
            --brand-border-subtle: rgba(31, 107, 58, 0.16);
            --brand-border-strong: rgba(31, 107, 58, 0.28);
            --brand-accent: #e6d543;
            --brand-accent-muted: #f0d95d;
            --brand-forest: #1f6b3a;
            --brand-forest-muted: #2f7c4c;
            --brand-danger: #d8514a;
            --font-sans: ${inter.style.fontFamily};
            --font-display: ${poppins.style.fontFamily};
            --font-serif: Georgia, serif;
          }
        `}</style>
        <meta name="theme-color" content="#e6d543" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ASCA" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-brand-bg-body text-brand-fg-primary font-sans">
        <ServiceWorkerRegister />
        <div id="app">{children}</div>
      </body>
    </html>
  )
}
