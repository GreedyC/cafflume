import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaginationBar } from "@/components/ui/pagination";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "@/components/ui/table";
import {
  formatDateTime,
  formatDurationParts,
  formatNumber
} from "@/lib/utils";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import { pageSchema } from "@/lib/validations";
import { requirePageUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { brewListCopy } from "@/lib/i18n-brews";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{
    page?: SearchParamValue;
    method?: SearchParamValue;
    minRating?: SearchParamValue;
  }>;
};

export default async function BrewsPage({ searchParams }: Props) {
  const user = await requirePageUser();
  const locale = await getLocale();
  const c = brewListCopy[locale];
  const resolvedSearchParams = await searchParams;
  const parsedPage = pageSchema.safeParse(
    firstSearchParam(resolvedSearchParams.page) ?? 1
  );
  const requestedPage = parsedPage.success ? parsedPage.data : 1;
  const selectedMethod =
    firstSearchParam(resolvedSearchParams.method)?.trim().slice(0, 80) ?? "";
  const rawMinRating = firstSearchParam(resolvedSearchParams.minRating);
  const minRating = rawMinRating && ["7", "8", "9"].includes(rawMinRating)
    ? Number(rawMinRating)
    : 0;
  const where = {
    userId: user.id,
    ...(selectedMethod ? { method: selectedMethod } : {}),
    ...(minRating ? { rating: { gte: minRating } } : {})
  };

  const [total, methodRows, overall] = await Promise.all([
    prisma.brewLog.count({ where }),
    prisma.brewLog.groupBy({
      by: ["method"],
      where: { userId: user.id },
      orderBy: { method: "asc" }
    }),
    prisma.brewLog.aggregate({
      where: { userId: user.id },
      _avg: { rating: true },
      _max: { rating: true },
      _count: true
    })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const brews = await prisma.brewLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { bean: true },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const query = new URLSearchParams();
  if (selectedMethod) query.set("method", selectedMethod);
  if (minRating) query.set("minRating", String(minRating));
  const paginationBase = query.size ? `/brews?${query}` : "/brews";

  return (
    <div className="flex flex-col gap-7">
      <header className="journal-rule flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            {c.kicker}
          </p>
          <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
            {c.intro}
          </p>
        </div>
        <Link href="/brews/new" className={buttonStyles()}>
          {c.record}
        </Link>
      </header>

      <section
        aria-label={c.summary}
        className="grid grid-cols-3 gap-2 sm:gap-4"
      >
        {[
          { label: c.total, value: overall._count.toString() },
          {
            label: c.average,
            value: overall._avg.rating
              ? formatNumber(overall._avg.rating, 1, locale)
              : "—"
          },
          {
            label: c.highest,
            value: overall._max.rating
              ? formatNumber(overall._max.rating, 1, locale)
              : "—"
          }
        ].map((item) => (
          <Card key={item.label} className="p-4 sm:p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)] sm:text-[10px]">
              {item.label}
            </p>
            <p className="display-title mt-2 text-3xl font-semibold tabular-nums sm:text-4xl">
              {item.value}
            </p>
          </Card>
        ))}
      </section>

      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
      >
        <div>
          <label
            htmlFor="method-filter"
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]"
          >
            {c.method}
          </label>
          <select
            id="method-filter"
            name="method"
            defaultValue={selectedMethod}
            className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">{c.allMethods}</option>
            {methodRows.map(({ method }) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="rating-filter"
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]"
          >
            {c.minScore}
          </label>
          <select
            id="rating-filter"
            name="minRating"
            defaultValue={minRating || ""}
            className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">{c.allScores}</option>
            <option value="7">7 {c.andAbove}</option>
            <option value="8">8 {c.andAbove}</option>
            <option value="9">9 {c.andAbove}</option>
          </select>
        </div>
        <button
          type="submit"
          className={buttonStyles({
            variant: "secondary",
            className: "self-end"
          })}
        >
          {c.apply}
        </button>
        {(selectedMethod || minRating > 0) && (
          <Link
            href="/brews"
            className={buttonStyles({
              variant: "ghost",
              className: "self-end"
            })}
          >
            {c.clear}
          </Link>
        )}
      </form>

      <p className="text-xs text-[var(--ink-muted)]">
        {total} {c.records} · {c.page} {page}/{totalPages}
      </p>

      {brews.length === 0 ? (
        <Card className="py-14 text-center">
          <p className="display-title text-2xl font-semibold">
            {c.empty}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {c.emptyHint}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">
            {brews.map((brew) => (
              <Card key={brew.id} className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink-muted)]">
                      {brew.bean.roaster}
                    </p>
                    <Link
                      href={`/brews/${brew.id}`}
                      className="display-title mt-1 block rounded-md text-2xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      {brew.bean.name}
                    </Link>
                  </div>
                  <Badge tone={brew.rating >= 8 ? "success" : "default"}>
                    {formatNumber(brew.rating, 1, locale)}/10
                  </Badge>
                </div>
                <p className="text-sm text-[var(--ink-muted)]">
                  {brew.method} · {brew.grindSetting}
                </p>
                <div className="grid grid-cols-3 gap-2 border-y border-[var(--border)] py-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                      {c.ratio}
                    </p>
                    <p className="mt-1 text-xs font-bold tabular-nums">
                      1:{formatNumber(brew.yieldMl / brew.doseGrams, 1, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                      {c.temperature}
                    </p>
                    <p className="mt-1 text-xs font-bold tabular-nums">
                      {formatNumber(brew.waterTempC, 1, locale)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                      {c.duration}
                    </p>
                    <p className="mt-1 text-xs font-bold tabular-nums">
                      {brew.brewTimeMin}:{brew.brewTimeSec
                        .toString()
                        .padStart(2, "0")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <time className="text-[11px] text-[var(--ink-muted)]">
                    {formatDateTime(brew.createdAt, locale)}
                  </time>
                  <Link
                    href={`/brews/new?from=${brew.id}`}
                    className={buttonStyles({ variant: "secondary", size: "sm" })}
                  >
                    {c.repeat}
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{c.bean}</TableHeaderCell>
                  <TableHeaderCell>{c.method}</TableHeaderCell>
                  <TableHeaderCell>{c.recipe}</TableHeaderCell>
                  <TableHeaderCell>{c.duration}</TableHeaderCell>
                  <TableHeaderCell>{c.score}</TableHeaderCell>
                  <TableHeaderCell>{c.date}</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    {c.action}
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {brews.map((brew) => (
                  <TableRow key={brew.id}>
                    <TableCell>
                      <Link
                        href={`/brews/${brew.id}`}
                        className="font-bold underline-offset-4 hover:text-[var(--accent-strong)] hover:underline"
                      >
                        {brew.bean.name}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        {brew.bean.roaster}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{brew.method}</p>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        {brew.grindSetting}
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatNumber(brew.doseGrams, 1, locale)} g /{" "}
                      {formatNumber(brew.yieldMl, 0, locale)} ml
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        1:{formatNumber(brew.yieldMl / brew.doseGrams, 1, locale)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {formatDurationParts(
                        brew.brewTimeMin,
                        brew.brewTimeSec,
                        locale
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge tone={brew.rating >= 8 ? "success" : "default"}>
                        {formatNumber(brew.rating, 1, locale)}/10
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(brew.createdAt, locale)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/brews/new?from=${brew.id}`}
                        className={buttonStyles({
                          variant: "ghost",
                          size: "sm"
                        })}
                      >
                        {c.repeat}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              baseHref={paginationBase}
            />
          )}
        </>
      )}
    </div>
  );
}
