import Hero from '@/components/Hero';
import BlogCard from '@/components/Cards/BlogCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme, getBlogPosts } from '@/lib/db/queries';

export default async function Blog() {
  const [settings, theme, posts] = await Promise.all([
    getSettings(),
    getTheme(),
    getBlogPosts(100), // Get all posts
  ]);

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
          --color-neutral: ${theme.colors.neutral};
        }
      `}</style>
      <Header settings={settings} />
      <main>
        <Hero
          image="/images/hero/blog.svg"
          title="Blog"
          subtitle="Stories, tips, and updates from the ASCA community"
        />

        <section className="py-20 bg-white">
          <div className="container">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: any) => (
                  <BlogCard
                    key={post._id.toString()}
                    title={post.title}
                    excerpt={post.excerpt}
                    author={post.author}
                    date={new Date(post.publishedAt).toLocaleDateString()}
                    image={post.image}
                    link={`/blog/${post.slug}`}
                    category={post.category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Blog posts coming soon!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
