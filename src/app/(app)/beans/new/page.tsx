import Link from "next/link";
import { BeanForm } from "@/components/forms/bean-form";
import { requirePageUser } from "@/lib/auth";

export default async function NewBeanPage() {
  await requirePageUser();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-7">
      <header className="journal-rule pb-6">
        <Link
          href="/beans"
          className="text-xs font-bold text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          ← Beans
        </Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          New package
        </p>
        <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
          Add coffee to your library
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
          Record the package details. The roast date powers freshness guidance.
        </p>
      </header>
      <BeanForm />
    </div>
  );
}
