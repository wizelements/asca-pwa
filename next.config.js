/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // ASCA swaps same-path website photos; keep optimizer cache short so updates are visible quickly.
    minimumCacheTTL: 60,
  },

  // Redirects from old/renamed routes to canonical destinations
  redirects: async () => {
    return [
      { source: '/blog', destination: '/gallery', permanent: true },
      { source: '/blog/:slug', destination: '/gallery', permanent: true },
      { source: '/calendar', destination: '/where-to-find-us', permanent: true },
      { source: '/calendar-of-events', destination: '/where-to-find-us', permanent: true },
      { source: '/donate', destination: '/support-asca', permanent: true },
      { source: '/visit', destination: '/#connect', permanent: true },
      { source: '/admin/ai-assistant', destination: '/admin/tasks', permanent: false },
      { source: '/admin/attendance', destination: '/admin/events', permanent: false },
      { source: '/admin/blog', destination: '/admin/gallery', permanent: false },
      { source: '/admin/campaigns', destination: '/admin/forms', permanent: false },
      { source: '/admin/follow-ups', destination: '/admin/tasks', permanent: false },
      { source: '/admin/organizations', destination: '/admin/contacts', permanent: false },
      { source: '/admin/templates', destination: '/admin/forms', permanent: false },
      { source: '/admin/volunteers', destination: '/admin/contacts', permanent: false },
      { source: '/admin/website', destination: '/admin/media', permanent: false },
    ];
  },

  // Headers for PWA and caching
  headers: async () => {
    return [
      // Service Worker - no cache
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Manifest - no cache so install metadata and icons refresh with deploys
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      // API routes - no cache
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, must-revalidate' },
        ],
      },
      // Content images may be replaced at the same URL by admins; force revalidation.
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      // Static assets - long cache
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },


};

module.exports = nextConfig;
