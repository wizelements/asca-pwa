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
}

export default function GetInvolved() {
  const [settings, setSettings] = useState<Settings>({});
  const [activeTab, setActiveTab] = useState<'contact' | 'membership' | 'volunteer'>('contact');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch settings client-side
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

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
      <Header settings={settings} />
      <main>
        <Hero
          image="/images/hero/involved.svg"
          title="Get Involved"
          subtitle="Join the ASCA community"
        />

        <section className="py-20 bg-white">
          <div className="container max-w-2xl">
            <div className="flex gap-4 mb-8 border-b">
              {(['contact', 'membership', 'volunteer'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-b-2'
                      : 'text-gray-600'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab ? 'var(--color-accent)' : 'transparent',
                    color: activeTab === tab ? 'var(--color-primary)' : undefined,
                  }}
                >
                  {tab === 'contact' ? 'Contact Us' : tab === 'membership' ? 'Join' : 'Volunteer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div
                  className={`p-4 rounded text-center ${
                    message.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Contact Form */}
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

              {/* Membership Form */}
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
                    <label htmlFor="role" className="block font-semibold mb-2">
                      What best describes you?
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Volunteer Form */}
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
      <Footer settings={settings} />
    </>
  );
}
