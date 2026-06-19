const CATEGORIES = {
  meeting: { label: 'Meeting', dotClass: 'bg-blue-500' },
  ride: { label: 'Trail Ride', dotClass: 'bg-green-500' },
  community: { label: 'Community', dotClass: 'bg-purple-500' },
  fundraiser: { label: 'Fundraiser', dotClass: 'bg-yellow-500' },
  general: { label: 'Event', dotClass: 'bg-gray-500' },
};

export default function EventLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {Object.entries(CATEGORIES).map(([key, cat]) => (
        <span
          key={key}
          className="inline-flex items-center gap-2 rounded-full border border-brand-border-subtle bg-white px-4 py-2 text-sm font-medium text-brand-fg-primary"
        >
          <span className={`h-3 w-3 flex-shrink-0 rounded-full ${cat.dotClass}`} aria-hidden="true" />
          {cat.label}
        </span>
      ))}
    </div>
  );
}
