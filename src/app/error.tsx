"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="text-5xl">☕️</div>
      <h1 className="text-2xl font-semibold text-[var(--brown)]">
        Bir şeyler ters gitti.
      </h1>
      <p className="text-sm text-[var(--ink-muted)]">
        Sayfayı yenileyebilir veya tekrar deneyebilirsin.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--brown)] shadow-soft hover:bg-[var(--accent-2)]"
      >
        Tekrar dene
      </button>
    </div>
  );
}
