"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/beans/delete-confirm-dialog";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "@/components/ui/table";
import {
  cn,
  formatDate,
  formatDateTime,
  formatDaysSince,
  formatNumber
} from "@/lib/utils";

type BeanData = {
  id: string;
  roaster: string;
  name: string;
  origin: string;
  variety?: string | null;
  process: string;
  roastDate: Date | string;
  openDate?: Date | string | null;
  isFinished: boolean;
  createdAt: Date | string;
  brewCount: number;
  lastBrew?: {
    id: string;
    rating: number;
    createdAt: Date | string;
  } | null;
};

type BeansTableProps = {
  beans: BeanData[];
};

type StatusFilter = "all" | "active" | "finished";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "active", label: "Aktif" },
  { value: "finished", label: "Biten" }
];

function freshnessFor(bean: BeanData) {
  if (bean.isFinished) return { label: "Arşiv", tone: "default" as const };
  const value = new Date(bean.roastDate);
  const days = Math.max(
    0,
    Math.floor((Date.now() - value.getTime()) / (1000 * 60 * 60 * 24))
  );
  if (days < 5) return { label: "Dinleniyor", tone: "warning" as const };
  if (days <= 30) return { label: "İdeal", tone: "success" as const };
  return { label: "Öncelikli", tone: "danger" as const };
}

