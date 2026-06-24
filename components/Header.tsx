'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ManagedImage from '@/components/media/ManagedImage';
import SocialLinks from '@/components/SocialLinks';
import { NAV_LINKS } from '@/lib/content/site';
import { DEFAULT_LOGO } from '@/lib/media';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(DEFAULT_LOGO);

  useEffect(() => {
    let mounted = true;
    fetch('/api/theme')
      .then((res) => (res.ok ? res.json() : null))
      .then((theme) => {
        if (mounted && typeof theme?.logo === 'string' && theme.logo) {
          setLogoSrc(theme.logo);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border-subtle bg-brand-bg-elevated/90 backdrop-blur">
      <nav className="container flex items-center justify-between py-4" aria-label="Primary">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-forest p-1.5 shadow-sm">
            <ManagedImage
              src={logoSrc}
              alt="Atlanta Saddle Club Association logo"
              height={48}
              width={48}
              className="h-full w-auto"
            />
          </span>
          <span className="hidden flex-col md:flex">
            <span className="font-display text-sm font-bold tracking-[0.15em] text-brand-fg-primary">ASCA</span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-brand-fg-muted">Atlanta Saddle Club</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-6 text-sm uppercase tracking-[0.15em] text-brand-fg-secondary lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-brand-forest">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex">
          <SocialLinks showTikTokNote={false} />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center text-brand-fg-secondary lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-brand-border-subtle bg-brand-bg-elevated lg:hidden">
          <ul className="container flex flex-col gap-4 py-6 text-sm uppercase tracking-[0.15em] text-brand-fg-secondary">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block transition-colors hover:text-brand-forest"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="container border-t border-brand-border-subtle py-4">
            <SocialLinks />
          </div>
        </div>
      )}
    </header>
  );
}
