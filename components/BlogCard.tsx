import Link from 'next/link';
import { IBlogPost } from '@/lib/models/BlogPost';
import { formatDate } from '@/lib/utils';

interface BlogCardProps {
  post: IBlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.imageAlt || post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {post.categories.map((cat) => (
            <span key={cat} className="text-xs text-accent font-semibold">
              #{cat}
            </span>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">{post.title}</h2>
        <p className="text-gray-600 text-sm mb-4">
          By {post.author} • {formatDate(post.publishedAt || new Date())}
        </p>
        <p className="text-gray-700 mb-4">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="btn-accent">
          Read More
        </Link>
      </div>
    </article>
  );
}
