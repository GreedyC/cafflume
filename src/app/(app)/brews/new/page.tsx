import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrewForm } from "@/components/forms/brew-form";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import { idSchema } from "@/lib/validations";
import { requirePageUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";

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
  const locale = await getLocale();
  const c={en:["Brew log","Repeat recipe","New record","Same recipe, new cup.","Record a brew","Previous values are ready. Change one variable and compare the result.","Your live-brew recipe is prefilled. Review the result, add a personal score and save.","Add an active coffee first.","A brew record must be linked to a coffee in your library.","Add coffee"],tr:["Demleme günlüğü","Reçeteyi tekrarla","Yeni kayıt","Aynı reçete, yeni fincan.","Demleme kaydet","Önceki değerler hazır. Tek değişkeni değiştir ve sonucu karşılaştır.","Canlı demleme reçeten hazır. Sonucu kontrol et, kişisel puan ekle ve kaydet.","Önce aktif bir çekirdek ekle.","Demleme kaydı kütüphanendeki bir çekirdeğe bağlı olmalıdır.","Çekirdek ekle"],es:["Registro de preparaciones","Repetir receta","Nuevo registro","Misma receta, nueva taza.","Registrar preparación","Los valores anteriores están listos. Cambia una variable y compara el resultado.","La receta en vivo está precargada. Revisa el resultado, añade tu puntuación y guarda.","Primero añade un café activo.","La preparación debe estar vinculada a un café de tu biblioteca.","Añadir café"],de:["Brühprotokoll","Rezept wiederholen","Neuer Eintrag","Gleiches Rezept, neue Tasse.","Brühung erfassen","Die vorherigen Werte sind bereit. Eine Variable ändern und vergleichen.","Das Live-Rezept ist vorausgefüllt. Ergebnis prüfen, persönlich bewerten und speichern.","Zuerst einen aktiven Kaffee hinzufügen.","Eine Brühung muss mit einem Kaffee deiner Sammlung verknüpft sein.","Kaffee hinzufügen"],no:["Bryggelogg","Gjenta oppskrift","Ny oppføring","Samme oppskrift, ny kopp.","Registrer brygg","Tidligere verdier er klare. Endre én variabel og sammenlign resultatet.","Oppskriften fra aktivt brygg er fylt ut. Vurder resultatet, gi poeng og lagre.","Legg til en aktiv kaffe først.","Et brygg må knyttes til en kaffe i biblioteket.","Legg til kaffe"],ja:["抽出記録","レシピを再現","新規記録","同じレシピ、新しい一杯。","抽出を記録","前回の値を用意しました。一項目を変更して結果を比較してください。","ライブ抽出のレシピを入力済みです。結果を確認し、個人スコアを付けて保存します。","先に使用中のコーヒーを追加してください。","抽出記録はライブラリ内のコーヒーに紐づける必要があります。","コーヒーを追加"],ko:["추출 기록","레시피 반복","새 기록","같은 레시피, 새로운 한 잔.","추출 기록","이전 값이 준비되었습니다. 변수 하나를 바꾸고 결과를 비교하세요.","라이브 추출 레시피가 입력되어 있습니다. 결과를 확인하고 개인 점수를 추가해 저장하세요.","먼저 활성 원두를 추가하세요.","추출 기록은 라이브러리의 원두와 연결되어야 합니다.","원두 추가"]}[locale];
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
          ← {c[0]}
        </Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          {repeatSource ? c[1] : c[2]}
        </p>
        <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
          {repeatSource ? c[3] : c[4]}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          {repeatSource
            ? `${repeatSource.bean.roaster} · ${repeatSource.bean.name} — ${c[5]}`
            : c[6]}
        </p>
      </header>

      {options.length ? (
        <BrewForm
          beans={options}
          initialValues={initialValues}
          sourceRating={repeatSource?.rating}
          locale={locale}
        />
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="display-title text-3xl font-semibold">
            {c[7]}
          </p>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            {c[8]}
          </p>
          <Link
            href="/beans/new"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white"
          >
            {c[9]}
          </Link>
        </div>
      )}
    </div>
  );
}
