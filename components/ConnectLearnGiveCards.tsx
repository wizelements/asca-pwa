import Link from 'next/link';

import { getCachedSiteContent, siteText } from '@/lib/site-content';

export default async function ConnectLearnGiveCards() {
  const copy = await getCachedSiteContent();
  const cards = [
    {
      title: siteText(copy, 'home.connect.title'),
      label: siteText(copy, 'home.connect.label'),
      body: siteText(copy, 'home.connect.body'),
      numeral: 'I',
    },
    {
      title: siteText(copy, 'home.learn.title'),
      label: siteText(copy, 'home.learn.label'),
      body: siteText(copy, 'home.learn.body'),
      numeral: 'II',
    },
    {
      title: siteText(copy, 'home.give.title'),
      label: siteText(copy, 'home.give.label'),
      body: siteText(copy, 'home.give.body'),
      href: '/support-asca',
      cta: siteText(copy, 'home.give.cta'),
      numeral: 'III',
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="editorial-card group flex min-h-[300px] flex-col p-7 transition-all duration-300 md:p-9">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-forest">
              {card.label}
            </p>
            <span className="font-serif text-sm italic text-brand-fg-muted/70" aria-hidden="true">
              {card.numeral}
            </span>
          </div>

          <div className="mt-8 h-px w-12 bg-brand-accent transition-all duration-300 group-hover:w-20" aria-hidden="true" />

          <h3 className="mt-6 font-serif text-3xl font-medium leading-tight text-brand-fg-primary">
            {card.title}
          </h3>
          <p className="mt-4 flex-1 text-sm leading-7 text-brand-fg-secondary">{card.body}</p>

          {card.href && card.cta ? (
            <Link
              href={card.href}
              className="mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-forest hover:text-brand-forest-muted"
            >
              {card.cta}
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          ) : (
            <div className="mt-7 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-fg-muted/75">
              Atlanta Saddle Club Association
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
