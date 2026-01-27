/**
 * Footer Component - ASCA PWA
 */

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Atlanta Saddle Club Association</p>
          <p>
            Built by{' '}
            <a
              href="https://www.cod3blackagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-gold font-semibold"
            >
              Cod3 Black Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
