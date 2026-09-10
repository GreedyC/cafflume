"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { settingsCopy } from "@/lib/i18n-settings";

type Status = "idle" | "loading" | "success" | "error";

export function PasswordForm({locale}:{locale:Locale}) {
  const c=settingsCopy[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          password: formData.get("password"),
          passwordConfirmation: formData.get("passwordConfirmation")
        })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? c.failed);
        return;
      }
      formRef.current?.reset();
      setStatus("success");
      setMessage(c.success);
    } catch {
      setStatus("error");
      setMessage(c.connection);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label htmlFor="currentPassword" className="text-sm font-semibold">
          {c.current}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className="field-control mt-2"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="newPassword" className="text-sm font-semibold">
            {c.newPassword}
          </label>
          <input
            id="newPassword"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            className="field-control mt-2"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirmation" className="text-sm font-semibold">
            {c.confirm}
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            className="field-control mt-2"
          />
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-[var(--ink-muted)]">
        <ShieldCheck className="mt-0.5 shrink-0 text-[var(--moss)]" size={15} />
        {c.passwordHint}
      </p>
      {message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={
            status === "error"
              ? "rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
              : "rounded-xl bg-[var(--moss-soft)] px-4 py-3 text-sm font-semibold text-[var(--moss)]"
          }
        >
          {message}
        </p>
      )}
      <Button type="submit" disabled={status === "loading"}>
        <KeyRound aria-hidden="true" size={16} />
        {status === "loading" ? c.updating : c.changeButton}
      </Button>
    </form>
  );
}
