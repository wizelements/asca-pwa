import Hero from '@/components/Hero';
import BlogCard from '@/components/Cards/BlogCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme, getBlogPosts } from '@/lib/db/queries';

export default async function Blog() {
  const [settings, theme, posts] = await Promise.all([
    getSettings(),
    getTheme(),
    getBlogPosts(100),
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
      <Header />
      <main>
        <Hero
          image={settings.heroes?.blog?.image || '/images/hero/blog.jpg'}
          title={settings.heroes?.blog?.title || 'Blog'}
          subtitle={settings.heroes?.blog?.subtitle || 'Stories, tips, and updates from the ASCA community'}
        />

        <section className="py-20">
          <div className="container">
            <div className="text-center">
              <p className="section-label">Stories</p>
              <h2 className="section-title">Latest From The Club</h2>
            </div>
            {posts.length > 0 ? (
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="mt-12 max-w-3xl mx-auto">
                <BlogCard
                  title="Feeling good with Horses: Benefits of Equine Assisted Therapy"
                  excerpt="Equine-Assisted Therapy (EAT) or equine-assisted learning or, the more well-known horseback riding, can be beneficial for people of all ages in numerous ways. Here's how you can benefit from the healing power of horses."
                  author="Clariece Pinkney"
                  date="2024"
                  image="/images/gallery/blog-member.jpg"
                  link="/blog"
                  category="Wellness"
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
