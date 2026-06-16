import Link from 'next/link';

const CARDS = [
  {
    title: 'Connect',
    label: 'We are a community of horsemen',
    body: 'Connection is at the heart of everything we do. Through shared experiences with horses, our members build friendships, develop trust, and become part of a supportive community. The unique bond between horse and rider encourages personal growth, confidence, and a deeper understanding of oneself and others.',
    href: '/members',
    cta: 'Meet our community',
  },
  {
    title: 'Learn',
    label: 'Horsemanship for every level',
    body: "Learning never stops when horses are involved. Members gain hands-on knowledge in horsemanship, riding, horse care, safety, trail etiquette, and leadership. Whether you're new to horses or have years of experience, our club provides opportunities to expand your skills, share knowledge, and grow your confidence through education and experience. Every ride, event, and activity offers an opportunity to learn something new.",
    href: '/about',
    cta: 'Learn about ASCA',
  },
  {
    title: 'Give',
    label: 'Serving our community',
    body: 'Our club believes in giving back to the community. Funds raised through our events help us provide educational opportunities, support local initiatives, and create meaningful experiences for both the young and the young at heart. Together, we strive to make a positive impact. We welcome your donations to support our efforts.',
    href: '/support-asca',
    cta: 'Support ASCA',
  },
];

export default function ConnectLearnGiveCards() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
      {CARDS.map((card) => (
        <div key={card.title} className="card flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            {card.label}
          </p>
          <h3 className="mt-4 text-xl font-bold text-brand-fg-primary">{card.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-fg-secondary">{card.body}</p>
          <Link
            href={card.href}
            className="mt-5 inline-flex text-sm font-semibold text-brand-forest hover:text-brand-forest-muted"
          >
            {card.cta} →
          </Link>
        </div>
      ))}
    </div>
  );
}
