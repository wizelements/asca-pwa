import Link from 'next/link';
import { IEvent } from '@/lib/models/Event';
import { formatDate } from '@/lib/utils';

interface EventCardProps {
  event: IEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.imageAlt}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-primary">{event.title}</h3>
        <p className="text-gray-600 mb-4">{event.description.slice(0, 100)}...</p>
        <div className="space-y-2 mb-4 text-sm text-gray-700">
          <p>📅 {formatDate(event.date)}</p>
          <p>📍 {event.location}</p>
          {event.capacity && <p>👥 {event.rsvpList.length} / {event.capacity} registered</p>}
        </div>
        <Link
          href={`/calendar/${event._id}`}
          className="btn-accent w-full text-center"
        >
          View & RSVP
        </Link>
      </div>
    </div>
  );
}
