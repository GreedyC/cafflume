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
import type { Locale } from "@/lib/i18n";

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
  locale: Locale;
};

type StatusFilter = "all" | "active" | "finished";

const tableCopy:Record<Locale,string[]>={
en:["All","Active","Archived","Resting","Ready","Use first","Operation failed.","Coffee archived.","Coffee reactivated.","Coffee and linked brews deleted.","Inventory summary","Total","Search coffees","Search roaster, coffee, origin or process…","Coffee status","coffees shown","Clear search","No coffees match this filter.","Clear the search or add a coffee to the library.","Roast age","Brews","Last score","Brew this coffee","Reactivate","Archive","Delete","Coffee","Profile","Roast","Records","Last result","Status","Action"],
tr:["Tümü","Aktif","Arşiv","Dinleniyor","Hazır","Önce kullan","İşlem tamamlanamadı.","Çekirdek arşivlendi.","Çekirdek yeniden etkinleştirildi.","Çekirdek ve bağlı demlemeler silindi.","Envanter özeti","Toplam","Çekirdek ara","Kavurucu, çekirdek, menşei veya işlem ara…","Çekirdek durumu","çekirdek gösteriliyor","Aramayı temizle","Bu filtreyle eşleşen çekirdek yok.","Aramayı temizle veya kütüphaneye çekirdek ekle.","Kavrum yaşı","Demlemeler","Son puan","Bu çekirdeği demle","Aktif et","Arşivle","Sil","Çekirdek","Profil","Kavrum","Kayıt","Son sonuç","Durum","Aksiyon"],
es:["Todos","Activos","Archivados","Reposando","Listo","Usar primero","La operación falló.","Café archivado.","Café reactivado.","Café y preparaciones vinculadas eliminados.","Resumen del inventario","Total","Buscar cafés","Buscar tostador, café, origen o proceso…","Estado del café","cafés mostrados","Limpiar búsqueda","Ningún café coincide con este filtro.","Limpia la búsqueda o añade un café.","Edad del tueste","Preparaciones","Última puntuación","Preparar este café","Reactivar","Archivar","Eliminar","Café","Perfil","Tueste","Registros","Último resultado","Estado","Acción"],
de:["Alle","Aktiv","Archiviert","Ruht","Bereit","Zuerst verwenden","Vorgang fehlgeschlagen.","Kaffee archiviert.","Kaffee reaktiviert.","Kaffee und verknüpfte Brühungen gelöscht.","Bestandsübersicht","Gesamt","Kaffee suchen","Rösterei, Kaffee, Herkunft oder Aufbereitung suchen…","Kaffeestatus","Kaffees angezeigt","Suche löschen","Keine Kaffees entsprechen diesem Filter.","Suche löschen oder Kaffee hinzufügen.","Röstalter","Brühungen","Letzte Wertung","Diesen Kaffee brühen","Reaktivieren","Archivieren","Löschen","Kaffee","Profil","Röstung","Einträge","Letztes Ergebnis","Status","Aktion"],
no:["Alle","Aktive","Arkiverte","Hviler","Klar","Bruk først","Handlingen mislyktes.","Kaffe arkivert.","Kaffe reaktivert.","Kaffe og tilknyttede brygg slettet.","Lageroversikt","Totalt","Søk etter kaffe","Søk etter brenneri, kaffe, opprinnelse eller prosess…","Kaffestatus","kaffer vist","Tøm søk","Ingen kaffer samsvarer med filteret.","Tøm søket eller legg til kaffe.","Brenningsalder","Brygg","Siste poeng","Brygg denne kaffen","Aktiver","Arkiver","Slett","Kaffe","Profil","Brenning","Oppføringer","Siste resultat","Status","Handling"],
ja:["すべて","使用中","アーカイブ","休養中","適期","優先使用","操作に失敗しました。","コーヒーをアーカイブしました。","コーヒーを再有効化しました。","コーヒーと関連する抽出記録を削除しました。","在庫の概要","合計","コーヒーを検索","ロースター、コーヒー、産地、精製方法を検索…","コーヒーの状態","件表示","検索をクリア","条件に一致するコーヒーはありません。","検索をクリアするかコーヒーを追加してください。","焙煎日数","抽出回数","最新スコア","このコーヒーを抽出","再有効化","アーカイブ","削除","コーヒー","プロフィール","焙煎","記録","最新結果","状態","操作"],
ko:["전체","활성","보관됨","휴지 중","준비됨","먼저 사용","작업에 실패했습니다.","원두를 보관했습니다.","원두를 다시 활성화했습니다.","원두와 연결된 추출 기록을 삭제했습니다.","재고 요약","전체","원두 검색","로스터, 원두, 원산지 또는 가공 방식 검색…","원두 상태","개 원두 표시","검색 초기화","필터와 일치하는 원두가 없습니다.","검색을 초기화하거나 원두를 추가하세요.","로스팅 경과","추출","최근 점수","이 원두 추출","다시 활성화","보관","삭제","원두","프로필","로스팅","기록","최근 결과","상태","작업"]
};

