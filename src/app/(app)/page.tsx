import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { formatDateTime, formatDaysSince, formatNumber } from "@/lib/utils";
import { LiveBrewConsole } from "@/components/dashboard/live-brew-console";
import { getLocale } from "@/lib/i18n-server";
import { translator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requirePageUser();
  const [locale, activeBeans, recentBrews, recentCuppings] = await Promise.all([
    getLocale(),
    prisma.bean.findMany({ where: { userId: user.id, isFinished: false }, orderBy: { roastDate: "asc" }, take: 8 }),
    prisma.brewLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { bean: true }, take: 5 }),
    prisma.cuppingSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { bean: true }, take: 4 })
  ]);
  const t = translator(locale);
  const last = recentBrews[0] ?? null;
  const beans = activeBeans.map((bean) => ({
    id: bean.id,
    name: bean.name,
    roaster: bean.roaster,
    roastAge: formatDaysSince(bean.roastDate)
  }));
  const lastRecipe = last ? {
    id: last.id, beanId: last.beanId, method: last.method,
    doseGrams: last.doseGrams, yieldMl: last.yieldMl,
    waterTempC: last.waterTempC, grindSetting: last.grindSetting,
    brewTimeMin: last.brewTimeMin, brewTimeSec: last.brewTimeSec
  } : null;

  return (
    <div className="dashboard-workspace">
      <LiveBrewConsole beans={beans} lastRecipe={lastRecipe} locale={locale} />
      <div className="dashboard-lower-grid">
        <section className="data-panel" aria-labelledby="active-coffees-title">
          <div className="panel-heading"><div><h2 id="active-coffees-title">{t("activeBeans")}</h2><p>Roast age and next action</p></div><Link href="/beans">{t("viewAll")} →</Link></div>
          {beans.slice(0, 4).map((bean) => (
            <div key={bean.id} className="coffee-row">
              <span className="status-dot" aria-hidden="true" />
              <span><strong>{bean.name}</strong><small>{bean.roaster}</small></span>
              <span className="numeric">{bean.roastAge}</span>
              <Link href={`/brews/new?bean=${bean.id}`}>Brew</Link>
              <Link href={`/cuppings/new?bean=${bean.id}`}>Cup</Link>
            </div>
          ))}
          {!beans.length && <div className="panel-empty">No active coffees. <Link href="/beans/new">Add one</Link></div>}
        </section>
        <section className="data-panel" aria-labelledby="recent-brews-title">
          <div className="panel-heading"><div><h2 id="recent-brews-title">{t("recentBrews")}</h2><p>Your latest recipe changes</p></div><Link href="/brews">{t("viewAll")} →</Link></div>
          {recentBrews.map((brew) => (
            <div key={brew.id} className="history-row">
              <span><strong>{brew.bean.name}</strong><small>{brew.method} · {formatDateTime(brew.createdAt)}</small></span>
              <span className="numeric">1:{formatNumber(brew.yieldMl / brew.doseGrams, 1)}</span>
              <span className="score-chip">{formatNumber(brew.rating, 1)}</span>
              <Link href={`/brews/new?from=${brew.id}`}>Repeat</Link>
            </div>
          ))}
          {!recentBrews.length && <div className="panel-empty">No brews recorded yet.</div>}
        </section>
        <section className="data-panel" aria-labelledby="cupping-title">
          <div className="panel-heading"><div><h2 id="cupping-title">{t("cupping")}</h2><p>Structured sensory sessions</p></div><Link href="/cuppings/new">{t("newCupping")} +</Link></div>
          {recentCuppings.map((session) => (
            <div key={session.id} className="history-row">
              <span><strong>{session.bean.name}</strong><small>{formatDateTime(session.createdAt)}</small></span>
              <span className="score-chip score-chip-large">{formatNumber(session.totalScore, 1)}</span>
            </div>
          ))}
          {!recentCuppings.length && <div className="panel-empty">No sessions yet. <Link href="/cuppings/new">Create the first cupping</Link></div>}
        </section>
      </div>
    </div>
  );
}
