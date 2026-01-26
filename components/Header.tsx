import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-primary text-neutral shadow-lg">
      <nav className="container py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          ASCA
        </Link>
        <ul className="flex gap-8 items-center">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-accent transition-colors">
              About
            </Link>
          </li>
          <li>
            <Link href="/members" className="hover:text-accent transition-colors">
              Members
            </Link>
          </li>
          <li>
            <Link href="/calendar" className="hover:text-accent transition-colors">
              Calendar
            </Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-accent transition-colors">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/donate" className="hover:text-accent transition-colors">
              Donate
            </Link>
          </li>
          <li>
            <Link href="/get-involved" className="btn-accent text-sm">
              Get Involved
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
