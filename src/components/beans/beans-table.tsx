"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn, formatDate, formatDateTime, formatDaysSince } from "@/lib/utils";

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
};

type BeansTableProps = {
  beans: BeanData[];
};

type StatusFilter = "all" | "active" | "finished";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "active", label: "Aktif" },
  { value: "finished", label: "Bitti" }
];

export function BeansTable({ beans: initialBeans }: BeansTableProps) {
  const [beans, setBeans] = useState<BeanData[]>(initialBeans);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeanData | null>(null);

  const counts = useMemo(() => {
    const active = beans.filter((bean) => !bean.isFinished).length;
    const finished = beans.filter((bean) => bean.isFinished).length;
    return { total: beans.length, active, finished };
  }, [beans]);

  const filteredBeans = useMemo(() => {
    const term = query.trim().toLowerCase();
    return beans.filter((bean) => {
      if (statusFilter === "active" && bean.isFinished) return false;
      if (statusFilter === "finished" && !bean.isFinished) return false;
      if (!term) return true;
      const haystack = [
        bean.roaster,
        bean.name,
        bean.origin,
        bean.process,
        bean.variety ?? ""
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [beans, query, statusFilter]);

  const pushNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const handleToggleStatus = async (beanId: string, nextStatus: boolean) => {
    setBusyId(beanId);
    try {
      const response = await fetch(`/api/beans/${beanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFinished: nextStatus })
      });

      if (!response.ok) throw new Error("request failed");

      setBeans((prev) =>
        prev.map((bean) =>
          bean.id === beanId ? { ...bean, isFinished: nextStatus } : bean
        )
      );
      pushNotice(nextStatus ? "Paket bitti olarak işaretlendi." : "Paket aktif edildi.");
    } catch (error) {
      pushNotice("İşlem başarısız. Lütfen tekrar deneyin.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (beanId: string) => {
    setBusyId(beanId);
    setDeleteTarget(null);
    try {
      const response = await fetch(`/api/beans/${beanId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("request failed");
      setBeans((prev) => prev.filter((bean) => bean.id !== beanId));
      pushNotice("Kayıt silindi.");
    } catch (error) {
      pushNotice("Silme işlemi başarısız. Lütfen tekrar deneyin.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Çekirdek ara (kavurucu, menşei, işleme)"
        />
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold transition",
                statusFilter === filter.value
                  ? "border-transparent bg-[var(--accent)] text-[var(--brown)]"
                  : "border-[rgba(75,45,23,0.2)] bg-transparent text-[var(--ink)] hover:bg-[rgba(209,161,42,0.12)]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Toplam çekirdek
          </p>
          <p className="text-2xl font-semibold text-[var(--accent-2)]">
            {counts.total}
          </p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Aktif paket
          </p>
          <p className="text-2xl font-semibold text-[var(--accent-2)]">
            {counts.active}
          </p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Biten paket
          </p>
          <p className="text-2xl font-semibold text-[var(--accent-2)]">
            {counts.finished}
          </p>
        </Card>
      </div>

      {notice && (
        <div className="rounded-2xl border border-[rgba(75,45,23,0.14)] bg-[rgba(255,249,235,0.8)] px-4 py-3 text-sm text-[var(--ink-muted)]">
          {notice}
        </div>
      )}

      {filteredBeans.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--ink-muted)]">
            Filtrelere uygun çekirdek bulunamadı.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {filteredBeans.map((bean) => (
              <Card key={bean.id} className="flex flex-col gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    {bean.roaster} · {bean.name}
                  </p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {bean.origin} · {bean.process}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-muted)]">
                  <span>Kavrum: {formatDate(bean.roastDate)}</span>
                  <span>·</span>
                  <span>{formatDaysSince(bean.roastDate)} önce</span>
                </div>
                <div className="flex items-center justify-between">
                  {bean.isFinished ? (
                    <Badge tone="warning">Bitti</Badge>
                  ) : (
                    <Badge tone="success">Aktif</Badge>
                  )}
                  <span className="text-xs text-[var(--ink-muted)]">
                    Eklenme: {formatDateTime(bean.createdAt)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-2 text-xs"
                    disabled={busyId === bean.id}
                    onClick={() => handleToggleStatus(bean.id, !bean.isFinished)}
                  >
                    {bean.isFinished ? "Aktif Et" : "Bitti İşaretle"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-2 text-xs text-red-700"
                    disabled={busyId === bean.id}
                    onClick={() => setDeleteTarget(bean)}
                  >
                    Sil
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Çekirdek</TableHeaderCell>
                  <TableHeaderCell>Köken</TableHeaderCell>
                  <TableHeaderCell>Kavrum</TableHeaderCell>
                  <TableHeaderCell>Eklenme</TableHeaderCell>
                  <TableHeaderCell>Durum</TableHeaderCell>
                  <TableHeaderCell>Aksiyon</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filteredBeans.map((bean) => (
                  <TableRow key={bean.id}>
                    <TableCell>
                      <div className="font-semibold">{bean.name}</div>
                      <div className="text-xs text-[var(--ink-muted)]">
                        {bean.roaster} · {bean.variety || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{bean.origin}</div>
                      <div className="text-xs text-[var(--ink-muted)]">
                        {bean.process}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{formatDate(bean.roastDate)}</div>
                      <div className="text-xs text-[var(--ink-muted)]">
                        {formatDaysSince(bean.roastDate)} önce
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(bean.createdAt)}</TableCell>
                    <TableCell>
                      {bean.isFinished ? (
                        <Badge tone="warning">Bitti</Badge>
                      ) : (
                        <Badge tone="success">Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-2 text-xs"
                          disabled={busyId === bean.id}
                          onClick={() =>
                            handleToggleStatus(bean.id, !bean.isFinished)
                          }
                        >
                          {bean.isFinished ? "Aktif Et" : "Bitti"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-2 text-xs text-red-700"
                          disabled={busyId === bean.id}
                          onClick={() => setDeleteTarget(bean)}
                        >
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        beanName={deleteTarget ? `${deleteTarget.roaster} · ${deleteTarget.name}` : ""}
        busy={busyId !== null}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
