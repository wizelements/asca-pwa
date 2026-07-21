import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-url';

const BASE_URL = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/members',
    '/get-involved',
    '/where-to-find-us',
    '/gallery',
    '/support-asca',
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
