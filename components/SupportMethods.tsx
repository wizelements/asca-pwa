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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {methods.map((method) => (
        <div key={method.label} className="card text-center">
          <h3 className="text-xl font-bold text-brand-fg-primary">Donate via {method.label}</h3>
          <p className="mt-3 text-lg font-semibold text-brand-forest">{method.handle}</p>
        </div>
      ))}
    </div>
  );
}
