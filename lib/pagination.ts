export type PageItem = number | 'ellipsis';

export function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 0) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = new Set([1, totalPages, current - 1, current, current + 1]);
  const visiblePages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  for (const page of visiblePages) {
    const previous = items.at(-1);
    if (typeof previous === 'number' && page - previous > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  }

  return items;
}
