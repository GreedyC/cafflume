import Link from "next/link";
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

export const dynamic = "force-dynamic";

function getFreshness(days: number) {
  if (days < 5) return { label: "Dinleniyor", tone: "warning" as const };
  if (days <= 30) return { label: "İdeal aralık", tone: "success" as const };
  return { label: "Öncelikli tüket", tone: "danger" as const };
}

export default async function DashboardPage() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setHours(0, 0, 0, 0);
  weekAgo.setDate(now.getDate() - 6);

  const [activeBeans, totalBrews, weekBrews, recentBrews] = await Promise.all([
    prisma.bean.findMany({
      where: { isFinished: false },
      orderBy: { roastDate: "asc" },
      include: {
        brewLogs: {
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          take: 1
        }
      }
    }),
    prisma.brewLog.count(),
    prisma.brewLog.findMany({
      where: { createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "asc" },
      include: { bean: true }
    }),
    prisma.brewLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { bean: true },
      take: 3
    })
  ]);

  const nextBean = activeBeans[0];
  const nextRecipe = nextBean?.brewLogs[0];
  const roastAge = nextBean
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() - nextBean.roastDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;
  const freshness = getFreshness(roastAge);
  const averageRating = weekBrews.length
    ? weekBrews.reduce((sum, brew) => sum + brew.rating, 0) / weekBrews.length
    : null;
  const methodCounts = weekBrews.reduce<Record<string, number>>((acc, brew) => {
    acc[brew.method] = (acc[brew.method] ?? 0) + 1;
    return acc;
  }, {});
  const favoriteMethod = Object.entries(methodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekAgo);
    date.setDate(weekAgo.getDate() + index);
    const count = weekBrews.filter(
      (brew) => brew.createdAt.toDateString() === date.toDateString()
    ).length;
    return {
      label: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(date),
      count
    };
  });
  const maxActivity = Math.max(1, ...dailyActivity.map((day) => day.count));

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <header className="journal-rule flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Günlük kayıt · {formatDate(now)}
          </p>
          <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
            Fincanın bugün ne anlatıyor?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)] sm:text-base">
            Taze paketleri izle, iyi tariflere geri dön ve her demlemede küçük
            bir ilerleme kaydet.
          </p>
        </div>
        <Link href="/brews/new" className={buttonStyles()}>
          Yeni demleme kaydet
        </Link>
      </header>

      <section
        aria-label="Bugünün önerisi ve özet metrikler"
        className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]"
      >
        <Card
          tone="dark"
          className="relative min-h-[330px] overflow-hidden p-6 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-8 top-8 h-48 w-48 rounded-full border border-white/10"
          />
          <div className="relative flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-soft)]">
                Sıradaki fincan
              </span>
              {nextBean && (
                <Badge tone={freshness.tone}>{freshness.label}</Badge>
              )}
            </div>

            {nextBean ? (
              <>
                <div className="mt-10">
                  <p className="text-sm text-white/75">{nextBean.roaster}</p>
                  <h2 className="display-title mt-1 max-w-2xl text-4xl font-semibold sm:text-5xl">
                    {nextBean.name}
                  </h2>
                  <p className="mt-3 text-sm text-white/75">
                    {nextBean.origin} · {nextBean.process}
                    {nextBean.variety ? ` · ${nextBean.variety}` : ""}
                  </p>
                </div>
                <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-[auto_auto_1fr] sm:items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/70">
                      Kavrum yaşı
                    </p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">
                      {formatDaysSince(nextBean.roastDate)}
                    </p>
                  </div>
                  {nextRecipe && (
                    <div className="sm:border-l sm:border-white/15 sm:pl-6">
                      <p className="text-[10px] uppercase tracking-wider text-white/70">
                        En iyi kayıt
                      </p>
                      <p className="mt-1 text-xl font-semibold tabular-nums">
                        {formatNumber(nextRecipe.rating, 1)}/10
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Link
                      href={`/beans/${nextBean.id}`}
                      className={buttonStyles({
                        variant: "ghost",
                        className: "text-white hover:bg-white/10 hover:text-white"
                      })}
                    >
                      Paketi aç
                    </Link>
                    <Link
                      href={
                        nextRecipe
                          ? `/brews/new?from=${nextRecipe.id}`
                          : `/brews/new?bean=${nextBean.id}`
                      }
                      className={buttonStyles({
                        className:
                          "bg-white text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                      })}
                    >
                      {nextRecipe ? "Tarifi tekrar demle" : "İlk tarifi oluştur"}
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="my-auto max-w-lg py-10">
                <h2 className="display-title text-4xl font-semibold">
                  Günlüğün ilk sayfası hazır.
                </h2>
                <p className="mt-4 leading-7 text-white/75">
                  Önce bir çekirdek paketi ekle; ardından her fincanı aynı paket
                  üzerinde karşılaştır.
                </p>
                <Link
                  href="/beans/new"
                  className={buttonStyles({
                    className:
                      "mt-6 bg-white text-[var(--ink)] hover:bg-[var(--accent-soft)]"
                  })}
                >
                  İlk çekirdeği ekle
                </Link>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <Card className="flex flex-col justify-between gap-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Aktif paket
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="display-title text-4xl font-semibold tabular-nums">
                {activeBeans.length}
              </p>
              <Link
                href="/beans"
                className="text-xs font-bold text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Envanter
              </Link>
            </div>
          </Card>
          <Card className="flex flex-col justify-between gap-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Son 7 gün
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="display-title text-4xl font-semibold tabular-nums">
                {weekBrews.length}
              </p>
              <span className="text-xs text-[var(--ink-muted)]">demleme</span>
            </div>
          </Card>
          <Card className="col-span-2 flex flex-col justify-between gap-5 xl:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Haftalık ortalama
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="display-title text-4xl font-semibold tabular-nums">
                {averageRating ? formatNumber(averageRating, 1) : "—"}
              </p>
              <span className="text-xs text-[var(--ink-muted)]">/ 10 puan</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                7 günlük ritim
              </p>
              <h2 className="display-title mt-2 text-2xl font-semibold">
                Demleme aktivitesi
              </h2>
            </div>
            <p className="text-right text-xs text-[var(--ink-muted)]">
              Toplam {totalBrews} kayıt
            </p>
          </div>
          <div
            className="mt-8 grid h-36 grid-cols-7 items-end gap-2"
            role="img"
            aria-label={`Son yedi günde ${weekBrews.length} demleme`}
          >
            {dailyActivity.map((day) => (
              <div
                key={day.label}
                className="flex h-full flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] font-bold tabular-nums text-[var(--ink-muted)]">
                  {day.count || ""}
                </span>
                <span
                  className="w-full min-w-3 rounded-t-md bg-[var(--accent)] transition-[height]"
                  style={{
                    height: `${Math.max(8, (day.count / maxActivity) * 100)}%`,
                    opacity: day.count ? 1 : 0.18
                  }}
                />
                <span className="text-[10px] uppercase text-[var(--ink-soft)]">
                  {day.label.replace(".", "")}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card tone="muted">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Haftanın izi
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            {weekBrews.length
              ? `${favoriteMethod ?? "Kayıtlı yöntem"} öne çıkıyor`
              : "İlk veriyi sen ekle"}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
            {weekBrews.length
              ? `${weekBrews.length} kayıtta ortalama ${formatNumber(
                  averageRating ?? 0,
                  1
                )}/10. Bir sonraki fincanda tek değişkeni değiştirerek notunu karşılaştır.`
              : "Bu hafta henüz kayıt yok. Küçük bir tarif değişikliği yap ve sonucu günlüğüne ekle."}
          </p>
          <Link
            href="/brews"
            className="mt-6 inline-flex text-sm font-bold text-[var(--accent-strong)] underline decoration-[var(--accent)] underline-offset-4"
          >
            Tüm kayıtları incele
          </Link>
        </Card>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Günlükten son sayfalar
            </p>
            <h2 className="display-title mt-2 text-3xl font-semibold">
              Son demlemeler
            </h2>
          </div>
          <Link
            href="/brews"
            className="text-sm font-bold text-[var(--accent-strong)] underline-offset-4 hover:underline"
          >
            Tümünü gör
          </Link>
        </div>
        {recentBrews.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {recentBrews.map((brew) => (
              <Card key={brew.id} className="flex min-h-64 flex-col">
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
                  className="mt-6 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <p className="text-xs font-semibold text-[var(--ink-muted)]">
                    {brew.bean.roaster}
                  </p>
                  <h3 className="display-title mt-1 text-2xl font-semibold">
                    {brew.bean.name}
                  </h3>
                </Link>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  {brew.method} · {formatNumber(brew.doseGrams, 1)} g /{" "}
                  {formatNumber(brew.yieldMl)} ml
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <span className="text-xs text-[var(--ink-muted)]">
                    {formatDurationParts(brew.brewTimeMin, brew.brewTimeSec)}
                  </span>
                  <Link
                    href={`/brews/new?from=${brew.id}`}
                    className="text-xs font-bold text-[var(--accent-strong)] underline-offset-4 hover:underline"
                  >
                    Tekrar demle
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-5 text-center">
            <p className="text-sm text-[var(--ink-muted)]">
              Henüz demleme kaydı yok.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
