'use client';

import { FormEvent, useState } from 'react';
import { getPageItems } from '@/lib/pagination';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ currentPage, totalPages, onPageChange }: AdminPaginationProps) {
  const [jumpPage, setJumpPage] = useState(String(currentPage));

  if (totalPages <= 1) return null;

  const handleJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestedPage = Number.parseInt(jumpPage, 10);
    const page = Number.isNaN(requestedPage)
      ? currentPage
      : Math.min(Math.max(requestedPage, 1), totalPages);
    setJumpPage(String(page));
    onPageChange(page);
  };

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Go to previous page"
        className="rounded-md bg-admin-bg-subtle px-4 py-2 text-sm font-medium text-admin-fg-primary hover:bg-admin-border-subtle disabled:opacity-40"
      >
        Previous
      </button>
      {getPageItems(currentPage, totalPages).map((item, index) => item === 'ellipsis' ? (
        <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-admin-fg-secondary">…</span>
      ) : (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          aria-label={`Go to page ${item}`}
          aria-current={item === currentPage ? 'page' : undefined}
          className={`min-w-10 rounded-md px-3 py-2 text-sm font-medium ${item === currentPage ? 'bg-admin-fg-primary text-admin-bg-subtle' : 'bg-admin-bg-subtle text-admin-fg-primary hover:bg-admin-border-subtle'}`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Go to next page"
        className="rounded-md bg-admin-bg-subtle px-4 py-2 text-sm font-medium text-admin-fg-primary hover:bg-admin-border-subtle disabled:opacity-40"
      >
        Next
      </button>
      {totalPages > 7 && (
        <form onSubmit={handleJump} noValidate className="ml-2 flex items-center gap-2">
          <label htmlFor="admin-pagination-jump" className="text-sm text-admin-fg-secondary">Page</label>
          <input
            id="admin-pagination-jump"
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(event) => setJumpPage(event.target.value)}
            className="w-16 rounded-md border border-admin-border-subtle bg-admin-bg-subtle px-2 py-2 text-sm text-admin-fg-primary"
          />
          <button type="submit" className="rounded-md bg-admin-bg-subtle px-3 py-2 text-sm font-medium text-admin-fg-primary hover:bg-admin-border-subtle">Go</button>
        </form>
      )}
    </nav>
  );
}
