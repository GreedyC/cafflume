"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Genel Bakış", shortLabel: "Özet", mark: "01" },
  { href: "/beans", label: "Çekirdekler", shortLabel: "Çekirdek", mark: "02" },
  { href: "/brews", label: "Demlemeler", shortLabel: "Kayıtlar", mark: "03" }
];

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutPending, setLogoutPending] = useState(false);

  const handleLogout = async () => {
    setLogoutPending(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setLogoutPending(false);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutPending(false);
    }
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--border)] bg-[rgba(255,253,248,0.88)] px-5 py-7 backdrop-blur-xl lg:flex lg:flex-col">
        <Link href="/" className="group flex items-center gap-3 rounded-2xl">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface-inverse)] font-display text-xl font-semibold text-white transition group-hover:-rotate-3"
          >
            B
          </span>
          <span>
            <span className="display-title block text-xl font-semibold">
              BrewStack
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Coffee field journal
            </span>
          </span>
        </Link>

        <nav aria-label="Ana menü" className="mt-12 flex flex-col gap-1.5">
          {links.map((link) => {
            const active = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  active
                    ? "bg-[var(--surface-inverse)] text-white shadow-[var(--shadow-md)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-[10px] tabular-nums tracking-wider",
                    active
                      ? "text-[var(--accent-soft)]"
                      : "text-[var(--ink-soft)]"
                  )}
                >
                  {link.mark}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/brews/new"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] outline-none transition hover:bg-[var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        >
          Yeni demleme
        </Link>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutPending}
            className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--ink-muted)] outline-none transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-wait disabled:opacity-60"
          >
            {logoutPending ? "Çıkış yapılıyor…" : "Güvenli çıkış"}
          </button>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Roast lab note
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            İyi fincan tesadüf değildir. Tarifi kaydet, sonucu karşılaştır.
          </p>
          </div>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[rgba(255,253,248,0.92)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--surface-inverse)] font-display text-lg font-semibold text-white"
          >
            B
          </span>
          <span className="display-title text-xl font-semibold">BrewStack</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutPending}
            aria-label="Güvenli çıkış yap"
            className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] px-3 text-xs font-bold text-[var(--ink-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-wait disabled:opacity-60"
          >
            Çıkış
          </button>
          <Link
            href="/brews/new"
            className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            + Demle
          </Link>
        </div>
      </header>

      <nav
        aria-label="Mobil ana menü"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-3 rounded-2xl border border-white/10 bg-[rgba(33,23,19,0.94)] p-1.5 text-white shadow-2xl backdrop-blur-xl lg:hidden"
      >
        {links.map((link) => {
          const active = isCurrent(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
                active
                  ? "bg-white text-[var(--ink)]"
                  : "text-white/65 hover:text-white"
              )}
            >
              <span aria-hidden="true" className="text-[9px] tabular-nums">
                {link.mark}
              </span>
              {link.shortLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
