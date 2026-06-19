import Image from 'next/image';

interface GalleryCardProps {
  title: string;
  image: string;
  alt?: string;
  description?: string;
  category?: string;
}

export default function GalleryCard({
  title,
  image,
  alt,
  description,
  category,
}: GalleryCardProps) {
  return (
    <div className="card overflow-hidden">
      {image && (
        <div className="relative h-56 w-full">
          <Image
            src={image}
            alt={alt || title}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
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
