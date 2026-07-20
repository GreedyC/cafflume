import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrewForm } from "@/components/forms/brew-form";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import { idSchema } from "@/lib/validations";
import { requirePageUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    from?: SearchParamValue;
    bean?: SearchParamValue;
  }>;
};

export default async function NewBrewPage({ searchParams }: Props) {
  await requirePageUser();
  const resolvedSearchParams = await searchParams;
  const sourceIdResult = idSchema.safeParse(
    firstSearchParam(resolvedSearchParams.from)
  );
  const requestedBeanIdResult = idSchema.safeParse(
    firstSearchParam(resolvedSearchParams.bean)
  );
  const sourceId = sourceIdResult.success ? sourceIdResult.data : undefined;
  const requestedBeanId = requestedBeanIdResult.success
    ? requestedBeanIdResult.data
    : undefined;
  const [beans, sourceBrew] = await Promise.all([
    prisma.bean.findMany({
      where: { isFinished: false },
      orderBy: { roastDate: "desc" }
    }),
    sourceId
      ? prisma.brewLog.findUnique({
          where: { id: sourceId },
          include: { bean: true }
        })
      : null
  ]);
  const repeatSource =
    sourceBrew && !sourceBrew.bean.isFinished ? sourceBrew : null;

  const options = beans.map((bean) => ({
    id: bean.id,
    label: `${bean.roaster} · ${bean.name}`
  }));
  const requestedBeanCandidate = repeatSource?.beanId ?? requestedBeanId ?? "";
  const requestedBean = options.some(
    (option) => option.id === requestedBeanCandidate
  )
    ? requestedBeanCandidate
    : "";
  const initialValues = repeatSource
    ? {
        beanId: repeatSource.beanId,
        method: repeatSource.method,
        doseGrams: String(repeatSource.doseGrams),
        yieldMl: String(repeatSource.yieldMl),
        waterTempC: String(repeatSource.waterTempC),
        grindSetting: repeatSource.grindSetting,
        brewTimeMin: String(repeatSource.brewTimeMin),
        brewTimeSec: String(repeatSource.brewTimeSec),
        rating: "",
        tastingNotes: ""
      }
    : { beanId: requestedBean };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <header className="journal-rule pb-6">
        <Link
          href="/brews"
          className="text-xs font-bold text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          ← Demleme günlüğüne dön
        </Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          {repeatSource ? "Tarifi yeniden yorumla" : "Yeni kayıt"} · 02
        </p>
        <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
          {repeatSource ? "Aynı reçete, yeni fincan." : "Demlemeyi kaydet"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          {repeatSource
            ? `${repeatSource.bean.roaster} · ${repeatSource.bean.name} için önceki değerleri getirdik. Sonucu karşılaştırmak için puan ve tadım notunu yeniden gir.`
            : "Çekirdeği ve yöntemi seç; reçete değerlerini ve fincandaki sonucu tek kayıtta birleştir."}
        </p>
      </header>

      {options.length ? (
        <BrewForm
          beans={options}
          initialValues={initialValues}
          sourceRating={repeatSource?.rating}
        />
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="display-title text-3xl font-semibold">
            Önce aktif bir çekirdek gerekli.
          </p>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Demleme reçetesini bağlayabilmek için envantere bir paket ekle.
          </p>
          <Link
            href="/beans/new"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white"
          >
            Çekirdek ekle
          </Link>
        </div>
      )}
    </div>
  );
}
