"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

type DeleteConfirmDialogProps = {
  open: boolean;
  beanName: string;
  busy: boolean;
  locale: Locale;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmDialog({
  open,
  beanName,
  busy,
  locale,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  const c={en:["Irreversible action","Delete package?","and every linked brew will be permanently deleted.","Cancel","Deleting…","Delete permanently"],tr:["Geri alınamaz işlem","Paketi sil?","ve bağlı tüm demleme kayıtları kalıcı olarak silinecek.","Vazgeç","Siliniyor…","Kalıcı olarak sil"],es:["Acción irreversible","¿Eliminar paquete?","y todas sus preparaciones vinculadas se eliminarán permanentemente.","Cancelar","Eliminando…","Eliminar permanentemente"],de:["Nicht rückgängig zu machen","Packung löschen?","und alle verknüpften Brühungen werden dauerhaft gelöscht.","Abbrechen","Löschen…","Dauerhaft löschen"],no:["Kan ikke angres","Slette posen?","og alle tilknyttede brygg slettes permanent.","Avbryt","Sletter…","Slett permanent"],ja:["元に戻せない操作","パッケージを削除しますか？","と関連するすべての抽出記録が完全に削除されます。","キャンセル","削除中…","完全に削除"],ko:["되돌릴 수 없는 작업","패키지를 삭제할까요?","및 연결된 모든 추출 기록이 영구적으로 삭제됩니다.","취소","삭제 중…","영구 삭제"]}[locale];
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
          {c[0]}
        </p>
        <h2 id={titleId} className="display-title mt-2 text-3xl font-semibold">
          {c[1]}
        </h2>
        <p
          id={descriptionId}
          className="mt-4 text-sm leading-6 text-[var(--ink-muted)]"
        >
          <strong className="text-[var(--ink)]">{beanName}</strong> {c[2]}
        </p>
        <div className="mt-7 flex justify-end gap-2">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {c[3]}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? c[4] : c[5]}
          </Button>
        </div>
      </div>
    </div>
  );
}
