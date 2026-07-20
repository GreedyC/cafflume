import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import {
  formatDateTime,
  formatDurationParts,
  formatNumber
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BrewDetailPage({ params }: Props) {
  const { id } = await params;
  const brew = await prisma.brewLog.findUnique({
    where: { id },
    include: { bean: true }
  });

  if (!brew) notFound();

  const ratio = brew.yieldMl / brew.doseGrams;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <header>
        <Link
          href="/brews"
          className="text-xs font-bold text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          ← Demleme günlüğüne dön
        </Link>
        <div className="journal-rule mt-6 flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={brew.rating >= 8 ? "success" : "default"}>
                {formatNumber(brew.rating, 1)}/10
              </Badge>
              <time className="text-xs text-[var(--ink-muted)]">
                {formatDateTime(brew.createdAt)}
              </time>
            </div>
            <p className="mt-5 text-sm font-semibold text-[var(--ink-muted)]">
              {brew.bean.roaster}
            </p>
            <h1 className="display-title mt-1 text-4xl font-semibold sm:text-6xl">
              {brew.bean.name}
            </h1>
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              {brew.method} · {brew.grindSetting}
            </p>
          </div>
          {brew.bean.isFinished ? (
            <Link
              href={`/beans/${brew.beanId}`}
              className={buttonStyles({ variant: "secondary" })}
            >
              Arşivdeki paketi görüntüle
            </Link>
          ) : (
            <Link
              href={`/brews/new?from=${brew.id}`}
              className={buttonStyles()}
            >
              Bu tarifi tekrar demle
            </Link>
          )}
        </div>
      </header>

      <section
        aria-label="Reçete değerleri"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          {
            label: "Kahve / su",
            value: `${formatNumber(brew.doseGrams, 1)} g / ${formatNumber(
              brew.yieldMl
            )} ml`
          },
          { label: "Oran", value: `1:${formatNumber(ratio, 1)}` },
          {
            label: "Sıcaklık",
            value: `${formatNumber(brew.waterTempC, 1)}°C`
          },
          {
            label: "Toplam süre",
            value: formatDurationParts(brew.brewTimeMin, brew.brewTimeSec)
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

      <div className="grid gap-4 lg:grid-cols-[1fr_0.55fr]">
        <Card className="min-h-52">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Tadım notu
          </p>
          <blockquote className="display-title mt-5 text-2xl font-medium leading-relaxed sm:text-3xl">
            {brew.tastingNotes || "Bu fincan için tadım notu eklenmemiş."}
          </blockquote>
        </Card>
        <Card tone="muted">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Öğütüm referansı
          </p>
          <p className="display-title mt-4 text-3xl font-semibold">
            {brew.grindSetting}
          </p>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
            Sonraki fincanda tek bir değişkeni küçük adımla değiştir ve sonucu
            yeni puanla karşılaştır.
          </p>
        </Card>
      </div>

      <Link
        href={`/beans/${brew.beanId}`}
        className="text-sm font-bold text-[var(--accent-strong)] underline decoration-[var(--accent)] underline-offset-4"
      >
        {brew.bean.name} paketindeki tüm kayıtları gör →
      </Link>
    </div>
  );
}
