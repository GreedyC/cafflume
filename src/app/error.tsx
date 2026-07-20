"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="grid min-h-[60vh] place-items-center text-center"
    >
      <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-md)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--danger)]">
          Kayıt açılamadı
        </p>
        <h1 className="display-title mt-3 text-3xl font-semibold">
          Bir şeyler yolunda gitmedi.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
          Bağlantıyı kontrol edip yeniden deneyebilirsin. Mevcut kayıtlarına
          dokunulmadı.
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          Yeniden dene
        </Button>
      </div>
    </div>
  );
}
