import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { buttonStyles } from "@/components/ui/button";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { cuppingCopy } from "@/lib/i18n-cupping";

export const dynamic = "force-dynamic";

export default async function CuppingsPage() {
  const user = await requirePageUser();
  const locale = await getLocale();
  const c = cuppingCopy[locale];
  const cuppings = await prisma.cuppingSession.findMany({ where: { userId: user.id }, include: { bean: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-7">
      <header className="page-header page-header-row">
        <div><h1>{c.title}</h1><p>{c.intro}</p></div>
        <Link href="/cuppings/new" className={buttonStyles()}>{c.new}</Link>
      </header>
      {cuppings.length ? (
        <div className="data-panel">
          <div className="data-row data-row-heading"><span>{c.coffee}</span><span>{c.session}</span><span>{c.score}</span><span>{c.notes}</span></div>
          {cuppings.map((session) => (
            <div key={session.id} className="data-row">
              <span><strong>{session.bean.name}</strong><small>{session.bean.roaster}</small></span>
              <time>{formatDateTime(session.createdAt, locale)}</time>
              <strong className="numeric signal">{formatNumber(session.totalScore, 1, locale)}</strong>
              <span className="truncate">{session.notes || c.noNotes}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-panel"><h2>{c.empty}</h2><p>{c.emptyHint}</p><Link href="/cuppings/new">{c.first}</Link></div>
      )}
    </div>
  );
}
