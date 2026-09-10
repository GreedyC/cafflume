import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonStyles } from "@/components/ui/button";
import { BeansTable } from "@/components/beans/beans-table";
import { requirePageUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const user = await requirePageUser();
  const beans = await prisma.bean.findMany({
    where: { userId: user.id },
    orderBy: { roastDate: "desc" },
    include: {
      brewLogs: {
        orderBy: { createdAt: "desc" },
        select: { id: true, rating: true, createdAt: true },
        take: 1
      },
      _count: { select: { brewLogs: true } }
    }
  });

  const normalizedBeans = beans.map((bean) => ({
    ...bean,
    lastBrew: bean.brewLogs[0] ?? null,
    brewCount: bean._count.brewLogs
  }));

  return (
    <div className="flex flex-col gap-7">
      <header className="journal-rule flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Coffee library
          </p>
          <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
            Beans
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
            Track roast age, package status and the latest cup at a glance.
          </p>
        </div>
        <Link href="/beans/new" className={buttonStyles()}>
          Add coffee
        </Link>
      </header>

      <BeansTable beans={normalizedBeans} />
    </div>
  );
}
