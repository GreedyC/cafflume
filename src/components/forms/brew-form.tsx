"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brewLogSchema } from "@/lib/validations";
import { formatRatio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { translator, type Locale } from "@/lib/i18n";

type BeanOption = {
  id: string;
  label: string;
};

type BrewFormState = {
  beanId: string;
  method: string;
  doseGrams: string;
  yieldMl: string;
  waterTempC: string;
  grindSetting: string;
  brewTimeMin: string;
  brewTimeSec: string;
  rating: string;
  tastingNotes: string;
};

type BrewFormProps = {
  beans: BeanOption[];
  initialValues?: Partial<BrewFormState>;
  sourceRating?: number;
  locale: Locale;
};

const blankState: BrewFormState = {
  beanId: "",
  method: "",
  doseGrams: "",
  yieldMl: "",
  waterTempC: "",
  grindSetting: "",
  brewTimeMin: "",
  brewTimeSec: "",
  rating: "",
  tastingNotes: ""
};

const methodPresets = ["V60", "Hario Switch", "Aeropress", "Chemex"];

function FieldError({
  field,
  errors
}: {
  field: string;
  errors: Record<string, string>;
}) {
  if (!errors[field]) return null;
  return (
    <span id={`${field}-error`} className="text-xs font-semibold text-[var(--danger)]">
      {errors[field]}
    </span>
  );
}

export function BrewForm({
  beans,
  initialValues,
  sourceRating,
  locale
}: BrewFormProps) {
  const t=translator(locale);
  const c={en:["Check the highlighted fields.","Could not connect. Please try again.","Choose an active coffee","Method / brewer","Method suggestions","Grind setting","Coffee dose (g)","Water / yield (ml)","Brew ratio","Brew time","Minutes","Seconds","Personal score (1–10)","Aroma, acidity, sweetness, body and finish…","Saving…","Save brew"],tr:["İşaretli alanları kontrol et.","Bağlantı kurulamadı. Lütfen tekrar dene.","Aktif çekirdek seç","Yöntem / demleyici","Yöntem önerileri","Öğütüm ayarı","Kahve dozu (g)","Su / çıktı (ml)","Demleme oranı","Demleme süresi","Dakika","Saniye","Kişisel puan (1–10)","Aroma, asidite, tatlılık, gövde ve bitiş…","Kaydediliyor…","Demlemeyi kaydet"],es:["Revisa los campos marcados.","No se pudo conectar. Inténtalo de nuevo.","Elige un café activo","Método / cafetera","Sugerencias de método","Ajuste de molienda","Dosis de café (g)","Agua / resultado (ml)","Proporción de preparación","Tiempo de preparación","Minutos","Segundos","Puntuación personal (1–10)","Aroma, acidez, dulzor, cuerpo y final…","Guardando…","Guardar preparación"],de:["Markierte Felder prüfen.","Verbindung fehlgeschlagen. Bitte erneut versuchen.","Aktiven Kaffee wählen","Methode / Brüher","Methodenvorschläge","Mahlgradeinstellung","Kaffeedosis (g)","Wasser / Ausbeute (ml)","Brühverhältnis","Brühzeit","Minuten","Sekunden","Persönliche Wertung (1–10)","Aroma, Säure, Süße, Körper und Abgang…","Speichern…","Brühung speichern"],no:["Kontroller de markerte feltene.","Kunne ikke koble til. Prøv igjen.","Velg en aktiv kaffe","Metode / brygger","Metodeforslag","Kverningsgrad","Kaffedose (g)","Vann / utbytte (ml)","Bryggeforhold","Bryggetid","Minutter","Sekunder","Personlig poeng (1–10)","Aroma, syrlighet, sødme, kropp og avslutning…","Lagrer…","Lagre brygg"],ja:["強調表示された項目を確認してください。","接続できませんでした。もう一度お試しください。","使用中のコーヒーを選択","方法 / 器具","方法の候補","挽き目設定","コーヒー量 (g)","湯量 / 抽出量 (ml)","抽出比率","抽出時間","分","秒","個人スコア (1–10)","香り、酸味、甘さ、質感、後味…","保存中…","抽出を保存"],ko:["강조된 항목을 확인하세요.","연결할 수 없습니다. 다시 시도하세요.","활성 원두 선택","방식 / 도구","방식 추천","분쇄도 설정","원두 투입량 (g)","물 / 추출량 (ml)","추출 비율","추출 시간","분","초","개인 점수 (1–10)","향, 산미, 단맛, 바디, 여운…","저장 중…","추출 저장"]}[locale];
  const router = useRouter();
  const [formData, setFormData] = useState<BrewFormState>(() => ({
    ...blankState,
    ...initialValues
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem("brewstack-brew-draft");
      if (saved && !initialValues?.beanId) {
        try { setFormData((current) => ({ ...current, ...(JSON.parse(saved) as BrewFormState) })); } catch { window.localStorage.removeItem("brewstack-brew-draft"); }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, [initialValues?.beanId]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("brewstack-brew-draft", JSON.stringify(formData));
  }, [formData, hydrated]);

  const updateField = (field: keyof BrewFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const ratioLabel = useMemo(
    () => formatRatio(Number(formData.doseGrams), Number(formData.yieldMl)),
    [formData.doseGrams, formData.yieldMl]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrors({});
    setMessage("");

    const parsed = brewLogSchema.safeParse({
      beanId: formData.beanId,
      method: formData.method,
      doseGrams: Number(formData.doseGrams),
      yieldMl: Number(formData.yieldMl),
      waterTempC: Number(formData.waterTempC),
      grindSetting: formData.grindSetting,
      brewTimeMin: Number(formData.brewTimeMin),
      brewTimeSec: Number(formData.brewTimeSec),
      rating: Number(formData.rating),
      tastingNotes: formData.tastingNotes || undefined
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setStatus("error");
      setMessage(c[0]);
      const firstField = Object.keys(fieldErrors)[0];
      window.setTimeout(() => document.getElementById(firstField)?.focus(), 0);
      return;
    }

    try {
      const response = await fetch("/api/brews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (response.status === 401) {
          router.replace("/login?next=%2Fbrews%2Fnew");
          return;
        }
        setMessage(result?.error ?? "Brew could not be saved.");
        setStatus("error");
        return;
      }
      router.push("/brews");
      window.localStorage.removeItem("brewstack-brew-draft");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage(c[1]);
    }
  };

  const fieldProps = (field: keyof BrewFormState) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="border-b border-[var(--border)] pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Coffee and method
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Brew setup
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="beanId">{t("activeBean")}</Label>
            <Select
              id="beanId"
              value={formData.beanId}
              onChange={(event) => updateField("beanId", event.target.value)}
              {...fieldProps("beanId")}
            >
              <option value="">{c[2]}</option>
              {beans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.label}
                </option>
              ))}
            </Select>
            <FieldError field="beanId" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="method">{c[3]}</Label>
            <Input
              id="method"
              value={formData.method}
              onChange={(event) => updateField("method", event.target.value)}
              placeholder="e.g. V60"
              {...fieldProps("method")}
            />
            <div className="flex flex-wrap gap-1.5" aria-label={c[4]}>
              {methodPresets.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updateField("method", method)}
                  className="min-h-9 rounded-lg border border-[var(--border)] px-2.5 text-[11px] font-bold text-[var(--ink-muted)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {method}
                </button>
              ))}
            </div>
            <FieldError field="method" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="grindSetting">{c[5]}</Label>
            <Input
              id="grindSetting"
              value={formData.grindSetting}
              onChange={(event) =>
                updateField("grindSetting", event.target.value)
              }
              placeholder="e.g. 22 clicks"
              {...fieldProps("grindSetting")}
            />
            <FieldError field="grindSetting" errors={errors} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="border-b border-[var(--border)] pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Recipe
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Measured variables
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="doseGrams">{c[6]}</Label>
            <Input
              id="doseGrams"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={formData.doseGrams}
              onChange={(event) => updateField("doseGrams", event.target.value)}
              placeholder="16"
              {...fieldProps("doseGrams")}
            />
            <FieldError field="doseGrams" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="yieldMl">{c[7]}</Label>
            <Input
              id="yieldMl"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={formData.yieldMl}
              onChange={(event) => updateField("yieldMl", event.target.value)}
              placeholder="250"
              {...fieldProps("yieldMl")}
            />
            <FieldError field="yieldMl" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">{c[8]}</span>
            <output
              id="ratio"
              aria-live="polite"
              htmlFor="doseGrams yieldMl"
              className="flex min-h-12 items-center rounded-xl border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] px-4 text-lg font-bold text-[var(--accent-strong)] tabular-nums"
            >
              {ratioLabel ?? "—"}
            </output>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="waterTempC">{t("temperature")} (°C)</Label>
            <Input
              id="waterTempC"
              type="number"
              inputMode="decimal"
              min="50"
              step="0.5"
              value={formData.waterTempC}
              onChange={(event) =>
                updateField("waterTempC", event.target.value)
              }
              placeholder="93"
              {...fieldProps("waterTempC")}
            />
            <FieldError field="waterTempC" errors={errors} />
          </div>
          <fieldset className="flex flex-col gap-2 lg:col-span-2">
            <legend className="text-sm font-semibold">{c[9]}</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="brewTimeMin" className="sr-only">
                  Dakika
                </Label>
                <Input
                  id="brewTimeMin"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={formData.brewTimeMin}
                  onChange={(event) =>
                    updateField("brewTimeMin", event.target.value)
                  }
                  placeholder={c[10]}
                  {...fieldProps("brewTimeMin")}
                />
              </div>
              <div>
                <Label htmlFor="brewTimeSec" className="sr-only">
                  Saniye
                </Label>
                <Input
                  id="brewTimeSec"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  step="1"
                  value={formData.brewTimeSec}
                  onChange={(event) =>
                    updateField("brewTimeSec", event.target.value)
                  }
                  placeholder={c[11]}
                  {...fieldProps("brewTimeSec")}
                />
              </div>
            </div>
            <FieldError
              field={errors.brewTimeMin ? "brewTimeMin" : "brewTimeSec"}
              errors={errors}
            />
          </fieldset>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="border-b border-[var(--border)] pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Result
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Taste and personal score
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rating">{c[12]}</Label>
            <Input
              id="rating"
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.1"
              value={formData.rating}
              onChange={(event) => updateField("rating", event.target.value)}
              placeholder="8.5"
              {...fieldProps("rating")}
            />
            {sourceRating && (
              <p className="text-[11px] text-[var(--ink-muted)]">
                Previous result: {sourceRating.toLocaleString("en-US")}/10
              </p>
            )}
            <FieldError field="rating" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tastingNotes">
              Tasting notes{" "}
              <span className="font-normal text-[var(--ink-muted)]">
                (optional)
              </span>
            </Label>
            <Textarea
              id="tastingNotes"
              rows={4}
              value={formData.tastingNotes}
              onChange={(event) =>
                updateField("tastingNotes", event.target.value)
              }
              placeholder={c[13]}
              {...fieldProps("tastingNotes")}
            />
            <FieldError field="tastingNotes" errors={errors} />
          </div>
        </div>
      </section>

      <div className="sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[rgba(255,253,248,0.94)] p-3 shadow-xl backdrop-blur lg:bottom-4">
        <p
          role="status"
          aria-live="polite"
          className="text-xs text-[var(--ink-muted)]"
        >
          {status === "error"
            ? message || "Could not save."
            : ratioLabel
              ? `Calculated ratio ${ratioLabel} · draft saved automatically`
              : "Enter dose and water to calculate the ratio. Draft saves automatically."}
        </p>
        <div className="flex items-center gap-2"><Link href="/" className="text-action">{t("cancel")}</Link><Button type="submit" disabled={status === "loading"}>{status === "loading" ? c[14] : c[15]}</Button></div>
      </div>
    </form>
  );
}
