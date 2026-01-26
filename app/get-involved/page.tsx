'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useForm } from 'react-hook-form';
import { saveToIndexedDB } from '@/lib/utils';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  experience?: string;
  how_heard?: string;
}

export default function GetInvolved() {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const selectedRoles = watch('roles');

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'membership',
          data,
          submittedOffline: !isOnline,
        }),
      });

      if (!response.ok && !isOnline) {
        // Save offline for sync later
        await saveToIndexedDB('form_submissions', {
          formType: 'membership',
          data,
          submittedOffline: true,
          timestamp: new Date(),
        });
      }

      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      // Network error - save offline
      if (!isOnline) {
        await saveToIndexedDB('form_submissions', {
          formType: 'membership',
          data,
          submittedOffline: true,
          timestamp: new Date(),
        });
        setSubmitted(true);
        reset();
      } else {
        setError('Failed to submit form. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* Form Section */}
        <section className="py-20 bg-neutral">
          <div className="container max-w-2xl">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-2 text-primary">Membership Application</h2>
              <p className="text-gray-600 mb-6">
                Tell us a bit about yourself and how you'd like to be involved with ASCA.
              </p>

              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
                  {isOnline
                    ? '✓ Application submitted successfully! We'll be in touch soon.'
                    : '✓ Application saved offline. It will be sent when you reconnect to the internet.'}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Info */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    First Name *
                  </label>
                  <input
                    {...register('firstName', { required: true })}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName', { required: true })}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email', { required: true })}
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Phone
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Roles */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-4">
                    I'm interested in *
                  </label>
                  <div className="space-y-2">
                    {['rider', 'volunteer', 'instructor'].map((role) => (
                      <label key={role} className="flex items-center gap-2">
                        <input
                          {...register('roles')}
                          type="checkbox"
                          value={role}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Riding Experience
                  </label>
                  <select
                    {...register('experience')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* How Heard */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    {...register('how_heard')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select an option</option>
                    <option value="word_of_mouth">Word of Mouth</option>
                    <option value="social_media">Social Media</option>
                    <option value="website">Website</option>
                    <option value="event">At an Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-accent px-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                ✓ This form works offline. Your application will be saved locally and sent
                automatically when you reconnect to the internet.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
