"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-[var(--surface-inverse)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0"
      >
        Ana içeriğe geç
      </a>
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <Navbar />
        <main
          id="main-content"
          className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-10 lg:pb-14 lg:pt-10 xl:px-12"
        >
          {children}
        </main>
      </div>
    </>
  );
}
