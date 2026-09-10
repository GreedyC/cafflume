"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type BeanOption = { id: string; label: string };
type Dimension = "fragranceAroma" | "flavor" | "aftertaste" | "acidity" | "sweetness" | "body" | "balance" | "overall";

const dimensions: { key: Dimension; label: string; hint: string }[] = [
  { key: "fragranceAroma", label: "Fragrance / aroma", hint: "Dry fragrance and wet aroma" },
  { key: "flavor", label: "Flavor", hint: "Quality, intensity and character" },
  { key: "aftertaste", label: "Aftertaste", hint: "Length and quality of the finish" },
  { key: "acidity", label: "Acidity", hint: "Brightness, structure and quality" },
  { key: "sweetness", label: "Sweetness", hint: "Perceived sweetness and ripeness" },
  { key: "body", label: "Body", hint: "Weight and tactile quality" },
  { key: "balance", label: "Balance", hint: "How the attributes work together" },
  { key: "overall", label: "Overall", hint: "Your holistic impression" }
];

const initialScores = Object.fromEntries(dimensions.map(({ key }) => [key, 7.5])) as Record<Dimension, number>;

export function CuppingForm({ beans, defaultBeanId = "" }: { beans: BeanOption[]; defaultBeanId?: string }) {
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
      setMessage("Choose a coffee before saving the cupping.");
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
      if (!response.ok) throw new Error(result?.error ?? "Cupping could not be saved.");
      router.push("/cuppings?saved=1");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cupping could not be saved.");
    }
  };

  return (
    <form onSubmit={submit} className="cupping-form">
      <div className="cupping-toolbar">
        <div className="min-w-0 flex-1">
          <Label htmlFor="cupping-bean">Coffee</Label>
          <Select id="cupping-bean" value={beanId} onChange={(event) => setBeanId(event.target.value)}>
            <option value="">Choose an active coffee</option>
            {beans.map((bean) => <option key={bean.id} value={bean.id}>{bean.label}</option>)}
          </Select>
        </div>
        <div className="cupping-total" aria-live="polite">
          <span>Structured score</span>
          <strong>{total}</strong>
          <small>/ 100</small>
        </div>
      </div>

      <div className="cupping-dimensions">
        {dimensions.map(({ key, label, hint }) => (
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
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cupping-notes">Sensory notes</Label>
        <Textarea id="cupping-notes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Fragrance, flavor development, finish, defects and observations…" />
      </div>

      <div className="sticky-action-rail">
        <p role="status" aria-live="polite">{message || "Scores are saved as a structured personal evaluation, not an official SCA score."}</p>
        <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "Saving…" : "Save cupping"}</Button>
      </div>
    </form>
  );
}
