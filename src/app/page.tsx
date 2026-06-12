import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDurationParts, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const [activeBeansCount, totalBrewsCount, topBrews] = await Promise.all([
    prisma.bean.count({ where: { isFinished: false } }),
    prisma.brewLog.count(),
    prisma.brewLog.findMany({
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      include: { bean: true },
      take: 3
    })
  ]);

  const dailyBrews = await prisma.brewLog.findMany({
    where: { createdAt: { gte: startOfDay } },
    select: { method: true, doseGrams: true, yieldMl: true }
  });

  const rangeBrews = dailyBrews.length
    ? dailyBrews
    : await prisma.brewLog.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { method: true, doseGrams: true, yieldMl: true }
      });

  const noteWindowLabel = dailyBrews.length ? "Bugün" : "Son 7 gün";
  const noteMessage = rangeBrews.length
    ? `${noteWindowLabel} içinde ${rangeBrews.length} demleme kaydı.`
    : "Henüz demleme kaydı yok.";

  const methodCounts = rangeBrews.reduce<Record<string, number>>(
    (acc, brew) => {
      acc[brew.method] = (acc[brew.method] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const favoriteMethod = Object.entries(methodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];
  const averageRatio = rangeBrews.length
    ? rangeBrews.reduce((sum, brew) => sum + brew.yieldMl / brew.doseGrams, 0) /
      rangeBrews.length
    : null;
  const ratioLabel = averageRatio
    ? `1:${formatNumber(averageRatio, 1)}`
    : "—";

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[32px] border border-[rgba(75,45,23,0.14)] bg-[rgba(255,249,235,0.9)] p-6 shadow-soft">
          <div className="absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-10 rounded-full bg-[rgba(209,161,42,0.28)] blur-2xl" />
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-[var(--ink-muted)]">Aktif paketler</p>
              <p className="text-3xl font-semibold text-[var(--accent-2)]">
                {activeBeansCount}
              </p>
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              Bugün demlemeye hazır çekirdekler.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-muted)]">
              <span className="rounded-full bg-[rgba(209,161,42,0.18)] px-3 py-1">
                Stok takibi
              </span>
              <span className="rounded-full bg-[rgba(171,117,52,0.18)] px-3 py-1">
                Tazelik
              </span>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-[rgba(75,45,23,0.14)] bg-[rgba(255,249,235,0.9)] p-6 shadow-soft">
          <div className="absolute left-0 top-0 h-24 w-24 -translate-x-6 -translate-y-8 rounded-full bg-[rgba(176,120,31,0.28)] blur-2xl" />
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-[var(--ink-muted)]">Toplam demleme</p>
              <p className="text-3xl font-semibold text-[var(--accent-2)]">
                {totalBrewsCount}
              </p>
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              Şimdiye kadar kaydedilen demlemeler.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-muted)]">
              <span className="rounded-full bg-[rgba(209,161,42,0.18)] px-3 py-1">
                Brew Log
              </span>
              <span className="rounded-full bg-[rgba(171,117,52,0.18)] px-3 py-1">
                Analiz
              </span>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-[rgba(75,45,23,0.14)] bg-[rgba(255,249,235,0.9)] p-6 shadow-soft">
          <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-6 translate-y-6 rounded-full bg-[rgba(209,161,42,0.28)] blur-2xl" />
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-[var(--ink-muted)]">Hızlı aksiyon</p>
              <p className="text-lg font-semibold">Yeni demleme ekle</p>
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              Oran, öğütüm ve notları tek ekran üzerinden kaydet.
            </p>
            <Link
              href="/brews/new"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--brown)] shadow-soft hover:bg-[var(--accent-2)]"
            >
              Demleme kaydet
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-[32px] border border-[rgba(75,45,23,0.16)] bg-[rgba(255,249,235,0.92)] p-6 shadow-soft">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-0 top-0 h-40 w-40 -translate-x-16 -translate-y-16 rounded-full bg-[rgba(209,161,42,0.3)] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-52 w-52 translate-x-10 translate-y-10 rounded-full bg-[rgba(176,120,31,0.28)] blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Günün Demleme Notları</h2>
            <p className="text-sm text-[var(--ink-muted)]">
              {noteMessage}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[rgba(75,45,23,0.12)] bg-[rgba(255,255,255,0.7)] p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                  Favori yöntem
                </p>
                <p className="text-lg font-semibold">
                  {favoriteMethod ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(75,45,23,0.12)] bg-[rgba(255,255,255,0.7)] p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                  Ortalama oran
                </p>
                <p className="text-lg font-semibold">{ratioLabel}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="h-40 overflow-hidden rounded-[28px] border border-[rgba(75,45,23,0.16)] shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
              alt="Brew"
              width={800}
              height={320}
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 overflow-hidden rounded-[24px] border border-[rgba(75,45,23,0.16)] shadow-soft">
              <Image
                src="https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=600&q=80"
                alt="Beans"
                width={600}
                height={260}
                sizes="(max-width: 1024px) 50vw, 16vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-32 overflow-hidden rounded-[24px] border border-[rgba(75,45,23,0.16)] shadow-soft">
              <Image
                src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80"
                alt="Pour over"
                width={600}
                height={260}
                sizes="(max-width: 1024px) 50vw, 16vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">En yüksek puanlı son demlemeler</h2>
          <Link
            href="/brews"
            className="text-sm font-semibold text-[var(--accent-2)]"
          >
            Tümünü gör
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topBrews.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--ink-muted)]">
                Henüz kayıtlı demleme yok.
              </p>
            </Card>
          ) : (
            topBrews.map((brew) => (
              <Card key={brew.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge tone="success">{formatNumber(brew.rating, 1)}/10</Badge>
                  <span className="text-xs text-[var(--ink-muted)]">
                    {formatDateTime(brew.createdAt)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {brew.bean.roaster} · {brew.bean.name}
                  </p>
                  <p className="text-sm text-[var(--ink-muted)]">{brew.method}</p>
                </div>
                <div className="text-sm text-[var(--ink-muted)]">
                  {formatNumber(brew.doseGrams, 1)}g · {formatNumber(brew.yieldMl)}ml ·
                  {" "}
                  {formatDurationParts(brew.brewTimeMin, brew.brewTimeSec)}
                </div>
                {brew.tastingNotes && (
                  <p className="text-sm">{brew.tastingNotes}</p>
                )}
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
