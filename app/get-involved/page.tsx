'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import FormInput from '@/components/Forms/FormInput';
import FormTextarea from '@/components/Forms/FormTextarea';
import FormButton from '@/components/Forms/FormButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

interface Settings {
  siteName?: string;
  contactEmail?: string;
  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      neutral?: string;
    };
  };
}

export default function GetInvolved() {
  const [settings, setSettings] = useState<Settings>({});
  const [activeTab, setActiveTab] = useState<'contact' | 'membership' | 'volunteer'>('contact');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  const [heroData, setHeroData] = useState({ image: '/images/hero/involved.jpg', title: 'Get Involved', subtitle: 'Join our equestrian community' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    phone: '',
    role: 'rider',
    experience: 'beginner',
    interests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          data: formData,
        }),
      });

      if (response.ok) {
        setMessage('Thank you! We received your submission and will be in touch soon.');
        setFormData({
          name: '',
          email: '',
          message: '',
          phone: '',
          role: 'rider',
          experience: 'beginner',
          interests: '',
        });
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${settings.theme?.colors?.primary || '#1a1a1a'};
          --color-secondary: ${settings.theme?.colors?.secondary || '#4a4b02'};
          --color-accent: ${settings.theme?.colors?.accent || '#f5d800'};
          --color-neutral: ${settings.theme?.colors?.neutral || '#ffffff'};
        }
      `}</style>
      <Header />
      <main>
        <Hero
          image={heroData.image}
          title={heroData.title}
          subtitle={heroData.subtitle}
        />

        <section className="py-20">
          <div className="container max-w-3xl">
            <div className="mb-10 text-center">
              <p className="section-label">Connect</p>
              <h2 className="section-title">Get Involved With ASCA</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-fg-secondary">
                Send us a note, apply for membership, or volunteer to serve alongside the ASCA community.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 rounded-full border border-brand-border-subtle bg-brand-bg-soft px-3 py-2">
              {(['contact', 'membership', 'volunteer'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                    activeTab === tab
                      ? 'bg-brand-forest text-white'
                      : 'text-brand-fg-secondary hover:text-brand-forest'
                  }`}
                >
                  {tab === 'contact' ? 'Contact Us' : tab === 'membership' ? 'Join' : 'Volunteer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-10 rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated/80 p-8 shadow-sm backdrop-blur">
              {message && (
                <div
                  className={`mb-6 rounded-lg px-4 py-3 text-center text-sm ${
                    message.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              {activeTab === 'contact' && (
                <>
                  <FormInput
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <FormTextarea
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              {activeTab === 'membership' && (
                <>
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <div className="mb-4">
                    <label htmlFor="role" className="input-label">
                      What best describes you?
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="rider">Rider</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="instructor">Instructor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <FormTextarea
                    label="Tell us about your riding experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </>
              )}

              {activeTab === 'volunteer' && (
                <>
                  <FormInput
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <FormTextarea
                    label="What areas are you interested in helping with?"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              <FormButton loading={loading}>
                {activeTab === 'contact'
                  ? 'Send Message'
                  : activeTab === 'membership'
                  ? 'Apply for Membership'
                  : 'Sign Up to Volunteer'}
              </FormButton>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