export function BeansTable({ beans: initialBeans }: BeansTableProps) {
  const router = useRouter();
  const [beans, setBeans] = useState<BeanData[]>(initialBeans);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeanData | null>(null);

  const counts = useMemo(() => {
    const active = beans.filter((bean) => !bean.isFinished).length;
    return { total: beans.length, active, finished: beans.length - active };
  }, [beans]);

  const filteredBeans = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    return beans.filter((bean) => {
      if (statusFilter === "active" && bean.isFinished) return false;
      if (statusFilter === "finished" && !bean.isFinished) return false;
      if (!term) return true;
      return [
        bean.roaster,
        bean.name,
        bean.origin,
        bean.process,
        bean.variety ?? ""
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(term);
    });
  }, [beans, query, statusFilter]);

  const pushNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  };

  const handleToggleStatus = async (beanId: string, nextStatus: boolean) => {
    setBusyId(beanId);
    try {
      const response = await fetch(`/api/beans/${beanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFinished: nextStatus })
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (response.status === 401) {
          router.replace("/login?next=%2Fbeans");
          return;
        }
        throw new Error(result?.error ?? "İşlem tamamlanamadı.");
      }
      setBeans((current) =>
        current.map((bean) =>
          bean.id === beanId ? { ...bean, isFinished: nextStatus } : bean
        )
      );
      pushNotice(nextStatus ? "Paket arşive alındı." : "Paket yeniden aktif.");
    } catch (error) {
      pushNotice(
        error instanceof Error
          ? error.message
          : "İşlem tamamlanamadı. Lütfen yeniden dene."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (beanId: string) => {
    setBusyId(beanId);
    try {
      const response = await fetch(`/api/beans/${beanId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (response.status === 401) {
          router.replace("/login?next=%2Fbeans");
          return;
        }
        throw new Error(result?.error ?? "Silme işlemi tamamlanamadı.");
      }
      setBeans((current) => current.filter((bean) => bean.id !== beanId));
      setDeleteTarget(null);
      pushNotice("Paket ve ilişkili demlemeler silindi.");
    } catch (error) {
      setDeleteTarget(null);
      pushNotice(
        error instanceof Error
          ? error.message
          : "Silme işlemi tamamlanamadı."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-label="Envanter özeti"
        className="grid grid-cols-3 gap-2 sm:gap-4"
      >
        {[
          { label: "Toplam", value: counts.total },
          { label: "Aktif", value: counts.active },
          { label: "Arşiv", value: counts.finished }
        ].map((item) => (
          <Card key={item.label} className="p-4 sm:p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)] sm:text-[10px]">
              {item.label}
            </p>
            <p className="display-title mt-2 text-3xl font-semibold tabular-nums sm:text-4xl">
              {item.value}
            </p>
          </Card>
        ))}
      </section>

      <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label htmlFor="bean-search" className="sr-only">
            Çekirdeklerde ara
          </label>
          <Input
            id="bean-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kavurucu, çekirdek, menşei veya işlem ara…"
          />
        </div>
        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface-2)] p-1"
          aria-label="Paket durumu"
        >
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "min-h-10 rounded-lg px-3 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                statusFilter === filter.value
                  ? "bg-[var(--surface-inverse)] text-white shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
        <p aria-live="polite">{filteredBeans.length} paket gösteriliyor</p>
        {query && (
          <button
            type="button"
            className="font-bold text-[var(--accent-strong)] underline-offset-4 hover:underline"
            onClick={() => setQuery("")}
          >
            Aramayı temizle
          </button>
        )}
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-inverse)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-md)]"
        >
          {notice}
        </div>
      )}

      {filteredBeans.length === 0 ? (
        <Card className="py-14 text-center">
          <p className="display-title text-2xl font-semibold">
            Bu filtrede paket yok.
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Aramayı temizle veya envantere yeni bir çekirdek ekle.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">
            {filteredBeans.map((bean) => {
              const freshness = freshnessFor(bean);
              return (
                <Card key={bean.id} className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[var(--ink-muted)]">
                        {bean.roaster}
                      </p>
                      <Link
                        href={`/beans/${bean.id}`}
                        className="display-title mt-1 block rounded-md text-2xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        {bean.name}
                      </Link>
                    </div>
                    <Badge tone={freshness.tone}>{freshness.label}</Badge>
                  </div>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {bean.origin} · {bean.process}
                    {bean.variety ? ` · ${bean.variety}` : ""}
                  </p>
                  <div className="grid grid-cols-3 gap-2 border-y border-[var(--border)] py-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        Kavrum
                      </p>
                      <p className="mt-1 text-xs font-bold">
                        {formatDaysSince(bean.roastDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        Kayıt
                      </p>
                      <p className="mt-1 text-xs font-bold tabular-nums">
                        {bean.brewCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        Son puan
                      </p>
                      <p className="mt-1 text-xs font-bold tabular-nums">
                        {bean.lastBrew
                          ? `${formatNumber(bean.lastBrew.rating, 1)}/10`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!bean.isFinished && (
                      <Link
                        href={`/brews/new?bean=${bean.id}`}
                        className={buttonStyles({ size: "sm" })}
                      >
                        Bu çekirdeği demle
                      </Link>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busyId === bean.id}
                      onClick={() =>
                        handleToggleStatus(bean.id, !bean.isFinished)
                      }
                    >
                      {bean.isFinished ? "Aktif et" : "Arşivle"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busyId === bean.id}
                      onClick={() => setDeleteTarget(bean)}
                    >
                      Sil
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Çekirdek</TableHeaderCell>
                  <TableHeaderCell>Profil</TableHeaderCell>
                  <TableHeaderCell>Kavrum</TableHeaderCell>
                  <TableHeaderCell>Kayıt</TableHeaderCell>
                  <TableHeaderCell>Son sonuç</TableHeaderCell>
                  <TableHeaderCell>Durum</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Aksiyon
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filteredBeans.map((bean) => {
                  const freshness = freshnessFor(bean);
                  return (
                    <TableRow key={bean.id}>
                      <TableCell>
                        <Link
                          href={`/beans/${bean.id}`}
                          className="font-bold outline-none underline-offset-4 hover:text-[var(--accent-strong)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        >
                          {bean.name}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--ink-muted)]">
                          {bean.roaster}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p>{bean.origin}</p>
                        <p className="mt-1 text-xs text-[var(--ink-muted)]">
                          {bean.process}
                          {bean.variety ? ` · ${bean.variety}` : ""}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p>{formatDate(bean.roastDate)}</p>
                        <p className="mt-1 text-xs text-[var(--ink-muted)]">
                          {formatDaysSince(bean.roastDate)}
                        </p>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {bean.brewCount}
                      </TableCell>
                      <TableCell>
                        {bean.lastBrew ? (
                          <>
                            <p className="font-bold tabular-nums">
                              {formatNumber(bean.lastBrew.rating, 1)}/10
                            </p>
                            <p className="mt-1 text-xs text-[var(--ink-muted)]">
                              {formatDateTime(bean.lastBrew.createdAt)}
                            </p>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge tone={freshness.tone}>{freshness.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {!bean.isFinished && (
                            <Link
                              href={`/brews/new?bean=${bean.id}`}
                              className={buttonStyles({
                                variant: "ghost",
                                size: "sm"
                              })}
                            >
                              Demle
                            </Link>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busyId === bean.id}
                            onClick={() =>
                              handleToggleStatus(bean.id, !bean.isFinished)
                            }
                          >
                            {bean.isFinished ? "Aktif et" : "Arşivle"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--danger)]"
                            disabled={busyId === bean.id}
                            onClick={() => setDeleteTarget(bean)}
                          >
                            Sil
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </>
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        beanName={
          deleteTarget ? `${deleteTarget.roaster} · ${deleteTarget.name}` : ""
        }
        busy={busyId !== null}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
