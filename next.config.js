/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  redirects: async () => [
    { source: '/blog', destination: '/gallery', permanent: true },
    { source: '/blog/:slug', destination: '/gallery', permanent: true },
    { source: '/calendar', destination: '/where-to-find-us', permanent: true },
    { source: '/calendar-of-events', destination: '/where-to-find-us', permanent: true },
    { source: '/donate', destination: '/support-asca', permanent: true },
    { source: '/visit', destination: '/#connect', permanent: true },
    { source: '/admin/ai-assistant', destination: '/admin/tasks', permanent: false },
    { source: '/admin/attendance', destination: '/admin/events', permanent: false },
    { source: '/admin/blog', destination: '/admin/albums', permanent: false },
    { source: '/admin/campaigns', destination: '/admin/forms', permanent: false },
    { source: '/admin/follow-ups', destination: '/admin/tasks', permanent: false },
    { source: '/admin/organizations', destination: '/admin/contacts', permanent: false },
    { source: '/admin/templates', destination: '/admin/forms', permanent: false },
    { source: '/admin/volunteers', destination: '/admin/contacts', permanent: false },
    { source: '/admin/website', destination: '/admin/media', permanent: false },
  ],

  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
        { key: 'Content-Type', value: 'application/manifest+json' },
      ],
    },
    {
      source: '/admin/:path*',
      headers: [
        { key: 'Cache-Control', value: 'private, no-store, must-revalidate' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
      ],
    },
    {
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store, must-revalidate' }],
    },
    {
      source: '/api/media/:kind/:key',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/images/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
    },
    {
      source: '/_next/image',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
    },
    {
      source: '/icons/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
      ],
    },
  ],
};

module.exports = nextConfig;
