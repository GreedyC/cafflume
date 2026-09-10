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
    method?: SearchParamValue;
    dose?: SearchParamValue;
    yield?: SearchParamValue;
    temp?: SearchParamValue;
    grind?: SearchParamValue;
    timeMin?: SearchParamValue;
    timeSec?: SearchParamValue;
  }>;
};

export default async function NewBrewPage({ searchParams }: Props) {
  const user = await requirePageUser();
  const resolvedSearchParams = await searchParams;
  const sourceIdResult = idSchema.safeParse(
    firstSearchParam(resolvedSearchParams.from)
  );
  const requestedBeanIdResult = idSchema.safeParse(
    firstSearchParam(resolvedSearchParams.bean)
  );
  const incoming = {
    method: firstSearchParam(resolvedSearchParams.method)?.slice(0, 80),
    doseGrams: firstSearchParam(resolvedSearchParams.dose),
    yieldMl: firstSearchParam(resolvedSearchParams.yield),
    waterTempC: firstSearchParam(resolvedSearchParams.temp),
    grindSetting: firstSearchParam(resolvedSearchParams.grind)?.slice(0, 120),
    brewTimeMin: firstSearchParam(resolvedSearchParams.timeMin),
    brewTimeSec: firstSearchParam(resolvedSearchParams.timeSec)
  };
  const sourceId = sourceIdResult.success ? sourceIdResult.data : undefined;
  const requestedBeanId = requestedBeanIdResult.success
    ? requestedBeanIdResult.data
    : undefined;
  const [beans, sourceBrew] = await Promise.all([
    prisma.bean.findMany({
      where: { userId: user.id, isFinished: false },
      orderBy: { roastDate: "desc" }
    }),
    sourceId
      ? prisma.brewLog.findFirst({
          where: { id: sourceId, userId: user.id },
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
    : {
        beanId: requestedBean,
        ...(incoming.method ? { method: incoming.method } : {}),
        ...(incoming.doseGrams ? { doseGrams: incoming.doseGrams } : {}),
        ...(incoming.yieldMl ? { yieldMl: incoming.yieldMl } : {}),
        ...(incoming.waterTempC ? { waterTempC: incoming.waterTempC } : {}),
        ...(incoming.grindSetting ? { grindSetting: incoming.grindSetting } : {}),
        ...(incoming.brewTimeMin ? { brewTimeMin: incoming.brewTimeMin } : {}),
        ...(incoming.brewTimeSec ? { brewTimeSec: incoming.brewTimeSec } : {})
      };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
      <header className="journal-rule pb-6">
        <Link
          href="/brews"
          className="text-xs font-bold text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          ← Brew log
        </Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          {repeatSource ? "Repeat recipe" : "New record"}
        </p>
        <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
          {repeatSource ? "Same recipe, new cup." : "Record a brew"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          {repeatSource
            ? `Previous values for ${repeatSource.bean.roaster} · ${repeatSource.bean.name} are ready. Change one variable and compare the result.`
            : "Your live-brew recipe is prefilled. Review the result, add a personal score and save."}
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
            Add an active coffee first.
          </p>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            A brew record must be linked to a coffee in your library.
          </p>
          <Link
            href="/beans/new"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white"
          >
            Add coffee
          </Link>
        </div>
      )}
    </div>
  );
}
