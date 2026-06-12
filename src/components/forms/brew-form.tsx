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

type BrewFormProps = {
  beans: BeanOption[];
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

const initialState: BrewFormState = {
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

export function BrewForm({ beans }: BrewFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BrewFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const updateField = (field: keyof BrewFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const ratioLabel = useMemo(() => {
    const dose = Number(formData.doseGrams);
    const water = Number(formData.yieldMl);
    return formatRatio(dose, water);
  }, [formData.doseGrams, formData.yieldMl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrors({});

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
        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/brews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      if (!response.ok) {
        throw new Error("İşlem başarısız");
      }

      setFormData(initialState);
      setStatus("success");
      router.push("/brews");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-[rgba(75,45,23,0.14)] bg-[rgba(255,249,235,0.9)] p-6 shadow-soft"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="beanId">Çekirdek</Label>
        <Select
          id="beanId"
          value={formData.beanId}
          onChange={(event) => updateField("beanId", event.target.value)}
          required
        >
          <option value="">Seçim yapın</option>
          {beans.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.label}
            </option>
          ))}
        </Select>
        {errors.beanId && (
          <span className="text-xs text-red-600">{errors.beanId}</span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="method">Ekipman</Label>
          <Input
            id="method"
            value={formData.method}
            onChange={(event) => updateField("method", event.target.value)}
            placeholder="V60, Aeropress"
            required
          />
          {errors.method && (
            <span className="text-xs text-red-600">{errors.method}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="grindSetting">Öğütüm Ayarı</Label>
          <Input
            id="grindSetting"
            value={formData.grindSetting}
            onChange={(event) => updateField("grindSetting", event.target.value)}
            placeholder="22 Clicks"
            required
          />
          {errors.grindSetting && (
            <span className="text-xs text-red-600">{errors.grindSetting}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="doseGrams">Kahve (g)</Label>
          <Input
            id="doseGrams"
            type="number"
            min="1"
            step="0.1"
            value={formData.doseGrams}
            onChange={(event) => updateField("doseGrams", event.target.value)}
            required
          />
          {errors.doseGrams && (
            <span className="text-xs text-red-600">{errors.doseGrams}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="yieldMl">Su (ml)</Label>
          <Input
            id="yieldMl"
            type="number"
            min="1"
            step="1"
            value={formData.yieldMl}
            onChange={(event) => updateField("yieldMl", event.target.value)}
            required
          />
          {errors.yieldMl && (
            <span className="text-xs text-red-600">{errors.yieldMl}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ratio">Demleme Oranı</Label>
          <div className="flex h-12 items-center justify-between rounded-2xl border border-dashed border-[rgba(209,161,42,0.4)] bg-[rgba(209,161,42,0.12)] px-4 text-sm font-semibold text-[var(--accent-2)]">
            {ratioLabel ? `1 : ${ratioLabel.split(":")[1]}` : "—"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="waterTempC">Su Sıcaklığı (°C)</Label>
          <Input
            id="waterTempC"
            type="number"
            min="50"
            step="0.5"
            value={formData.waterTempC}
            onChange={(event) => updateField("waterTempC", event.target.value)}
            required
          />
          {errors.waterTempC && (
            <span className="text-xs text-red-600">{errors.waterTempC}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="brewTimeMin">Demleme Süresi</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="brewTimeMin"
              type="number"
              min="0"
              step="1"
              value={formData.brewTimeMin}
              onChange={(event) => updateField("brewTimeMin", event.target.value)}
              placeholder="dk"
              required
            />
            <Input
              id="brewTimeSec"
              type="number"
              min="0"
              max="59"
              step="1"
              value={formData.brewTimeSec}
              onChange={(event) => updateField("brewTimeSec", event.target.value)}
              placeholder="sn"
              required
            />
          </div>
          {(errors.brewTimeMin || errors.brewTimeSec) && (
            <span className="text-xs text-red-600">
              {errors.brewTimeMin || errors.brewTimeSec}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rating">Puan (1-10)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={(event) => updateField("rating", event.target.value)}
            placeholder="8.9"
            required
          />
          {errors.rating && (
            <span className="text-xs text-red-600">{errors.rating}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tastingNotes">Tadım Notları</Label>
        <Textarea
          id="tastingNotes"
          rows={3}
          value={formData.tastingNotes}
          onChange={(event) => updateField("tastingNotes", event.target.value)}
          placeholder="Çiçeksi, meyvemsi, canlı"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Kaydediliyor..." : "Demleme Kaydet"}
        </Button>
        {status === "success" && (
          <span className="text-sm text-green-700">
            Demleme başarıyla eklendi.
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
