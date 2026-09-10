import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import { idSchema } from "@/lib/validations";
import { CuppingForm } from "@/components/forms/cupping-form";

export const dynamic = "force-dynamic";

export default async function NewCuppingPage({ searchParams }: { searchParams: Promise<{ bean?: SearchParamValue }> }) {
  const user = await requirePageUser();
  const params = await searchParams;
  const parsedBean = idSchema.safeParse(firstSearchParam(params.bean));
  const beans = await prisma.bean.findMany({ where: { userId: user.id, isFinished: false }, orderBy: { roastDate: "desc" } });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <header className="page-header">
        <Link href="/cuppings" className="back-link">← Cupping sessions</Link>
        <h1>New cupping</h1>
        <p>Evaluate one coffee across eight sensory dimensions. This is a structured personal score, not an official SCA protocol.</p>
      </header>
      {beans.length ? (
        <CuppingForm beans={beans.map((bean) => ({ id: bean.id, label: `${bean.roaster} · ${bean.name}` }))} defaultBeanId={parsedBean.success ? parsedBean.data : ""} />
      ) : (
        <div className="empty-panel"><h2>Add a coffee first</h2><p>A cupping session must be linked to a coffee in your library.</p><Link href="/beans/new">Add coffee</Link></div>
      )}
    </div>
  );
}
