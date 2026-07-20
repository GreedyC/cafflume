export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-[60vh] place-items-center"
    >
      <div className="flex flex-col items-center gap-5">
        <span
          aria-hidden="true"
          className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-[var(--surface-inverse)] font-display text-2xl font-semibold text-white"
        >
          B
        </span>
        <div className="text-center">
          <p className="display-title text-2xl font-semibold">
            Günlük açılıyor
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Kayıtlar hazırlanıyor…
          </p>
        </div>
      </div>
    </div>
  );
}
