"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  baseHref: string;
};

export function PaginationBar({
  currentPage,
  totalPages,
  baseHref
}: PaginationBarProps) {
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={prevPage >= 1 ? `${baseHref}?page=${prevPage}` : "#"}
        className={cn(
          "rounded-full border border-[rgba(75,45,23,0.15)] px-4 py-2 text-sm font-semibold transition",
          prevPage < 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-[rgba(209,161,42,0.16)]"
        )}
        aria-disabled={prevPage < 1}
        tabIndex={prevPage < 1 ? -1 : undefined}
      >
        Geri
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseHref}?page=${page}`}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            page === currentPage
              ? "bg-[var(--accent)] text-[var(--brown)]"
              : "border border-[rgba(75,45,23,0.15)] hover:bg-[rgba(209,161,42,0.16)]"
          )}
        >
          {page}
        </Link>
      ))}

      <Link
        href={nextPage <= totalPages ? `${baseHref}?page=${nextPage}` : "#"}
        className={cn(
          "rounded-full border border-[rgba(75,45,23,0.15)] px-4 py-2 text-sm font-semibold transition",
          nextPage > totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-[rgba(209,161,42,0.16)]"
        )}
        aria-disabled={nextPage > totalPages}
        tabIndex={nextPage > totalPages ? -1 : undefined}
      >
        İleri
      </Link>
    </div>
  );
}
