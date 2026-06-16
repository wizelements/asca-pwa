'use client';

import { useState } from 'react';

export default function EventUpdatesForm() {
  const [form, setForm] = useState({ name: '', email: '', interest: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'event-updates', data: form }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', interest: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl text-left">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eu-name" className="input-label">Name</label>
          <input
            id="eu-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="eu-email" className="input-label">Email</label>
          <input
            id="eu-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="eu-interest" className="input-label">Interest</label>
          <select
            id="eu-interest"
            value={form.interest}
            onChange={(e) => setForm((p) => ({ ...p, interest: e.target.value }))}
            className="input-field"
          >
            <option value="">Select an interest (optional)</option>
            <option value="Trail rides">Trail rides</option>
            <option value="Meetings">Monthly meetings</option>
            <option value="Community events">Community events</option>
            <option value="Membership">Membership</option>
            <option value="Volunteering">Volunteering</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="eu-message" className="input-label">Message (optional)</label>
          <textarea
            id="eu-message"
            rows={3}
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            className="input-field"
          />
        </div>
      </div>
      <div className="mt-5 text-center">
        <button type="submit" disabled={status === 'loading'} className="btn-primary">
          {status === 'loading' ? 'Submitting…' : 'Submit'}
        </button>
      </div>
      {status === 'success' && (
        <p className="mt-4 text-center text-sm text-brand-forest">
          Thank you! We&apos;ll keep you posted on upcoming ASCA events.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-center text-sm text-brand-danger">
          Something went wrong. Please try again or email info@atlantasaddleclub.com.
        </p>
      )}
    </form>
  );
}
