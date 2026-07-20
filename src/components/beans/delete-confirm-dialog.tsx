"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";

type DeleteConfirmDialogProps = {
  open: boolean;
  beanName: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmDialog({
  open,
  beanName,
  busy,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const busyRef = useRef(busy);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    busyRef.current = busy;
    onCancelRef.current = onCancel;
  }, [busy, onCancel]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => cancelRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        onCancelRef.current();
      }
      if (event.key !== "Tab") return;
      const dialog = cancelRef.current?.closest('[role="dialog"]');
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      if (previousFocus.current?.isConnected) {
        previousFocus.current.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-2xl"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--danger)]">
          Geri alınamaz işlem
        </p>
        <h2 id={titleId} className="display-title mt-2 text-3xl font-semibold">
          Paketi sil?
        </h2>
        <p
          id={descriptionId}
          className="mt-4 text-sm leading-6 text-[var(--ink-muted)]"
        >
          <strong className="text-[var(--ink)]">{beanName}</strong> ve bu pakete
          bağlı tüm demleme kayıtları kalıcı olarak silinecek.
        </p>
        <div className="mt-7 flex justify-end gap-2">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Siliniyor…" : "Kalıcı olarak sil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
