"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeAppDestination } from "@/lib/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? "Giriş başarısız.");
        return;
      }

      setPassword("");
      router.replace(
        safeAppDestination(searchParams.get("next"), window.location.origin)
      );
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Bağlantı kurulamadı. Lütfen tekrar dene.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-[var(--ink)]"
        >
          Parola
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={1}
          maxLength={256}
          required
          autoFocus
          className="h-12 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      {status === "error" && (
        <p
          role="alert"
          className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-white shadow-[var(--shadow-sm)] outline-none transition hover:bg-[var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "loading" ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
