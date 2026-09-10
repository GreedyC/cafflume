"use client";

import {
  Check,
  Copy,
  Link2,
  LoaderCircle,
  RefreshCw,
  Shield,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { usersCopy } from "@/lib/i18n-users";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  hasPassword: boolean;
  inviteExpiresAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

type InviteResult = {
  url: string;
  expiresAt: string;
  email: string;
};

function formatDate(value: string | null, locale: Locale, never: string) {
  if (!value) return never;
  return new Intl.DateTimeFormat(locale === "no" ? "nb-NO" : locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function UsersPanel({
  users,
  currentUserId,
  locale
}: {
  users: WorkspaceUser[];
  currentUserId: string;
  locale: Locale;
}) {
  const c = usersCopy[locale];
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [invite, setInvite] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);

  const showError = (error: string) => {
    setMessage(error);
    window.setTimeout(() => setMessage(""), 5_000);
  };

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setMessage("");
    setInvite(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          role: data.get("role")
        })
      });
      const result = (await response.json()) as {
        error?: string;
        inviteUrl?: string;
        inviteExpiresAt?: string;
        user?: { email: string };
      };
      if (!response.ok || !result.inviteUrl || !result.inviteExpiresAt) {
        showError(result.error ?? c.createError);
        return;
      }
      form.reset();
      setInvite({
        url: result.inviteUrl,
        expiresAt: result.inviteExpiresAt,
        email: result.user?.email ?? ""
      });
      router.refresh();
    } catch {
      showError(c.connectionError);
    } finally {
      setCreating(false);
    }
  };

  const updateUser = async (
    id: string,
    update: { role?: "ADMIN" | "MEMBER"; isActive?: boolean }
  ) => {
    setPendingId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update)
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        showError(result.error ?? c.updateError);
        return;
      }
      router.refresh();
    } catch {
      showError(c.connectionError);
    } finally {
      setPendingId(null);
    }
  };

  const renewInvite = async (user: WorkspaceUser) => {
    setPendingId(user.id);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${user.id}/invite`, {
        method: "POST"
      });
      const result = (await response.json()) as {
        error?: string;
        inviteUrl?: string;
        inviteExpiresAt?: string;
      };
      if (!response.ok || !result.inviteUrl || !result.inviteExpiresAt) {
        showError(result.error ?? c.renewError);
        return;
      }
      setInvite({
        url: result.inviteUrl,
        expiresAt: result.inviteExpiresAt,
        email: user.email
      });
      router.refresh();
    } catch {
      showError(c.connectionError);
    } finally {
      setPendingId(null);
    }
  };

  const copyInvite = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)]">
      <div className="space-y-5">
        <Card className="mesh-card">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <UserPlus size={19} />
            </span>
            <div>
              <p className="panel-kicker">{c.newSeat}</p>
              <h2 className="display-title text-2xl font-semibold">
                {c.inviteUser}
              </h2>
            </div>
          </div>
          <form onSubmit={createUser} className="mt-6 space-y-4">
            <div>
              <label htmlFor="member-name" className="text-sm font-semibold">
                {c.name}
              </label>
              <input
                id="member-name"
                name="name"
                required
                maxLength={80}
                className="field-control mt-2"
                placeholder={c.nameExample}
              />
            </div>
            <div>
              <label htmlFor="member-email" className="text-sm font-semibold">
                {c.email}
              </label>
              <input
                id="member-email"
                name="email"
                type="email"
                required
                maxLength={254}
                className="field-control mt-2"
                placeholder="ece@example.com"
              />
            </div>
            <div>
              <label htmlFor="member-role" className="text-sm font-semibold">
                {c.role}
              </label>
              <select
                id="member-role"
                name="role"
                defaultValue="MEMBER"
                className="field-control mt-2"
              >
                <option value="MEMBER">{c.member}</option>
                <option value="ADMIN">{c.admin}</option>
              </select>
            </div>
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <UserPlus size={16} />
              )}
              {creating ? c.creating : c.createLink}
            </Button>
          </form>
        </Card>

        {invite && (
          <Card tone="muted" className="border-[var(--accent)]">
            <Link2 className="text-[var(--accent)]" size={20} />
            <h3 className="mt-3 font-bold">{c.inviteReady}</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
              {invite.email} · {c.inviteHint}
            </p>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
              <p className="break-all text-xs text-[var(--ink-muted)]">
                {invite.url}
              </p>
            </div>
            <button
              type="button"
              onClick={copyInvite}
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-bold outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? c.copied : c.copy}
            </button>
            <p className="mt-3 text-[10px] text-[var(--ink-soft)]">
              {c.expires}: {formatDate(invite.expiresAt, locale, c.never)}
            </p>
          </Card>
        )}
      </div>

      <Card className="min-w-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="panel-kicker">{c.matrix}</p>
            <h2 className="display-title mt-1 text-2xl font-semibold">
              {c.members}
            </h2>
          </div>
          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold">
            {users.length} {users.length === 1 ? c.account : c.accounts}
          </span>
        </div>

        {message && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
          >
            {message}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {users.map((user) => {
            const pending = pendingId === user.id;
            return (
              <article
                key={user.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface-inverse)] text-sm font-extrabold text-[var(--inverse-ink)]">
                    {user.name.slice(0, 1).toLocaleUpperCase(locale === "no" ? "nb-NO" : locale)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{user.name}</h3>
                      {user.id === currentUserId && (
                        <span className="rounded-full bg-[var(--moss-soft)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--moss)]">
                          {c.you}
                        </span>
                      )}
                      <span
                        className={
                          user.isActive
                            ? "rounded-full bg-[var(--moss-soft)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--moss)]"
                            : "rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--danger)]"
                        }
                      >
                        {user.isActive ? c.active : c.closed}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--ink-muted)]">
                      {user.email}
                    </p>
                    <p className="mt-2 text-[10px] text-[var(--ink-soft)]">
                      {user.hasPassword
                        ? `${c.lastLogin}: ${formatDate(user.lastLoginAt, locale, c.never)}`
                        : `${c.invitePending} · ${formatDate(user.inviteExpiresAt, locale, c.never)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      {user.name} {c.roleLabel}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      disabled={pending}
                      onChange={(event) =>
                        updateUser(user.id, {
                          role: event.target.value as "ADMIN" | "MEMBER"
                        })
                      }
                      className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      <option value="MEMBER">{c.member}</option>
                      <option value="ADMIN">{c.admin}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => renewInvite(user)}
                      disabled={pending || !user.isActive}
                      title={user.hasPassword ? c.passwordInvite : c.renew}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] text-[var(--ink-muted)] outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50"
                    >
                      {pending ? (
                        <LoaderCircle className="animate-spin" size={15} />
                      ) : (
                        <RefreshCw size={15} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateUser(user.id, { isActive: !user.isActive })
                      }
                      disabled={pending || user.id === currentUserId}
                      className={
                        user.isActive
                          ? "min-h-10 rounded-xl border border-[var(--border)] px-3 text-xs font-bold text-[var(--danger)] outline-none transition hover:bg-[var(--danger-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-45"
                          : "min-h-10 rounded-xl border border-[var(--border)] px-3 text-xs font-bold text-[var(--moss)] outline-none transition hover:bg-[var(--moss-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-45"
                      }
                    >
                      {user.isActive ? c.disable : c.enable}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-xs leading-5 text-[var(--ink-muted)]">
          <Shield className="mt-0.5 shrink-0 text-[var(--moss)]" size={15} />
          {c.securityHint}
        </div>
      </Card>
    </div>
  );
}
