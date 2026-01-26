import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atlanta Saddle Club Association',
  description: 'We Ride To Inspire',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          :root {
            --color-primary: #1a1a1a;
            --color-secondary: #4a4b02;
            --color-accent: #f5d800;
            --color-neutral: #ffffff;
            --font-sans: system-ui, -apple-system, sans-serif;
            --font-serif: Georgia, serif;
          }
        `}</style>
      </head>
      <body className="bg-neutral text-primary font-sans">
        <div id="app">{children}</div>
      </body>
    </html>
  )
}
