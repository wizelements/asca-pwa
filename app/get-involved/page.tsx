import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GetInvolved() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">Get Involved</h1>
            <p className="text-xl">Join our community of riders, volunteers, and instructors</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-neutral">
          <div className="container max-w-2xl">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-3xl font-bold mb-4 text-primary">Membership Coming Soon</h2>
              <p className="text-gray-600 mb-6">
                We're preparing our membership application form. Check back soon to join ASCA.
              </p>
              <p className="text-sm text-gray-500">
                In the meantime, explore our website and learn more about what we do.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
