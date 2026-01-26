'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">About ASCA</h1>
            <p className="text-xl">Our Mission & History</p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-neutral">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold mb-6 text-primary">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We Ride To Inspire. The Atlanta Saddle Club Association is dedicated to promoting
              equestrian excellence, fostering community, and inspiring charitable action through
              our shared passion for horses and horsemanship.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe in creating a welcoming space for riders of all levels, volunteers who
              support our mission, and instructors who share their expertise with our community.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <h2 className="text-4xl font-bold mb-12 text-center text-primary">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { title: 'Excellence', desc: 'Pursuing the highest standards in horsemanship' },
                { title: 'Community', desc: 'Building strong bonds among our members' },
                { title: 'Service', desc: 'Giving back through charitable initiatives' },
                { title: 'Safety', desc: 'Prioritizing the welfare of horses and riders' },
              ].map((value) => (
                <div key={value.title} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-bold text-primary mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History */}
        <section className="py-20 bg-neutral">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold mb-6 text-primary">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Founded in [YEAR], the Atlanta Saddle Club Association has grown into one of the
                region's premier equestrian communities. What started as a small group of passionate
                riders has evolved into a thriving organization with hundreds of members.
              </p>
              <p>
                Over the years, we've hosted countless events, trained countless riders, and
                supported numerous charitable causes in our community. Our commitment to excellence
                and community service remains as strong as ever.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
