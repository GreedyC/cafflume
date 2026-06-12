export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[rgba(209,161,42,0.3)] border-t-[var(--accent)]" />
      <p className="text-sm text-[var(--ink-muted)]">Yükleniyor...</p>
    </div>
  );
}
