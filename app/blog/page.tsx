import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Blog() {
  const data = null;

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
            <div className="text-center py-12 text-gray-600">
              No blog posts yet. Check back soon!
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
