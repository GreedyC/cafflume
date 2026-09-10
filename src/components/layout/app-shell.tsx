"use client";

import { Navbar } from "@/components/layout/navbar";
import type { AuthenticatedUser } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";

export function AppShell({
  children,
  user,
  locale
}: {
  children: React.ReactNode;
  user: AuthenticatedUser;
  locale: Locale;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-[var(--surface-inverse)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <div className="app-ambient" aria-hidden="true" />
      <div className="relative min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
        <Navbar user={user} locale={locale} />
        <main
          id="main-content"
          className="mx-auto flex min-h-screen w-full max-w-[1520px] flex-col px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-9 lg:pb-14 lg:pt-9 xl:px-12"
        >
          {children}
        </main>
      </div>
    </>
  );
}
