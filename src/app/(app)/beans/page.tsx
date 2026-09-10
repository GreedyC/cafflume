import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonStyles } from "@/components/ui/button";
import { BeansTable } from "@/components/beans/beans-table";
import { requirePageUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const user = await requirePageUser();
  const locale = await getLocale();
  const copy = {
    en:["Coffee library","Beans","Track roast age, package status and the latest cup at a glance.","Add coffee"], tr:["Kahve kütüphanesi","Çekirdekler","Kavrum yaşını, paket durumunu ve son fincanı tek bakışta izle.","Çekirdek ekle"], es:["Biblioteca de café","Cafés","Consulta la edad del tueste, el estado del paquete y la última taza.","Añadir café"], de:["Kaffeesammlung","Bohnen","Röstalter, Packungsstatus und letzte Tasse auf einen Blick.","Kaffee hinzufügen"], no:["Kaffebibliotek","Bønner","Se brenningsalder, posestatus og siste kopp med ett blikk.","Legg til kaffe"], ja:["コーヒーライブラリ","豆","焙煎日数、パッケージ状態、最新の一杯を一覧で確認します。","コーヒーを追加"], ko:["커피 라이브러리","원두","로스팅 경과, 패키지 상태, 최근 추출을 한눈에 확인하세요.","원두 추가"]
  }[locale];
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
            {copy[0]}
          </p>
          <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
            {copy[1]}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
            {copy[2]}
          </p>
        </div>
        <Link href="/beans/new" className={buttonStyles()}>
          {copy[3]}
        </Link>
      </header>

      <BeansTable beans={normalizedBeans} locale={locale} />
    </div>
  );
}
