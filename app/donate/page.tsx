import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Donate() {
  const settings = null;
  const customAmount = '';

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">Support ASCA</h1>
            <p className="text-xl">Your donation helps us continue our mission</p>
          </div>
        </section>

        {/* Donate Section */}
        <section className="py-20 bg-neutral">
          <div className="container max-w-2xl">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-primary">Make a Donation</h2>
              <p className="text-gray-700 mb-8">
                Every donation supports our community programs, events, and charitable initiatives.
                We accept donations via Venmo for easy and secure giving.
              </p>

              <div className="text-center py-12 text-gray-600">
                Donation options coming soon!
              </div>
            </div>
          </div>
        </section>

        {/* Why Donate Section */}
        <section className="py-20 bg-gray-50">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold mb-12 text-center text-primary">Why Your Donation Matters</h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Community Events',
                  desc: 'Funds help us organize and host equestrian events throughout the year',
                },
                {
                  title: 'Training Programs',
                  desc: 'Support scholarships and training opportunities for our members',
                },
                {
                  title: 'Charitable Initiatives',
                  desc: 'Donations enable us to give back to local charities and causes',
                },
                {
                  title: 'Facility Improvements',
                  desc: 'Help us maintain and improve our equestrian facilities',
                },
              ].map((reason) => (
                <div key={reason.title} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-primary mb-2">{reason.title}</h3>
                  <p className="text-gray-700">{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
