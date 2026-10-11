import Link from 'next/link';

import { getCachedSiteContent, siteText } from '@/lib/site-content';

export default async function ConnectLearnGiveCards() {
  const copy = await getCachedSiteContent();
  const cards = [
    {
      title: siteText(copy, 'home.connect.title'),
      label: siteText(copy, 'home.connect.label'),
      body: siteText(copy, 'home.connect.body'),
    },
    {
      title: siteText(copy, 'home.learn.title'),
      label: siteText(copy, 'home.learn.label'),
      body: siteText(copy, 'home.learn.body'),
    },
    {
      title: siteText(copy, 'home.give.title'),
      label: siteText(copy, 'home.give.label'),
      body: siteText(copy, 'home.give.body'),
      href: '/support-asca',
      cta: siteText(copy, 'home.give.cta'),
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="editorial-card flex min-h-[280px] flex-col p-7 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest">
            {card.label}
          </p>
          <div className="mt-5 h-px w-10 bg-brand-accent" aria-hidden="true" />
          <h3 className="mt-6 font-serif text-3xl font-semibold leading-tight text-brand-fg-primary">
            {card.title}
          </h3>
          <p className="mt-4 flex-1 text-base leading-7 text-brand-fg-secondary">{card.body}</p>
          {card.href && card.cta && (
            <Link
              href={card.href}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:text-brand-forest-muted"
            >
              {card.cta}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
