"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("brewstack-theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Açık ve koyu tema arasında geçiş yap"
      title="Temayı değiştir"
      className={cn(
        "theme-toggle grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--ink-muted)] outline-none transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className
      )}
    >
      <Sun aria-hidden="true" size={17} className="theme-icon-dark" />
      <Moon aria-hidden="true" size={17} className="theme-icon-light" />
    </button>
  );
}
