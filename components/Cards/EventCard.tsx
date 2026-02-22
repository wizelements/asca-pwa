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
        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover"
        />
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
