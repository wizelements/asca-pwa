/**
 * Canonical site URL.
 *
 * Set `NEXT_PUBLIC_SITE_URL` to the live custom domain (e.g.
 * `https://www.atlantasaddleclub.com`). Falls back to the Vercel deployment
 * URL so local/build behavior stays functional.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return 'https://asca-pwa.vercel.app';
}
