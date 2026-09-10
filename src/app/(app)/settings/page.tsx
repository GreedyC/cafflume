import Link from "next/link";
import { KeyRound, Moon, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PasswordForm } from "@/components/settings/password-form";
import { requirePageUser } from "@/lib/auth";
import { buttonStyles } from "@/components/ui/button";

export default async function SettingsPage() {
  const user = await requirePageUser();

  return (
    <div className="flex flex-col gap-7">
      <header className="journal-rule pb-6">
        <p className="panel-kicker">Account center</p>
        <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          Manage your account, appearance and workspace security.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <Card className="mesh-card">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <KeyRound size={19} />
            </span>
            <div>
              <p className="panel-kicker">Security</p>
              <h2 className="display-title text-2xl font-semibold">
                Change password
              </h2>
            </div>
          </div>
          <PasswordForm />
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="panel-kicker">Active account</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-inverse)] font-extrabold text-[var(--inverse-ink)]">
                {user.name.slice(0, 1).toLocaleUpperCase("tr-TR")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{user.name}</p>
                <p className="truncate text-xs text-[var(--ink-muted)]">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-xs text-[var(--ink-muted)]">
              <Shield size={15} className="text-[var(--moss)]" />
              {user.role === "ADMIN" ? "Administrator account" : "Workspace member"}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-[var(--accent)]" />
              <div>
                <p className="font-bold">Dark appearance</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
                  The theme control stores your preference on this device.
                </p>
              </div>
            </div>
          </Card>

          {user.role === "ADMIN" && (
            <Card tone="muted">
              <Users size={19} className="text-[var(--accent)]" />
              <h2 className="display-title mt-3 text-xl font-semibold">
                Team management
              </h2>
              <p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">
                Invite users, update roles and revoke access.
              </p>
              <Link
                href="/users"
                className={buttonStyles({ variant: "secondary", className: "mt-5" })}
              >
                Open users
              </Link>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
