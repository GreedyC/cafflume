import Link from "next/link";
import { Bean } from "lucide-react";
import { SetPasswordForm } from "./set-password-form";

export const dynamic = "force-dynamic";

export default function SetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="app-ambient" aria-hidden="true" />
      <section className="relative w-full max-w-md rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-glass)] p-7 shadow-[var(--shadow-md)] backdrop-blur-xl sm:p-9">
        <Link href="/login" className="mb-7 inline-flex items-center gap-3">
          <span className="brand-mark grid h-10 w-10 place-items-center rounded-xl text-white">
            <Bean aria-hidden="true" size={19} />
          </span>
          <span className="display-title text-xl font-semibold">BrewStack</span>
        </Link>
        <p className="panel-kicker">Çalışma alanı daveti</p>
        <h1 className="display-title mt-2 text-4xl font-semibold">
          Parolanı belirle
        </h1>
        <p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          Kahve laboratuvarına katılmak için yalnızca senin bileceğin güçlü bir
          parola oluştur.
        </p>
        <SetPasswordForm />
      </section>
    </main>
  );
}
