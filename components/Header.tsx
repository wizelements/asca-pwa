import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Members' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/blog', label: 'Blog' },
  { href: '/donate', label: 'Donate' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border-subtle bg-brand-bg-body/90 backdrop-blur">
      <nav className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-lg tracking-[0.3em] text-brand-fg-primary">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border-strong bg-brand-bg-elevated text-sm font-bold text-brand-forest">
            ASCA
          </span>
          <span className="hidden text-xs uppercase text-brand-fg-muted md:inline">Atlanta Saddle Club</span>
        </Link>
        <ul className="hidden items-center gap-6 text-sm uppercase tracking-[0.2em] text-brand-fg-secondary lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-brand-forest">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link href="/get-involved" className="btn-accent text-xs sm:text-sm">
            Get Involved
          </Link>
        </div>
      </nav>
    </header>
  );
}
