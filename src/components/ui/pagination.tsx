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
  const pageHref = (page: number) =>
    `${baseHref}${baseHref.includes("?") ? "&" : "?"}page=${page}`;
  const visiblePages = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (page) => page >= 1 && page <= totalPages
      )
    )
  ).sort((a, b) => a - b);

  return (
    <nav
      aria-label="Sayfalama"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        href={currentPage > 1 ? pageHref(currentPage - 1) : baseHref}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
        className={cn(
          "inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          currentPage <= 1 && "pointer-events-none opacity-45"
        )}
      >
        Geri
      </Link>
      {visiblePages.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && page - visiblePages[index - 1] > 1 && (
            <span aria-hidden="true" className="px-1 text-[var(--ink-soft)]">
              …
            </span>
          )}
          <Link
            href={pageHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`${page}. sayfa`}
            className={cn(
              "grid h-11 min-w-11 place-items-center rounded-xl border text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              page === currentPage
                ? "border-[var(--surface-inverse)] bg-[var(--surface-inverse)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            )}
          >
            {page}
          </Link>
        </span>
      ))}
      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
        className={cn(
          "inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          currentPage >= totalPages && "pointer-events-none opacity-45"
        )}
      >
        İleri
      </Link>
    </nav>
  );
}
