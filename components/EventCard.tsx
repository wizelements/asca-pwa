import Link from 'next/link';
import Image from 'next/image';
import { IEvent } from '@/lib/models/Event';
import { formatDate } from '@/lib/utils';

interface EventCardProps {
  event: IEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={event.imageUrl}
            alt={event.imageAlt || event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
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
