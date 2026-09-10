import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { buttonStyles } from "@/components/ui/button";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CuppingsPage() {
  const user = await requirePageUser();
  const cuppings = await prisma.cuppingSession.findMany({ where: { userId: user.id }, include: { bean: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-7">
      <header className="page-header page-header-row">
        <div><h1>Cupping</h1><p>Structured sensory sessions linked to the coffees in your library.</p></div>
        <Link href="/cuppings/new" className={buttonStyles()}>New cupping</Link>
      </header>
      {cuppings.length ? (
        <div className="data-panel">
          <div className="data-row data-row-heading"><span>Coffee</span><span>Session</span><span>Score</span><span>Notes</span></div>
          {cuppings.map((session) => (
            <div key={session.id} className="data-row">
              <span><strong>{session.bean.name}</strong><small>{session.bean.roaster}</small></span>
              <time>{formatDateTime(session.createdAt)}</time>
              <strong className="numeric signal">{formatNumber(session.totalScore, 1)}</strong>
              <span className="truncate">{session.notes || "No notes"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-panel"><h2>No cupping sessions yet</h2><p>Start with an active coffee and record what you taste.</p><Link href="/cuppings/new">Create first cupping</Link></div>
      )}
    </div>
  );
}
