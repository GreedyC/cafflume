"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { brewLogSchema } from "@/lib/validations";
import { formatRatio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  sourceRating
}: BrewFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BrewFormState>(() => ({
    ...blankState,
    ...initialValues
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

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
      setMessage("İşaretli alanları kontrol et.");
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
        setMessage(result?.error ?? "Demleme kaydedilemedi.");
        setStatus("error");
        return;
      }
      router.push("/brews");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Bağlantı kurulamadı. Lütfen yeniden dene.");
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
            01 · Çekirdek ve yöntem
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Fincanın temeli
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="beanId">Çekirdek</Label>
            <Select
              id="beanId"
              value={formData.beanId}
              onChange={(event) => updateField("beanId", event.target.value)}
              {...fieldProps("beanId")}
            >
              <option value="">Aktif paket seç</option>
              {beans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.label}
                </option>
              ))}
            </Select>
            <FieldError field="beanId" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="method">Yöntem / ekipman</Label>
            <Input
              id="method"
              value={formData.method}
              onChange={(event) => updateField("method", event.target.value)}
              placeholder="Örn. V60"
              {...fieldProps("method")}
            />
            <div className="flex flex-wrap gap-1.5" aria-label="Yöntem önerileri">
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
            <Label htmlFor="grindSetting">Öğütüm ayarı</Label>
            <Input
              id="grindSetting"
              value={formData.grindSetting}
              onChange={(event) =>
                updateField("grindSetting", event.target.value)
              }
              placeholder="Örn. 22 click"
              {...fieldProps("grindSetting")}
            />
            <FieldError field="grindSetting" errors={errors} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="border-b border-[var(--border)] pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            02 · Reçete
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Ölçülebilir değişkenler
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="doseGrams">Kahve dozu (g)</Label>
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
            <Label htmlFor="yieldMl">Su miktarı (ml)</Label>
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
            <span className="text-sm font-semibold">Demleme oranı</span>
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
            <Label htmlFor="waterTempC">Su sıcaklığı (°C)</Label>
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
            <legend className="text-sm font-semibold">Demleme süresi</legend>
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
                  placeholder="Dakika"
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
                  placeholder="Saniye"
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
            03 · Fincandaki sonuç
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Tadım ve puan
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rating">Puan (1–10)</Label>
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
                Önceki sonuç: {sourceRating.toLocaleString("tr-TR")}/10
              </p>
            )}
            <FieldError field="rating" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tastingNotes">
              Tadım notları{" "}
              <span className="font-normal text-[var(--ink-muted)]">
                (opsiyonel)
              </span>
            </Label>
            <Textarea
              id="tastingNotes"
              rows={4}
              value={formData.tastingNotes}
              onChange={(event) =>
                updateField("tastingNotes", event.target.value)
              }
              placeholder="Aroma, asidite, tatlılık, gövde ve bitiş…"
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
            ? message || "Kaydedilemedi."
            : ratioLabel
              ? `Hesaplanan oran ${ratioLabel}`
              : "Doz ve suyu girince oran otomatik hesaplanır."}
        </p>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Kaydediliyor…" : "Demlemeyi kaydet"}
        </Button>
      </div>
    </form>
  );
}
