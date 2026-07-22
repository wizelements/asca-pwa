interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ currentPage, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-md bg-admin-bg-subtle px-4 py-2 text-sm font-medium text-admin-fg-primary hover:bg-admin-border-subtle disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-admin-fg-secondary">Page {currentPage} of {totalPages}</span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-md bg-admin-bg-subtle px-4 py-2 text-sm font-medium text-admin-fg-primary hover:bg-admin-border-subtle disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
