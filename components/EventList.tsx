'use client';

import { useEffect, useState } from 'react';

interface AscaEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  imageAlt: string;
  capacity?: number;
  published: boolean;
  category: string;
}

const CATEGORY_STYLES: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  meeting: { label: 'Meeting', dotClass: 'bg-blue-500', badgeClass: 'bg-blue-100 text-blue-800' },
  ride: { label: 'Trail Ride', dotClass: 'bg-green-500', badgeClass: 'bg-green-100 text-green-800' },
  community: { label: 'Community', dotClass: 'bg-purple-500', badgeClass: 'bg-purple-100 text-purple-800' },
  fundraiser: { label: 'Fundraiser', dotClass: 'bg-yellow-500', badgeClass: 'bg-yellow-100 text-yellow-800' },
  general: { label: 'Event', dotClass: 'bg-gray-500', badgeClass: 'bg-gray-100 text-gray-800' },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventList() {
  const [events, setEvents] = useState<AscaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-brand-fg-muted text-center py-8">Loading events...</p>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-brand-bg-subtle rounded-xl">
        <p className="text-brand-fg-secondary">No upcoming events scheduled.</p>
        <p className="text-sm text-brand-fg-muted mt-1">Check back soon for new ASCA events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const cat = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.general;
        return (
          <div
            key={event.id}
            className="card flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex-1">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${cat.badgeClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${cat.dotClass}`} aria-hidden="true" />
                {cat.label}
              </span>
              <h3 className="mt-3 text-lg font-bold text-brand-fg-primary">{event.title}</h3>
              {event.location && (
                <p className="mt-1 text-sm text-brand-fg-secondary">{event.location}</p>
              )}
              {event.description && (
                <p className="mt-2 text-sm text-brand-fg-secondary">{event.description}</p>
              )}
            </div>
            <div className="flex-shrink-0 text-sm font-semibold text-brand-forest sm:text-right">
              {formatDate(event.date)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
