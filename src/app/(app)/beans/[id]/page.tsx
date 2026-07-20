import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import {
  formatDate,
  formatDateTime,
  formatDaysSince,
  formatDurationParts,
  formatNumber
} from "@/lib/utils";
import { requirePageUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BeanDetailPage({ params }: Props) {
  await requirePageUser();
  const { id } = await params;
  const bean = await prisma.bean.findUnique({
    where: { id },
    include: {
      brewLogs: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!bean) notFound();

  const now = new Date();
  const roastAge = Math.max(
    0,
    Math.floor(
      (now.getTime() - bean.roastDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const freshness =
    roastAge < 5
      ? { label: "Dinleniyor", tone: "warning" as const }
      : roastAge <= 30
        ? { label: "İdeal aralık", tone: "success" as const }
        : { label: "Öncelikli tüket", tone: "danger" as const };
  const bestBrew = [...bean.brewLogs].sort((a, b) => b.rating - a.rating)[0];
  const average = bean.brewLogs.length
    ? bean.brewLogs.reduce((sum, brew) => sum + brew.rating, 0) /
      bean.brewLogs.length
    : null;

  return (
    <div className="flex flex-col gap-7">
      <header>
        <Link
          href="/beans"
          className="text-xs font-bold text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          ← Çekirdeklere dön
        </Link>
        <div className="journal-rule mt-6 flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={bean.isFinished ? "default" : freshness.tone}>
                {bean.isFinished ? "Arşiv" : freshness.label}
              </Badge>
              <span className="text-xs text-[var(--ink-muted)]">
                {formatDaysSince(bean.roastDate)} önce kavruldu
              </span>
            </div>
            <p className="mt-5 text-sm font-semibold text-[var(--ink-muted)]">
              {bean.roaster}
            </p>
            <h1 className="display-title mt-1 text-4xl font-semibold sm:text-6xl">
              {bean.name}
            </h1>
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              {bean.origin} · {bean.process}
              {bean.variety ? ` · ${bean.variety}` : ""}
            </p>
          </div>
          {!bean.isFinished && (
            <Link
              href={
                bestBrew
                  ? `/brews/new?from=${bestBrew.id}`
                  : `/brews/new?bean=${bean.id}`
              }
              className={buttonStyles()}
            >
              {bestBrew ? "En iyi tarifi tekrar demle" : "İlk demlemeyi kaydet"}
            </Link>
          )}
        </div>
      </header>

      <section
        aria-label="Paket özeti"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          { label: "Kavrum tarihi", value: formatDate(bean.roastDate) },
          { label: "Paket açılışı", value: formatDate(bean.openDate) },
          { label: "Demleme", value: bean.brewLogs.length.toString() },
          {
            label: "Ortalama puan",
            value: average ? `${formatNumber(average, 1)}/10` : "—"
          }
        ].map((item) => (
          <Card key={item.label} className="p-4 sm:p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
              {item.label}
            </p>
            <p className="mt-3 text-lg font-bold tabular-nums sm:text-xl">
              {item.value}
            </p>
          </Card>
        ))}
      </section>

      {bestBrew && (
        <Card tone="dark" className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-soft)]">
              Referans reçete
            </p>
            <h2 className="display-title mt-2 text-3xl font-semibold">
              {bestBrew.method} · {formatNumber(bestBrew.rating, 1)}/10
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {formatNumber(bestBrew.doseGrams, 1)} g kahve ·{" "}
              {formatNumber(bestBrew.yieldMl)} ml su · {bestBrew.waterTempC}°C ·{" "}
              {bestBrew.grindSetting}
            </p>
          </div>
          <Link
            href={`/brews/new?from=${bestBrew.id}`}
            className={buttonStyles({
              className:
                "self-end bg-white text-[var(--ink)] hover:bg-[var(--accent-soft)]"
            })}
          >
            Bu reçeteyi kullan
          </Link>
        </Card>
      )}

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Paket geçmişi
            </p>
            <h2 className="display-title mt-2 text-3xl font-semibold">
              Demleme kayıtları
            </h2>
          </div>
          {!bean.isFinished && (
            <Link
              href={`/brews/new?bean=${bean.id}`}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Yeni kayıt
            </Link>
          )}
        </div>
        {bean.brewLogs.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bean.brewLogs.map((brew) => (
              <Card key={brew.id} className="flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={brew.rating >= 8 ? "success" : "default"}>
                    {formatNumber(brew.rating, 1)}/10
                  </Badge>
                  <time className="text-[11px] text-[var(--ink-muted)]">
                    {formatDateTime(brew.createdAt)}
                  </time>
                </div>
                <Link
                  href={`/brews/${brew.id}`}
                  className="display-title mt-5 rounded-md text-2xl font-semibold outline-none hover:text-[var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {brew.method}
                </Link>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  1:{formatNumber(brew.yieldMl / brew.doseGrams, 1)} ·{" "}
                  {formatDurationParts(brew.brewTimeMin, brew.brewTimeSec)}
                </p>
                {brew.tastingNotes && (
                  <p className="mt-4 line-clamp-2 text-sm leading-6">
                    {brew.tastingNotes}
                  </p>
                )}
                <Link
                  href={`/brews/new?from=${brew.id}`}
                  className="mt-auto pt-6 text-xs font-bold text-[var(--accent-strong)] underline-offset-4 hover:underline"
                >
                  Tekrar demle
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-5 py-12 text-center">
            <p className="display-title text-2xl font-semibold">
              Bu paket henüz demlenmedi.
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              İlk reçeteyi kaydettiğinde burada görünecek.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
