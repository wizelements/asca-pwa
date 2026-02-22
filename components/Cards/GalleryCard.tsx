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
    <div className="card overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="h-56 w-full rounded-lg object-cover"
        />
      )}
      <div className="mt-5">
        <h3 className="text-lg font-bold text-brand-fg-primary">{title}</h3>
        {category && (
          <span className="mt-3 inline-flex rounded-full bg-brand-bg-soft px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-fg-secondary">
            {category}
          </span>
        )}
        {description && (
          <p className="mt-4 text-sm text-brand-fg-secondary line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
}
