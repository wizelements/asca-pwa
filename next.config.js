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
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
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
    ];
  },

  // Headers for PWA and caching
  headers: async () => {
    return [
      // Service Worker - no cache
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Manifest - revalidate frequently
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
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
