import Link from 'next/link';
import ManagedImage from '@/components/media/ManagedImage';
import SocialLinks from '@/components/SocialLinks';
import ContactForm from '@/components/ContactForm';
import { FOOTER_LINKS } from '@/lib/content/site';
import { getCachedContactEmail, getCachedSiteIdentity, getCachedTheme } from '@/lib/db/queries-cache';
import { DEFAULT_LOGO } from '@/lib/media';
import { getCachedSiteContent, siteText } from '@/lib/site-content';

async function getFooterLogo() {
  try {
    const theme = await getCachedTheme();
    return theme.logo || DEFAULT_LOGO;
  } catch {
    return DEFAULT_LOGO;
  }
}

export default async function Footer() {
  const [logoSrc, contactEmail, identity, copy] = await Promise.all([
    getFooterLogo(),
    getCachedContactEmail().catch(() => 'info@atlantasaddleclub.com'),
    getCachedSiteIdentity().catch(() => ({
      siteName: 'Atlanta Saddle Club Association',
      motto: 'We Ride To Inspire',
      heroDescription: "Atlanta's premiere saddle club — promoting horsemanship, fellowship, education, and community across metro Atlanta.",
    })),
    getCachedSiteContent(),
  ]);

  return (
    <footer className="border-t border-brand-forest/10 bg-[#f4f1e7]">
      <div className="container py-16 md:py-20">
        <div className="mb-12 grid gap-6 border-b border-brand-forest/15 pb-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="section-label">Atlanta, Georgia</p>
            <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight text-brand-fg-primary md:text-5xl">
              {identity.motto}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-brand-fg-secondary lg:justify-self-end">
            {identity.heroDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_.5fr] lg:gap-16">
          <section id="contact" className="scroll-mt-24">
            <div className="editorial-card p-6 sm:p-8 md:p-10">
              <p className="section-label">{siteText(copy, 'shared.footer.contactTitle')}</p>
              <p className="mb-7 max-w-2xl text-base leading-7 text-brand-fg-secondary">
                {siteText(copy, 'shared.footer.contactBody')}
              </p>
              <ContactForm fallbackEmail={contactEmail} />
            </div>
          </section>

          <div className="lg:border-l lg:border-brand-forest/15 lg:pl-10">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-forest p-2 shadow-sm">
                <ManagedImage
                  src={logoSrc}
                  alt={identity.siteName + ' logo'}
                  width={80}
                  height={66}
                  className="h-full w-auto"
                />
              </span>
              <div>
                <p className="font-serif text-2xl font-semibold text-brand-fg-primary">ASCA</p>
                <p className="mt-1 text-sm text-brand-fg-secondary">Equestrian community</p>
              </div>
            </div>

            <h2 className="mt-9 text-xs font-semibold uppercase tracking-[0.12em] text-brand-fg-secondary">
              {siteText(copy, 'shared.footer.quickLinksTitle')}
            </h2>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base font-medium text-brand-fg-secondary hover:text-brand-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mb-4 mt-9 text-xs font-semibold uppercase tracking-[0.12em] text-brand-fg-secondary">
              {siteText(copy, 'shared.footer.followTitle')}
            </h2>
            <SocialLinks />

            <p className="mt-7 text-base text-brand-fg-secondary">
              <a href={'mailto:' + contactEmail} className="font-medium text-brand-forest hover:text-brand-forest-muted">
                {contactEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-brand-forest/15 pt-7 text-sm text-brand-fg-secondary md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {identity.siteName}</p>
          <p>
            Built by{' '}
            <a
              href="https://www.cod3blackagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-forest hover:text-brand-forest-muted"
            >
              Cod3 Black Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
