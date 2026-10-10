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
    <footer className="border-t border-brand-border-subtle bg-brand-bg-elevated">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Contact Form */}
          <section id="contact" className="scroll-mt-24 md:col-span-2">
            <h2 className="mb-2 text-lg font-bold font-display text-brand-fg-primary">{siteText(copy, 'shared.footer.contactTitle')}</h2>
            <p className="mb-6 text-sm text-brand-fg-secondary">
              {siteText(copy, 'shared.footer.contactBody')}
            </p>
            <ContactForm fallbackEmail={contactEmail} />
          </section>

          {/* Quick Links + Social */}
          <div>
            <h2 className="mb-6 text-lg font-bold font-display text-brand-fg-primary">{siteText(copy, 'shared.footer.quickLinksTitle')}</h2>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-fg-secondary transition-colors hover:text-brand-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-8 mb-4 text-lg font-bold font-display text-brand-fg-primary">{siteText(copy, 'shared.footer.followTitle')}</h2>
            <SocialLinks />

            <p className="mt-6 text-sm text-brand-fg-secondary">
              <a href={`mailto:${contactEmail}`} className="hover:text-brand-forest">
                {contactEmail}
              </a>
            </p>

            <div className="mt-8">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-forest p-2 shadow-sm">
                <ManagedImage
                  src={logoSrc}
                  alt={`${identity.siteName} logo`}
                  width={80}
                  height={66}
                  className="h-full w-auto"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-brand-border-subtle pt-6 text-sm text-brand-fg-muted md:flex-row md:items-center md:justify-between">
          <p className="uppercase tracking-[0.24em]">© {new Date().getFullYear()} {identity.siteName}</p>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-fg-secondary">
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
