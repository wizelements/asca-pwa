import { DONATION_METHODS } from '@/lib/content/site';

export default function SupportMethods() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {DONATION_METHODS.map((method) => (
        <div key={method.label} className="card text-center">
          <h3 className="text-xl font-bold text-brand-fg-primary">Donate via {method.label}</h3>
          <p className="mt-3 text-lg font-semibold text-brand-forest">{method.handle}</p>
        </div>
      ))}
    </div>
  );
}
