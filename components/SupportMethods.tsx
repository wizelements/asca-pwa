'use client';

import { useEffect, useState } from 'react';
import { DONATION_METHODS } from '@/lib/content/site';

interface DonationMethod {
  label: string;
  handle: string;
}

export default function SupportMethods() {
  const [methods, setMethods] = useState<DonationMethod[]>(DONATION_METHODS);

  useEffect(() => {
    let mounted = true;
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (!mounted || !settings) return;
        const next = [...DONATION_METHODS];
        if (settings.cashApp) {
          const cashAppIndex = next.findIndex((method) => method.label === 'Cash App');
          if (cashAppIndex >= 0) next[cashAppIndex] = { label: 'Cash App', handle: settings.cashApp };
        }
        if (settings.venmo?.zelle) {
          const zelleIndex = next.findIndex((method) => method.label === 'Zelle');
          if (zelleIndex >= 0) next[zelleIndex] = { label: 'Zelle', handle: settings.venmo.zelle };
        }
        setMethods(next);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {methods.map((method) => (
        <article key={method.label} className="editorial-card p-7 text-left md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest">
            Direct Giving
          </p>
          <h3 className="mt-5 font-serif text-3xl font-semibold text-brand-fg-primary">
            {method.label}
          </h3>
          <div className="mt-5 h-px w-10 bg-brand-accent" aria-hidden="true" />
          <p className="mt-5 break-words text-base font-semibold tracking-wide text-brand-forest">{method.handle}</p>
        </article>
      ))}
    </div>
  );
}
