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
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p>📅 {date} at {time}</p>
          <p>📍 {location}</p>
        </div>
        {description && (
          <p className="text-gray-700 mb-4 text-sm line-clamp-2">{description}</p>
        )}
        {rsvpLink && (
          <a
            href={rsvpLink}
            className="inline-block px-4 py-2 text-white font-bold rounded hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            RSVP
          </a>
        )}
      </div>
    </div>
  );
}
