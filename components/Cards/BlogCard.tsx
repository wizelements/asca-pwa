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
    <article className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        {category && (
          <span
            className="text-xs font-bold px-2 py-1 rounded inline-block"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
            }}
          >
            {category}
          </span>
        )}
        <h3 className="text-xl font-bold mt-3 mb-2" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          By {author} • {date}
        </p>
        <p className="text-gray-700 mb-4 text-sm">{excerpt}</p>
        <a
          href={link}
          className="text-blue-600 font-semibold hover:underline"
        >
          Read More →
        </a>
      </div>
    </article>
  );
}
