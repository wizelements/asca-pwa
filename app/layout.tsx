import type { Metadata, Viewport } from 'next'
import { Poppins, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import { getCachedSiteTagline, getCachedTheme } from '@/lib/db/queries-cache'
import { ASCA_DEFAULT_THEME, resolveThemeSettings, themeSettingsToCss } from '@/lib/theme'
import { getSiteUrl } from '@/lib/site-url'

// Inline base64 media has been extracted to media_assets (2026-07-20), so the
// cached settings payload is small enough for Next's data cache again.
export const dynamic = 'force-static'
export const revalidate = 60

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
  metadataBase: new URL(getSiteUrl()),
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

async function getRootThemeCss() {
  try {
    const [theme, tagline] = await Promise.all([getCachedTheme(), getCachedSiteTagline()])
    const resolved = resolveThemeSettings(theme, tagline)
    return { css: themeSettingsToCss(resolved), themeColor: resolved.accentColor }
  } catch (error) {
    console.error('[ROOT THEME]', error)
    return { css: themeSettingsToCss(ASCA_DEFAULT_THEME), themeColor: ASCA_DEFAULT_THEME.accentColor }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const rootTheme = await getRootThemeCss()

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        <style>{`
          :root {
            --font-poppins-family: ${poppins.style.fontFamily};
            --font-inter-family: ${inter.style.fontFamily};
            ${rootTheme.css}
          }
        `}</style>
        <meta name="theme-color" content={rootTheme.themeColor} />
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
