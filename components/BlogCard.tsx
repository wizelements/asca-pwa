import Link from 'next/link';
import Image from 'next/image';
import { IBlogPost } from '@/lib/models/BlogPost';
import { formatDate } from '@/lib/utils';

interface BlogCardProps {
  post: IBlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="card overflow-hidden">
      {post.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt || post.title}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="mt-5">
        <div className="flex flex-wrap gap-2">
          {post.categories.map((cat) => (
            <span key={cat} className="rounded-full bg-brand-bg-soft px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-fg-secondary">
              {cat}
            </span>
          ))}
        </div>
        <h2 className="mt-4 text-xl font-bold text-brand-fg-primary">{post.title}</h2>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-fg-muted">
          {post.author} - {formatDate(post.publishedAt || new Date())}
        </p>
        <p className="mt-4 text-sm text-brand-fg-secondary">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex text-xs uppercase tracking-[0.18em] text-brand-forest hover:text-brand-forest-muted">
          Read More
        </Link>
      </div>
    </article>
  );
}
