import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--canvas)] px-5 py-12">
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />
      <section className="relative w-full max-w-md rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-7 shadow-[var(--shadow-md)] sm:p-9">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface-inverse)] text-white"
            >
              <Activity size={18} />
            </span>
            <span className="display-title text-xl font-semibold text-[var(--ink)]">
              BrewStack
            </span>
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Precision coffee workspace
          </p>
          <h1 className="display-title text-4xl font-semibold text-[var(--ink)]">
            Sign in to BrewStack
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            Continue to your coffees, live brews and cupping sessions.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
