'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ManagedImage from '@/components/media/ManagedImage';
import SocialLinks from '@/components/SocialLinks';
import { NAV_LINKS } from '@/lib/content/site';
import { DEFAULT_LOGO } from '@/lib/media';

const DESKTOP_LINKS = new Set([
  '/about',
  '/members',
  '/where-to-find-us',
  '/gallery',
  '/horses',
  '/get-involved',
]);

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(DEFAULT_LOGO);

  const desktopLinks = useMemo(
    () => NAV_LINKS.filter((link) => DESKTOP_LINKS.has(link.href)),
    []
  );

  useEffect(() => {
    let mounted = true;
    fetch('/api/theme', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((theme) => {
        if (mounted && typeof theme?.logo === 'string' && theme.logo) setLogoSrc(theme.logo);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="pwa-safe-top sticky top-0 z-50 border-b border-brand-forest/10 bg-[rgba(251,250,246,.97)] backdrop-blur-xl">
      <nav className="container flex min-h-[78px] items-center justify-between gap-4" aria-label="Primary">
        <Link href="/" className="flex min-w-0 items-center gap-3.5" aria-label="ASCA home">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-forest p-1.5 shadow-sm">
            <ManagedImage
              src={logoSrc}
              alt=""
              height={48}
              width={48}
              className="h-full w-auto"
            />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-xl font-semibold leading-none text-brand-fg-primary">ASCA</span>
            <span className="mt-1 hidden truncate text-xs font-medium text-brand-fg-secondary sm:block">
              Atlanta Saddle Club Association
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          {desktopLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'border-b-2 border-brand-accent py-2 text-sm font-semibold text-brand-forest'
                    : 'border-b-2 border-transparent py-2 text-sm font-medium text-brand-fg-secondary transition hover:border-brand-accent/60 hover:text-brand-fg-primary'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/support-asca"
            className="hidden min-h-[44px] items-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-forest-muted lg:inline-flex"
          >
            Support ASCA
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-forest/15 text-brand-fg-primary transition hover:bg-brand-bg-subtle xl:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-brand-forest/10 bg-[#fbfaf6] xl:hidden">
          <div className="container py-5">
            <ul className="grid gap-1 sm:grid-cols-2">
              {NAV_LINKS.filter((link) => link.href !== '/').map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={
                        active
                          ? 'block rounded-xl bg-brand-bg-subtle px-4 py-3 text-base font-semibold text-brand-forest'
                          : 'block rounded-xl px-4 py-3 text-base font-medium text-brand-fg-secondary hover:bg-brand-bg-subtle hover:text-brand-fg-primary'
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/share"
              className="mt-4 flex min-h-[50px] items-center justify-between rounded-xl border border-brand-forest/15 bg-white px-4 text-sm font-semibold text-brand-forest"
            >
              <span>Share ASCA</span>
              <span aria-hidden="true">QR · Share →</span>
            </Link>

            <div className="mt-4 flex items-center justify-between border-t border-brand-forest/10 pt-4">
              <p className="text-xs font-semibold text-brand-fg-secondary">Follow ASCA</p>
              <SocialLinks showTikTokNote={false} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
