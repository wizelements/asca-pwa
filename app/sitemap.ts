import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-url';
import { getPublicAlbums } from '@/lib/gallery/services/albums';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';

const BASE_URL = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/about',
    '/members',
    '/get-involved',
    '/where-to-find-us',
    '/gallery',
    '/support-asca',
  ];

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: BASE_URL + route,
    lastModified: now,
    changeFrequency: route === '/gallery' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/gallery' ? 0.9 : 0.8,
  }));

  if (!isPublicPreviewEnabled()) return staticRoutes;

  const albums = await getPublicAlbums();
  const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
    url: BASE_URL + '/gallery/' + album.slug,
    lastModified: album.updatedAt || album.createdAt || now,
    changeFrequency: 'monthly',
    priority: album.featured ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...albumRoutes];
}
