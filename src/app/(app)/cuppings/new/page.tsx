import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import { idSchema } from "@/lib/validations";
import { CuppingForm } from "@/components/forms/cupping-form";
import { getLocale } from "@/lib/i18n-server";
import { cuppingCopy } from "@/lib/i18n-cupping";

export const dynamic = "force-dynamic";

export default async function NewCuppingPage({ searchParams }: { searchParams: Promise<{ bean?: SearchParamValue }> }) {
  const user = await requirePageUser();
  const locale = await getLocale();
  const c = cuppingCopy[locale];
  const params = await searchParams;
  const parsedBean = idSchema.safeParse(firstSearchParam(params.bean));
  const beans = await prisma.bean.findMany({ where: { userId: user.id, isFinished: false }, orderBy: { roastDate: "desc" } });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <header className="page-header">
        <Link href="/cuppings" className="back-link">← {c.back}</Link>
        <h1>{c.newTitle}</h1>
        <p>{c.newIntro}</p>
      </header>
      {beans.length ? (
        <CuppingForm locale={locale} beans={beans.map((bean) => ({ id: bean.id, label: `${bean.roaster} · ${bean.name}` }))} defaultBeanId={parsedBean.success ? parsedBean.data : ""} />
      ) : (
        <div className="empty-panel"><h2>{c.addFirst}</h2><p>{c.addFirstHint}</p><Link href="/beans/new">{c.addCoffee}</Link></div>
      )}
    </div>
  );
}
