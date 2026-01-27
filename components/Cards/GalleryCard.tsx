interface GalleryCardProps {
  title: string;
  image: string;
  description?: string;
  category?: string;
}

export default function GalleryCard({
  title,
  image,
  description,
  category,
}: GalleryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        {category && (
          <span className="inline-block text-xs font-semibold text-white rounded px-3 py-1 mb-3"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            {category}
          </span>
        )}
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
}
