/**
 * Canonical site URL.
 *
 * Set `NEXT_PUBLIC_SITE_URL` to override the live custom domain for a
 * specific environment. The verified production fallback keeps public sharing
 * branded even if the environment variable is unavailable.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return 'https://www.atlantasaddleclub.com';
}
