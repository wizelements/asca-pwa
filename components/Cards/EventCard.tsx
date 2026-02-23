import Image from 'next/image';

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  description?: string;
  rsvpLink?: string;
}

export default function EventCard({
  title,
  date,
  time,
  location,
  image,
  description,
  rsvpLink,
}: EventCardProps) {
  return (
    <div className="card overflow-hidden">
      {image && (
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold text-brand-fg-primary">{title}</h3>
        <div className="mb-4 space-y-1 text-sm text-brand-fg-secondary">
          <p>Date: {date} at {time}</p>
          <p>Location: {location}</p>
        </div>
        {description && (
          <p className="mb-4 text-sm text-brand-fg-secondary line-clamp-2">{description}</p>
        )}
        {rsvpLink && (
          <a href={rsvpLink} className="btn-primary inline-flex text-xs">
            RSVP
          </a>
        )}
      </div>
    </div>
  );
}
