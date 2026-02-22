interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  link: string;
  category?: string;
}

export default function BlogCard({
  title,
  excerpt,
  author,
  date,
  image,
  link,
  category,
}: BlogCardProps) {
  return (
    <article className="card overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="h-48 w-full rounded-lg object-cover"
        />
      )}
      <div className="mt-5">
        {category && (
          <span className="inline-flex rounded-full bg-brand-bg-soft px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-fg-secondary">
            {category}
          </span>
        )}
        <h3 className="mt-3 text-xl font-bold text-brand-fg-primary">{title}</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-fg-muted">
          {author} - {date}
        </p>
        <p className="mt-4 text-sm text-brand-fg-secondary">{excerpt}</p>
        <a
          href={link}
          className="mt-5 inline-flex text-xs uppercase tracking-[0.18em] text-brand-forest hover:text-brand-forest-muted"
        >
          Read More
        </a>
      </div>
    </article>
  );
}
