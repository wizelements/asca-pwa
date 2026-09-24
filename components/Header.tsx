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
    <header className="sticky top-0 z-50 border-b border-brand-border-subtle bg-brand-bg-elevated/95 shadow-sm backdrop-blur-xl">
      <nav className="container flex min-h-[72px] items-center justify-between gap-4" aria-label="Primary">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="ASCA home">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-forest p-1.5 ring-1 ring-black/5">
            <ManagedImage
              src={logoSrc}
              alt=""
              height={44}
              width={44}
              className="h-full w-auto"
            />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-sm font-bold tracking-[0.16em] text-brand-fg-primary">ASCA</span>
            <span className="hidden truncate text-[10px] font-medium uppercase tracking-[0.12em] text-brand-fg-muted sm:block">
              Atlanta Saddle Club Association
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 xl:flex">
          {desktopLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'rounded-full bg-brand-bg-subtle px-3 py-2 text-sm font-semibold text-brand-forest'
                    : 'rounded-full px-3 py-2 text-sm font-semibold text-brand-fg-secondary transition hover:bg-brand-bg-subtle hover:text-brand-fg-primary'
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
            className="hidden min-h-[42px] items-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-forest-muted lg:inline-flex"
          >
            Support ASCA
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-fg-primary transition hover:bg-brand-bg-subtle xl:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-brand-border-subtle bg-brand-bg-elevated xl:hidden">
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
                          ? 'block rounded-xl bg-brand-bg-subtle px-4 py-3 text-sm font-semibold text-brand-forest'
                          : 'block rounded-xl px-4 py-3 text-sm font-semibold text-brand-fg-secondary hover:bg-brand-bg-subtle hover:text-brand-fg-primary'
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-brand-border-subtle pt-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-fg-muted">Follow ASCA</p>
              <SocialLinks showTikTokNote={false} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
