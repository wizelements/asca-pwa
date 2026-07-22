import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  query?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, baseUrl, query = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const search = new URLSearchParams(query);
  const href = (page: number) => {
    const s = new URLSearchParams(search);
    if (page > 1) s.set('page', String(page));
    else s.delete('page');
    const qs = s.toString();
    return `${baseUrl}${qs ? `?${qs}` : ''}`;
  };

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={href(currentPage - 1)}
        className={`rounded-md px-4 py-2 text-sm font-medium ${currentPage <= 1 ? 'pointer-events-none bg-brand-bg-elevated text-brand-fg-muted' : 'bg-brand-forest text-white hover:bg-brand-forest/90'}`}
        aria-disabled={currentPage <= 1}
      >
        Previous
      </Link>
      <span className="text-sm text-brand-fg-secondary">
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={href(currentPage + 1)}
        className={`rounded-md px-4 py-2 text-sm font-medium ${currentPage >= totalPages ? 'pointer-events-none bg-brand-bg-elevated text-brand-fg-muted' : 'bg-brand-forest text-white hover:bg-brand-forest/90'}`}
        aria-disabled={currentPage >= totalPages}
      >
        Next
      </Link>
    </nav>
  );
}