function freshnessFor(bean: BeanData, c:string[]) {
  if (bean.isFinished) return { label: c[2], tone: "default" as const };
  const value = new Date(bean.roastDate);
  const days = Math.max(
    0,
    Math.floor((Date.now() - value.getTime()) / (1000 * 60 * 60 * 24))
  );
  if (days < 5) return { label: c[3], tone: "warning" as const };
  if (days <= 30) return { label: c[4], tone: "success" as const };
  return { label: c[5], tone: "danger" as const };
}

export function BeansTable({ beans: initialBeans, locale }: BeansTableProps) {
  const c=tableCopy[locale];
  const statusFilters:{value:StatusFilter;label:string}[]=[{value:"all",label:c[0]},{value:"active",label:c[1]},{value:"finished",label:c[2]}];
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
    const term = query.trim().toLocaleLowerCase(locale === "no" ? "nb-NO" : locale);
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
        .toLocaleLowerCase(locale === "no" ? "nb-NO" : locale)
        .includes(term);
    });
  }, [beans, query, statusFilter, locale]);

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
        throw new Error(result?.error ?? c[6]);
      }
      setBeans((current) =>
        current.map((bean) =>
          bean.id === beanId ? { ...bean, isFinished: nextStatus } : bean
        )
      );
      pushNotice(nextStatus ? c[7] : c[8]);
    } catch (error) {
      pushNotice(
        error instanceof Error
          ? error.message
          : c[6]
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
        throw new Error(result?.error ?? c[6]);
      }
      setBeans((current) => current.filter((bean) => bean.id !== beanId));
      setDeleteTarget(null);
      pushNotice(c[9]);
    } catch (error) {
      setDeleteTarget(null);
      pushNotice(
        error instanceof Error
          ? error.message
          : c[6]
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-label={c[10]}
        className="grid grid-cols-3 gap-2 sm:gap-4"
      >
        {[
          { label: c[11], value: counts.total }, { label: c[1], value: counts.active }, { label: c[2], value: counts.finished }
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
            {c[12]}
          </label>
          <Input
            id="bean-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c[13]}
          />
        </div>
        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface-2)] p-1"
          aria-label={c[14]}
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
        <p aria-live="polite">{filteredBeans.length} {c[15]}</p>
        {query && (
          <button
            type="button"
            className="font-bold text-[var(--accent-strong)] underline-offset-4 hover:underline"
            onClick={() => setQuery("")}
          >
            {c[16]}
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
            {c[17]}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {c[18]}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">
            {filteredBeans.map((bean) => {
              const freshness = freshnessFor(bean,c);
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
                        {c[19]}
                      </p>
                      <p className="mt-1 text-xs font-bold">
                        {formatDaysSince(bean.roastDate,locale)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        {c[20]}
                      </p>
                      <p className="mt-1 text-xs font-bold tabular-nums">
                        {bean.brewCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        {c[21]}
                      </p>
                      <p className="mt-1 text-xs font-bold tabular-nums">
                        {bean.lastBrew
                          ? `${formatNumber(bean.lastBrew.rating, 1,locale)}/10`
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
                        {c[22]}
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
                      {bean.isFinished ? c[23] : c[24]}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busyId === bean.id}
                      onClick={() => setDeleteTarget(bean)}
                    >
                      {c[25]}
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
                  <TableHeaderCell>{c[26]}</TableHeaderCell><TableHeaderCell>{c[27]}</TableHeaderCell><TableHeaderCell>{c[28]}</TableHeaderCell><TableHeaderCell>{c[29]}</TableHeaderCell><TableHeaderCell>{c[30]}</TableHeaderCell><TableHeaderCell>{c[31]}</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    {c[32]}
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filteredBeans.map((bean) => {
                  const freshness = freshnessFor(bean,c);
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
                        <p>{formatDate(bean.roastDate,locale)}</p>
                        <p className="mt-1 text-xs text-[var(--ink-muted)]">
                          {formatDaysSince(bean.roastDate,locale)}
                        </p>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {bean.brewCount}
                      </TableCell>
                      <TableCell>
                        {bean.lastBrew ? (
                          <>
                            <p className="font-bold tabular-nums">
                              {formatNumber(bean.lastBrew.rating, 1,locale)}/10
                            </p>
                            <p className="mt-1 text-xs text-[var(--ink-muted)]">
                              {formatDateTime(bean.lastBrew.createdAt,locale)}
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
                              {c[22]}
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
                            {bean.isFinished ? c[23] : c[24]}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--danger)]"
                            disabled={busyId === bean.id}
                            onClick={() => setDeleteTarget(bean)}
                          >
                            {c[25]}
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
        locale={locale}
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
