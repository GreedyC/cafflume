import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--canvas)] px-5 py-12">
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[var(--moss-soft)] opacity-70 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-[var(--accent-soft)] opacity-70 blur-3xl" />
      <section className="relative w-full max-w-md rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-glass)] p-7 shadow-[var(--shadow-md)] backdrop-blur-xl sm:p-9">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-inverse)] text-lg text-white"
            >
              ☕
            </span>
            <span className="display-title text-xl font-semibold text-[var(--ink)]">
              BrewStack
            </span>
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Özel kahve günlüğü
          </p>
          <h1 className="display-title text-4xl font-semibold text-[var(--ink)]">
            BrewStack’e giriş
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            Ortak kahve laboratuvarına güvenli hesabınla gir.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
