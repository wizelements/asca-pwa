import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const upcomingEvents = [];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="hero py-32 bg-gradient-to-r from-primary via-secondary to-primary text-neutral">
          <div className="container text-center">
            <h1 className="text-6xl font-bold mb-4">Atlanta Saddle Club Association</h1>
            <p className="text-3xl mb-8 text-accent">We Ride To Inspire</p>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-neutral/90">
              Join our community of passionate riders, volunteers, and instructors dedicated to promoting equestrian excellence and charitable giving.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/get-involved" className="btn-accent px-8 py-3 text-lg">
                Get Involved
              </Link>
              <Link href="/about" className="btn-primary px-8 py-3 text-lg border-2 border-accent">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-neutral">
          <div className="container">
            <h2 className="text-4xl font-bold mb-4 text-center text-primary">Upcoming Events</h2>
            <p className="text-gray-600 text-center mb-12">
              Join us for our latest events and activities
            </p>
            <div className="text-center py-12 text-gray-600">
              Check back soon for upcoming events!
            </div>
            <div className="text-center">
              <Link href="/calendar" className="btn-primary">
                View All Events
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <h2 className="text-4xl font-bold mb-12 text-center text-primary">Why Join ASCA?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Community',
                  description: 'Connect with fellow riders and equestrian enthusiasts',
                  icon: '👥',
                },
                {
                  title: 'Training',
                  description: 'Access expert instruction and horse care education',
                  icon: '🏇',
                },
                {
                  title: 'Charity',
                  description: 'Make a difference through our community initiatives',
                  icon: '❤️',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-primary">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-secondary text-neutral">
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Ride With Us?</h2>
            <p className="text-lg mb-8 text-neutral/90">
              Learn more about membership or get involved with ASCA today
            </p>
            <Link href="/get-involved" className="btn-accent px-8 py-3 text-lg">
              Join Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
