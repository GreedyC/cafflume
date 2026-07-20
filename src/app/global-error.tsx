"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
          <div aria-hidden="true" className="text-5xl">☕️</div>
          <h1 className="display-title text-3xl font-semibold">
            Bir şeyler ters gitti.
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Sayfayı yenileyebilir veya tekrar deneyebilirsin.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
