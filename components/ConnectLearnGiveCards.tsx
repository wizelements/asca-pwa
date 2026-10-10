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
    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className="card flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            {card.label}
          </p>
          <h3 className="mt-4 text-xl font-bold text-brand-fg-primary">{card.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-fg-secondary">{card.body}</p>
          {card.href && card.cta && (
            <Link
              href={card.href}
              className="mt-5 inline-flex text-sm font-semibold text-brand-forest hover:text-brand-forest-muted"
            >
              {card.cta} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
