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
  const isInlineImage = image.startsWith('data:');

  return (
    <article className="media-luxe group relative overflow-hidden bg-brand-bg-elevated">
      {image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {isInlineImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={alt || title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          ) : (
            <Image
              src={image}
              alt={alt || title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/88 via-[#0d1f14]/18 to-transparent" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white">
        {category && (
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-accent">
            {category}
          </p>
        )}
        <h3 className="font-serif text-2xl font-medium leading-tight">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{description}</p>
        )}
      </div>
    </article>
  );
}
