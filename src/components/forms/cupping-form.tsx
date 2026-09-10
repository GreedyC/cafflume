"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";
import { cuppingCopy } from "@/lib/i18n-cupping";

type BeanOption = { id: string; label: string };
type Dimension = "fragranceAroma" | "flavor" | "aftertaste" | "acidity" | "sweetness" | "body" | "balance" | "overall";

const dimensionKeys: Dimension[] = ["fragranceAroma","flavor","aftertaste","acidity","sweetness","body","balance","overall"];

const initialScores = Object.fromEntries(dimensionKeys.map((key) => [key, 7.5])) as Record<Dimension, number>;

export function CuppingForm({ beans, locale, defaultBeanId = "" }: { beans: BeanOption[]; locale: Locale; defaultBeanId?: string }) {
  const c = cuppingCopy[locale];
  const router = useRouter();
  const [beanId, setBeanId] = useState(defaultBeanId);
  const [scores, setScores] = useState(initialScores);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const total = useMemo(() => {
    const values = Object.values(scores);
    return ((values.reduce((sum, value) => sum + value, 0) / values.length) * 10).toFixed(1);
  }, [scores]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!beanId) {
      setStatus("error");
      setMessage(c.chooseError);
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/cuppings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beanId, ...scores, notes: notes || undefined })
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? c.saveError);
      router.push("/cuppings?saved=1");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : c.saveError);
    }
  };

  return (
    <form onSubmit={submit} className="cupping-form">
      <div className="cupping-toolbar">
        <div className="min-w-0 flex-1">
          <Label htmlFor="cupping-bean">{c.coffee}</Label>
          <Select id="cupping-bean" value={beanId} onChange={(event) => setBeanId(event.target.value)}>
            <option value="">{c.choose}</option>
            {beans.map((bean) => <option key={bean.id} value={bean.id}>{bean.label}</option>)}
          </Select>
        </div>
        <div className="cupping-total" aria-live="polite">
          <span>{c.structured}</span>
          <strong>{total}</strong>
          <small>/ 100</small>
        </div>
      </div>

      <div className="cupping-dimensions">
        {dimensionKeys.map((key, index) => {
          const [label, hint] = c.dimensions[index];
          return (
          <label key={key} className="score-row">
            <span><strong>{label}</strong><small>{hint}</small></span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.25"
              value={scores[key]}
              onChange={(event) => setScores((current) => ({ ...current, [key]: Number(event.target.value) }))}
            />
            <output>{scores[key].toFixed(2)}</output>
          </label>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cupping-notes">{c.sensoryNotes}</Label>
        <Textarea id="cupping-notes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={c.placeholder} />
      </div>

      <div className="sticky-action-rail">
        <p role="status" aria-live="polite">{message || c.personalNotice}</p>
        <Button type="submit" disabled={status === "loading"}>{status === "loading" ? c.saving : c.save}</Button>
      </div>
    </form>
  );
}
