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

export function BeanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<BeanFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const updateField = (field: keyof BeanFormState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrors({});

    const parsed = beanSchema.safeParse({
      ...formData,
      roastDate: formData.roastDate,
      openDate: formData.openDate
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          roastDate: parsed.data.roastDate.toISOString(),
          openDate: parsed.data.openDate
            ? parsed.data.openDate.toISOString()
            : null
        })
      });

      if (!response.ok) {
        throw new Error("İşlem başarısız");
      }

      setFormData(initialState);
      setStatus("success");
      router.push("/beans");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-[rgba(75,45,23,0.14)] bg-[rgba(255,249,235,0.9)] p-6 shadow-soft"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="roaster">Kavurucu</Label>
          <Input
            id="roaster"
            value={formData.roaster}
            onChange={(event) => updateField("roaster", event.target.value)}
            placeholder="Kavurucu adı"
            required
          />
          {errors.roaster && (
            <span className="text-xs text-red-600">{errors.roaster}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Çekirdek Adı</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Etiyopya Yirgacheffe"
            required
          />
          {errors.name && (
            <span className="text-xs text-red-600">{errors.name}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="origin">Menşei</Label>
          <Input
            id="origin"
            value={formData.origin}
            onChange={(event) => updateField("origin", event.target.value)}
            placeholder="Kolombiya"
            required
          />
          {errors.origin && (
            <span className="text-xs text-red-600">{errors.origin}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="variety">Varyete</Label>
          <Input
            id="variety"
            value={formData.variety}
            onChange={(event) => updateField("variety", event.target.value)}
            placeholder="Geisha"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="process">İşlem</Label>
          <Input
            id="process"
            value={formData.process}
            onChange={(event) => updateField("process", event.target.value)}
            placeholder="Natural"
            required
          />
          {errors.process && (
            <span className="text-xs text-red-600">{errors.process}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="roastDate">Kavrum Tarihi</Label>
          <Input
            id="roastDate"
            type="date"
            value={formData.roastDate}
            onChange={(event) => updateField("roastDate", event.target.value)}
            required
          />
          {errors.roastDate && (
            <span className="text-xs text-red-600">{errors.roastDate}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="openDate">Paket Açılış Tarihi</Label>
          <Input
            id="openDate"
            type="date"
            value={formData.openDate}
            onChange={(event) => updateField("openDate", event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            id="isFinished"
            type="checkbox"
            checked={formData.isFinished}
            onChange={(event) => updateField("isFinished", event.target.checked)}
            className="h-5 w-5 rounded border-[rgba(75,45,23,0.2)] text-[var(--accent)]"
          />
          <Label htmlFor="isFinished">Paket bitti olarak işaretle</Label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Kaydediliyor..." : "Çekirdek Ekle"}
        </Button>
        {status === "success" && (
          <span className="text-sm text-green-700">
            Çekirdek başarıyla eklendi.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600">
            Lütfen alanları kontrol edin.
          </span>
        )}
      </div>
    </form>
  );
}
