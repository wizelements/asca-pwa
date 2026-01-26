import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-neutral py-12 mt-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ASCA</h3>
            <p className="text-neutral/80">We Ride To Inspire</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Navigation</h4>
            <ul className="space-y-2 text-neutral/80">
              <li>
                <Link href="/about" className="hover:text-accent">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-accent">
                  Members
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-accent">
                  Events
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-neutral/80">
              <li>
                <Link href="/blog" className="hover:text-accent">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/get-involved" className="hover:text-accent">
                  Get Involved
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <ul className="space-y-2 text-neutral/80">
              <li>
                <a href="https://facebook.com" className="hover:text-accent">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" className="hover:text-accent">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral/20 pt-8 text-center text-neutral/60">
          <p>&copy; {currentYear} Atlanta Saddle Club Association. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
