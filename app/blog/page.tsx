'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import { IBlogPost } from '@/lib/models/BlogPost';

interface BlogResponse {
  posts: IBlogPost[];
  total: number;
  page: number;
  pages: number;
}

export default function Blog() {
  const [data, setData] = useState<BlogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/blog?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl">Stories, tips, and updates from ASCA</p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-20 bg-neutral">
          <div className="container">
            {loading ? (
              <div className="text-center py-12">Loading posts...</div>
            ) : data && data.posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {data.posts.map((post) => (
                    <BlogCard key={post._id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        page === p
                          ? 'bg-primary text-neutral'
                          : 'bg-gray-200 text-primary hover:bg-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-600">
                No blog posts yet. Check back soon!
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
