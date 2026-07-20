"use client";

import { CheckCircle2, KeyRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Davet bağlantısında güvenli token bulunamadı.");
      return;
    }
    setStatus("submitting");
    setMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.get("password"),
          passwordConfirmation: formData.get("passwordConfirmation")
        })
      });
      const result = (await response.json()) as {
        error?: string;
        email?: string;
      };
      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? "Parola belirlenemedi.");
        return;
      }
      window.history.replaceState(null, "", "/set-password");
      setStatus("success");
      setMessage("Parolan hazır. Şimdi hesabınla giriş yapabilirsin.");
      window.setTimeout(() => {
        router.replace(`/login?email=${encodeURIComponent(result.email ?? "")}`);
      }, 1200);
    } catch {
      setStatus("error");
      setMessage("Bağlantı kurulamadı. Lütfen tekrar dene.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-[var(--moss-soft)] p-5 text-[var(--moss)]">
        <CheckCircle2 size={24} />
        <p className="mt-3 font-bold">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="password" className="text-sm font-semibold">
          Yeni parola
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          autoFocus
          className="field-control mt-2"
        />
      </div>
      <div>
        <label htmlFor="passwordConfirmation" className="text-sm font-semibold">
          Parola tekrar
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          className="field-control mt-2"
        />
      </div>
      <p className="text-xs leading-5 text-[var(--ink-muted)]">
        En az 12 karakter kullan. Davet bağlantın tek kullanımlıktır ve 48 saat
        sonra sona erer.
      </p>
      {message && status === "error" && (
        <p
          role="alert"
          className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="accent-sheen inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-wait disabled:opacity-60"
      >
        <KeyRound aria-hidden="true" size={17} />
        {status === "submitting" ? "Kaydediliyor…" : "Parolamı belirle"}
      </button>
    </form>
  );
}
