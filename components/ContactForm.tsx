'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', data: form }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="c-first" className="input-label">First Name</label>
        <input
          id="c-first"
          type="text"
          value={form.firstName}
          onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          required
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="c-last" className="input-label">Last Name</label>
        <input
          id="c-last"
          type="text"
          value={form.lastName}
          onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          required
          className="input-field"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-email" className="input-label">Email</label>
        <input
          id="c-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
          className="input-field"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-subject" className="input-label">Subject</label>
        <input
          id="c-subject"
          type="text"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          required
          className="input-field"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="input-label">Message</label>
        <textarea
          id="c-message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          required
          className="input-field"
        />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'loading'} className="btn-primary">
          {status === 'loading' ? 'Sending…' : 'Send Message'}
        </button>
      </div>
      {status === 'success' && (
        <p className="text-sm text-brand-forest sm:col-span-2">
          Thank you! We will be in touch soon.
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-brand-danger sm:col-span-2">
          Something went wrong. Please try again or email info@atlantasaddleclub.com.
        </p>
      )}
    </form>
  );
}
