'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ISettings } from '@/lib/models/Settings';

export default function Donate() {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    // Fetch settings for Venmo info
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const venmoURL = (amount: string) => {
    if (!settings?.venmoUsername) return '#';
    return `https://venmo.com/${settings.venmoUsername}?txn=pay&amount=${amount}&note=Donation to ASCA`;
  };

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

              {!loading && settings?.venmoUsername ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-primary">Quick Donation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {settings.venmoPresets?.map((preset) => (
                        <a
                          key={preset.label}
                          href={venmoURL(preset.amount.toString())}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary px-4 py-3 text-center"
                        >
                          ${preset.amount}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-primary">Custom Amount</h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <a
                        href={customAmount ? venmoURL(customAmount) : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn-accent px-6 py-2 ${
                          !customAmount ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Donate
                      </a>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Venmo Handle:</strong> @{settings.venmoUsername}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  {loading ? 'Loading donation options...' : 'Donation options not configured yet.'}
                </div>
              )}
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
