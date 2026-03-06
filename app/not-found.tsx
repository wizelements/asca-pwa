import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="container max-w-2xl text-center">
          <Image
            src="/images/asca/logo.png"
            alt="ASCA Logo"
            width={120}
            height={99}
            className="mx-auto mb-8 opacity-60"
          />
          <h1 className="text-6xl font-bold font-display text-brand-fg-primary mb-4">404</h1>
          <p className="text-xl text-brand-fg-secondary mb-2">Page Not Found</p>
          <p className="text-sm text-brand-fg-muted mb-8">
            The trail you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
            <Link href="/get-involved" className="btn-accent">
              Get Involved
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
