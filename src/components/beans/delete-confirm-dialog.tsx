"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-sm">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Kaydı sil</p>
          <p className="text-sm text-[var(--ink-muted)]">
            <strong>{beanName}</strong> kaydını silmek istediğine emin misin? Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={busy}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              {busy ? "Siliniyor..." : "Sil"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
