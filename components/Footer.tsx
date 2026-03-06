'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Meet ASCA' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/blog', label: 'Blog' },
  { href: '/donate', label: 'Donate' },
];

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactMsg, setContactMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMsg('Thank you for subscribing!');
    setNewsletterEmail('');
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', data: contactForm }),
      });
      if (res.ok) {
        setContactMsg('Thank you! We will be in touch soon.');
        setContactForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        setContactMsg('Something went wrong. Please try again.');
      }
    } catch {
      setContactMsg('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-brand-border-subtle bg-brand-bg-body">
      {/* Newsletter */}
      <div className="bg-brand-forest text-white py-12">
        <div className="container max-w-2xl text-center">
          <h3 className="text-xl font-bold font-display">Subscribe to our newsletter</h3>
          <p className="mt-2 text-sm text-amber-100">Stay updated with ASCA events, news, and community stories.</p>
          <form onSubmit={handleNewsletter} className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1 rounded-full px-5 py-3 text-sm text-brand-fg-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <button type="submit" className="btn-accent whitespace-nowrap">
              Subscribe
            </button>
          </form>
          {newsletterMsg && <p className="mt-3 text-sm text-brand-accent">{newsletterMsg}</p>}
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Contact Form */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold font-display text-brand-fg-primary mb-6">Contact Us</h3>
            <form onSubmit={handleContact} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows={4}
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {contactMsg && (
                <p className={`sm:col-span-2 text-sm ${contactMsg.includes('Thank') ? 'text-green-600' : 'text-red-600'}`}>
                  {contactMsg}
                </p>
              )}
            </form>
          </div>

          {/* Quick Links + Social */}
          <div>
            <h3 className="text-lg font-bold font-display text-brand-fg-primary mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-fg-secondary hover:text-brand-forest transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-bold font-display text-brand-fg-primary mt-8 mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/TheRealASCA" target="_blank" rel="noopener noreferrer" className="text-brand-fg-secondary hover:text-brand-forest transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/therealasca/" target="_blank" rel="noopener noreferrer" className="text-brand-fg-secondary hover:text-brand-forest transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://twitter.com/TheRealASCA" target="_blank" rel="noopener noreferrer" className="text-brand-fg-secondary hover:text-brand-forest transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>

            <div className="mt-8">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-forest p-2 shadow-sm">
                <Image src="/images/asca/logo.png" alt="ASCA Logo" width={80} height={66} className="h-full w-auto" />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-brand-border-subtle pt-6 flex flex-col gap-4 text-sm text-brand-fg-muted md:flex-row md:items-center md:justify-between">
          <p className="uppercase tracking-[0.24em]">© {new Date().getFullYear()} Atlanta Saddle Club Association</p>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-fg-secondary">
            Built by{' '}
            <a
              href="https://www.cod3blackagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-forest hover:text-brand-forest-muted"
            >
              Cod3 Black Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
