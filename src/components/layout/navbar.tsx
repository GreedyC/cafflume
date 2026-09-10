"use client";

import Link from "next/link";
import {
  Bean,
  Coffee,
  ClipboardCheck,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Users
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AuthenticatedUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { localeNames, locales, translator, type Locale } from "@/lib/i18n";

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ user, locale }: { user: AuthenticatedUser; locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = translator(locale);
  const [logoutPending, setLogoutPending] = useState(false);
  const [localePending, setLocalePending] = useState(false);
  const primaryLinks = [
    { href: "/", label: t("overview"), shortLabel: t("overview"), icon: LayoutDashboard },
    { href: "/beans", label: t("beans"), shortLabel: t("beans"), icon: Bean },
    { href: "/brews", label: t("brews"), shortLabel: t("brews"), icon: Coffee },
    { href: "/cuppings", label: t("cupping"), shortLabel: t("cupping"), icon: ClipboardCheck },
    { href: "/play", label: t("play"), shortLabel: t("play"), icon: Gamepad2 }
  ];
  const accountLinks = [
    ...(user.role === "ADMIN"
      ? [{ href: "/users", label: t("team"), shortLabel: t("team"), icon: Users }]
      : []),
    { href: "/settings", label: t("settings"), shortLabel: t("settings"), icon: Settings }
  ];

  const changeLocale = async (nextLocale: Locale) => {
    setLocalePending(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale })
      });
      router.refresh();
    } finally {
      setLocalePending(false);
    }
  };

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

  const renderLink = (link: (typeof primaryLinks)[number]) => {
    const active = isCurrent(pathname, link.href);
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex min-h-12 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          active
            ? "bg-[var(--nav-active)] text-[var(--nav-active-ink)] shadow-[var(--shadow-sm)]"
            : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        )}
      >
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-xl transition",
            active
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface-elevated)] text-[var(--ink-soft)] group-hover:text-[var(--accent)]"
          )}
        >
          <Icon aria-hidden="true" size={16} strokeWidth={2.2} />
        </span>
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <aside className="sidebar-surface sticky top-0 hidden h-screen border-r border-[var(--border)] px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3 rounded-2xl">
            <span
              aria-hidden="true"
              className="brand-mark grid h-11 w-11 place-items-center rounded-2xl text-white shadow-[var(--shadow-md)] transition group-hover:-rotate-3"
            >
              <Bean size={21} strokeWidth={2.4} />
            </span>
            <span><span className="brand-name block">BrewStack</span><span className="brand-caption block">Measure · brew · learn</span></span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-9">
          <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Workspace
          </p>
          <nav aria-label="Primary navigation" className="mt-2 flex flex-col gap-1">
            {primaryLinks.map(renderLink)}
          </nav>
        </div>

        <div className="mt-7">
          <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Account
          </p>
          <nav aria-label="Account navigation" className="mt-2 flex flex-col gap-1">
            {accountLinks.map(renderLink)}
          </nav>
        </div>

        <Link
          href="/brews/new"
          className="accent-sheen mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        >
          <Sparkles aria-hidden="true" size={16} />
          {t("newBrew")}
        </Link>

        <div className="mt-auto rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface-inverse)] text-sm font-extrabold text-[var(--inverse-ink)]">
              {user.name.slice(0, 1).toLocaleUpperCase("tr-TR")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-[10px] text-[var(--ink-muted)]">
                {user.role === "ADMIN" ? "Admin" : "Member"} · {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutPending}
              aria-label={t("logout")}
              title={t("logout")}
              className="grid h-9 w-9 place-items-center rounded-xl text-[var(--ink-muted)] outline-none transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="sidebar-surface sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="brand-mark grid h-9 w-9 place-items-center rounded-xl text-white"
          >
            <Bean size={18} />
          </span>
          <span className="brand-name text-xl">BrewStack</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/brews/new"
            className="accent-sheen inline-flex min-h-10 items-center rounded-xl px-3.5 text-xs font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            + {t("newBrew")}
          </Link>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="mobile-dock fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-xl border border-[var(--dock-border)] p-1.5 shadow-2xl lg:hidden"
      >
        {[...primaryLinks.filter((link) => link.href !== "/play"), accountLinks.at(-1)!].map((link) => {
          const active = isCurrent(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
                active
                  ? "bg-[var(--dock-active)] text-[var(--ink)]"
                  : "text-[var(--dock-ink)] hover:text-white"
              )}
            >
              <Icon aria-hidden="true" size={16} />
              {link.shortLabel}
            </Link>
          );
        })}
      </nav>

      <label className="language-switcher" title={t("language")}>
        <span className="sr-only">{t("language")}</span>
        <select value={locale} disabled={localePending} onChange={(event) => changeLocale(event.target.value as Locale)}>
          {locales.map((item) => <option key={item} value={item}>{item.toUpperCase()} · {localeNames[item]}</option>)}
        </select>
      </label>
    </>
  );
}
