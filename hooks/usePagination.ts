"use client";

import { useState } from "react";

export function usePagination<T>(items: T[], itemsPerPage: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * itemsPerPage;
  const pageItems = items.slice(start, start + itemsPerPage);

  const goToPage = (next: number) =>
    setPage(Math.min(Math.max(1, next), totalPages));

  return { page: safePage, totalPages, pageItems, goToPage };
}
