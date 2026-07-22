'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPageItems } from '@/lib/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  query?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, baseUrl, query = {} }: PaginationProps) {
  const router = useRouter();
  const [jumpPage, setJumpPage] = useState(String(currentPage));

  if (totalPages <= 1) return null;

  const search = new URLSearchParams(query);
  const href = (page: number) => {
    const s = new URLSearchParams(search);
    if (page > 1) s.set('page', String(page));
    else s.delete('page');
    const qs = s.toString();
    return `${baseUrl}${qs ? `?${qs}` : ''}`;
  };

  const handleJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestedPage = Number.parseInt(jumpPage, 10);
    const page = Number.isNaN(requestedPage)
      ? currentPage
      : Math.min(Math.max(requestedPage, 1), totalPages);
    setJumpPage(String(page));
    router.push(href(page));
  };

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={href(currentPage - 1)}
        className={`rounded-md px-4 py-2 text-sm font-medium ${currentPage <= 1 ? 'pointer-events-none bg-brand-bg-elevated text-brand-fg-muted' : 'bg-brand-forest text-white hover:bg-brand-forest/90'}`}
        aria-disabled={currentPage <= 1}
        aria-label="Go to previous page"
      >
        Previous
      </Link>
      {getPageItems(currentPage, totalPages).map((item, index) => item === 'ellipsis' ? (
        <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-brand-fg-secondary">…</span>
      ) : (
        <Link
          key={item}
          href={href(item)}
          aria-label={`Go to page ${item}`}
          aria-current={item === currentPage ? 'page' : undefined}
          className={`min-w-10 rounded-md px-3 py-2 text-center text-sm font-medium ${item === currentPage ? 'bg-brand-forest text-white' : 'bg-brand-bg-elevated text-brand-fg-secondary hover:text-brand-forest'}`}
        >
          {item}
        </Link>
      ))}
      <Link
        href={href(currentPage + 1)}
        className={`rounded-md px-4 py-2 text-sm font-medium ${currentPage >= totalPages ? 'pointer-events-none bg-brand-bg-elevated text-brand-fg-muted' : 'bg-brand-forest text-white hover:bg-brand-forest/90'}`}
        aria-disabled={currentPage >= totalPages}
        aria-label="Go to next page"
      >
        Next
      </Link>
      {totalPages > 7 && (
        <form onSubmit={handleJump} noValidate className="ml-2 flex items-center gap-2">
          <label htmlFor="gallery-pagination-jump" className="text-sm text-brand-fg-secondary">Page</label>
          <input
            id="gallery-pagination-jump"
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(event) => setJumpPage(event.target.value)}
            className="w-16 rounded-md bg-brand-bg-elevated px-2 py-2 text-sm text-brand-fg-secondary"
          />
          <button type="submit" className="rounded-md bg-brand-forest px-3 py-2 text-sm font-medium text-white hover:bg-brand-forest/90">Go</button>
        </form>
      )}
    </nav>
  );
}
