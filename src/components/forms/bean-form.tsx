"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { beanSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BeanFormState = {
  roaster: string;
  name: string;
  origin: string;
  variety: string;
  process: string;
  roastDate: string;
  openDate: string;
  isFinished: boolean;
};

const initialState: BeanFormState = {
  roaster: "",
  name: "",
  origin: "",
  variety: "",
  process: "",
  roastDate: "",
  openDate: "",
  isFinished: false
};

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

export function BeanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<BeanFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const updateField = (field: keyof BeanFormState, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrors({});
    setMessage("");

    const parsed = beanSchema.safeParse(formData);
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
      const response = await fetch("/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          roastDate: parsed.data.roastDate.toISOString(),
          openDate: parsed.data.openDate?.toISOString() ?? null
        })
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (response.status === 401) {
          router.replace("/login?next=%2Fbeans%2Fnew");
          return;
        }
        setMessage(result?.error ?? "Çekirdek kaydedilemedi.");
        setStatus("error");
        return;
      }
      router.push("/beans");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Bağlantı kurulamadı. Lütfen yeniden dene.");
    }
  };

  const fieldProps = (field: keyof BeanFormState) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="border-b border-[var(--border)] pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            01 · Kimlik
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Etikette ne yazıyor?
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="roaster">Kavurucu</Label>
            <Input
              id="roaster"
              autoComplete="organization"
              value={formData.roaster}
              onChange={(event) => updateField("roaster", event.target.value)}
              placeholder="Örn. Null Coffee"
              {...fieldProps("roaster")}
            />
            <FieldError field="roaster" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Çekirdek adı</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Örn. Finca El Paraiso"
              {...fieldProps("name")}
            />
            <FieldError field="name" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="origin">Menşei</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(event) => updateField("origin", event.target.value)}
              placeholder="Örn. Colombia"
              {...fieldProps("origin")}
            />
            <FieldError field="origin" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="variety">
              Varyete{" "}
              <span className="font-normal text-[var(--ink-muted)]">
                (opsiyonel)
              </span>
            </Label>
            <Input
              id="variety"
              value={formData.variety}
              onChange={(event) => updateField("variety", event.target.value)}
              placeholder="Örn. Red Bourbon"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="process">İşlem</Label>
            <Input
              id="process"
              value={formData.process}
              onChange={(event) => updateField("process", event.target.value)}
              placeholder="Örn. Washed, Natural, Anaerobic"
              {...fieldProps("process")}
            />
            <FieldError field="process" errors={errors} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <div className="border-b border-[var(--border)] pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            02 · Tazelik
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Paketin zaman çizgisi
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="roastDate">Kavrum tarihi</Label>
            <Input
              id="roastDate"
              type="date"
              value={formData.roastDate}
              onChange={(event) => updateField("roastDate", event.target.value)}
              {...fieldProps("roastDate")}
            />
            <FieldError field="roastDate" errors={errors} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="openDate">
              Paket açılışı{" "}
              <span className="font-normal text-[var(--ink-muted)]">
                (opsiyonel)
              </span>
            </Label>
            <Input
              id="openDate"
              type="date"
              value={formData.openDate}
              onChange={(event) => updateField("openDate", event.target.value)}
              {...fieldProps("openDate")}
            />
            <FieldError field="openDate" errors={errors} />
          </div>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 sm:col-span-2">
            <input
              id="isFinished"
              type="checkbox"
              checked={formData.isFinished}
              onChange={(event) =>
                updateField("isFinished", event.target.checked)
              }
              className="h-5 w-5 accent-[var(--accent)]"
            />
            <span className="text-sm font-semibold">
              Paketi arşivde başlat
            </span>
          </label>
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
            : "Bilgileri daha sonra paket detayından izleyebilirsin."}
        </p>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Kaydediliyor…" : "Çekirdeği kaydet"}
        </Button>
      </div>
    </form>
  );
}
