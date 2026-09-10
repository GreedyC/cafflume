"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { translator, type Locale } from "@/lib/i18n";

type Bean = {
  id: string;
  name: string;
  roaster: string;
  roastAge: string;
};

type Recipe = {
  id?: string;
  beanId: string;
  method: string;
  doseGrams: number;
  yieldMl: number;
  waterTempC: number;
  grindSetting: string;
  brewTimeMin?: number;
  brewTimeSec?: number;
};

const defaults: Omit<Recipe, "beanId"> = {
  method: "V60",
  doseGrams: 18,
  yieldMl: 300,
  waterTempC: 93,
  grindSetting: "22 clicks"
};

export function LiveBrewConsole({ beans, lastRecipe, locale }: { beans: Bean[]; lastRecipe: Recipe | null; locale: Locale }) {
  const t = translator(locale);
  const [recipe, setRecipe] = useState<Recipe>(() => lastRecipe ?? { ...defaults, beanId: beans[0]?.id ?? "" });
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem("brewstack-live-brew");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { recipe: Recipe; seconds: number; running: boolean; savedAt: number };
          setRecipe(parsed.recipe);
          setSeconds(parsed.seconds + (parsed.running ? Math.max(0, Math.floor((Date.now() - parsed.savedAt) / 1000)) : 0));
          setRunning(parsed.running);
        } catch {
          window.localStorage.removeItem("brewstack-live-brew");
        }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("brewstack-live-brew", JSON.stringify({ recipe, seconds, running, savedAt: Date.now() }));
  }, [hydrated, recipe, seconds, running]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const bean = beans.find((item) => item.id === recipe.beanId);
  const ratio = recipe.doseGrams > 0 ? (recipe.yieldMl / recipe.doseGrams).toFixed(1) : "—";
  const recipeDelta = useMemo(() => {
    if (!lastRecipe || recipe.beanId !== lastRecipe.beanId) return [];
    const fields: { key: keyof Recipe; label: string; suffix?: string }[] = [
      { key: "method", label: t("method") },
      { key: "doseGrams", label: t("dose"), suffix: " g" },
      { key: "yieldMl", label: t("water"), suffix: " ml" },
      { key: "waterTempC", label: t("temperature"), suffix: " °C" },
      { key: "grindSetting", label: t("grind") }
    ];
    return fields.flatMap(({ key, label, suffix = "" }) => recipe[key] === lastRecipe[key]
      ? []
      : [{ label, before: `${lastRecipe[key]}${suffix}`, after: `${recipe[key]}${suffix}` }]);
  }, [lastRecipe, recipe, t]);
  const finishHref = useMemo(() => {
    const query = new URLSearchParams({
      bean: recipe.beanId,
      method: recipe.method,
      dose: String(recipe.doseGrams),
      yield: String(recipe.yieldMl),
      temp: String(recipe.waterTempC),
      grind: recipe.grindSetting,
      timeMin: String(Math.floor(seconds / 60)),
      timeSec: String(seconds % 60)
    });
    return `/brews/new?${query.toString()}`;
  }, [recipe, seconds]);

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    window.localStorage.removeItem("brewstack-live-brew");
  };

  const loadLast = () => {
    if (!lastRecipe) return;
    setRecipe(lastRecipe);
    reset();
  };

  return (
    <section className="live-console" aria-labelledby="live-brew-title">
      <div className="live-console-heading">
        <div><h1 id="live-brew-title">{t("liveBrew")}</h1><p>Repeat a proven recipe or change one variable at a time.</p></div>
        {lastRecipe && <button type="button" className="text-action" onClick={loadLast}><RotateCcw size={15} /> {t("repeatLast")}</button>}
      </div>

      <div className="live-console-grid">
        <div className="bean-inspector">
          <label htmlFor="live-bean">{t("activeBean")}</label>
          <select id="live-bean" value={recipe.beanId} onChange={(event) => setRecipe((value) => ({ ...value, beanId: event.target.value }))}>
            {beans.map((item) => <option key={item.id} value={item.id}>{item.roaster} · {item.name}</option>)}
          </select>
          <strong>{bean?.name ?? "No active coffee"}</strong>
          <span>{bean ? `${bean.roaster} · roasted ${bean.roastAge} ago` : "Add a coffee to begin"}</span>
        </div>

        <div className="recipe-console">
          <div className="recipe-console-head"><h2>{t("recipe")}</h2><span>1:{ratio}</span></div>
          <div className="parameter-grid">
            <label>{t("method")}<input value={recipe.method} onChange={(event) => setRecipe((value) => ({ ...value, method: event.target.value }))} /></label>
            <label>{t("dose")} · g<input type="number" inputMode="decimal" value={recipe.doseGrams} onChange={(event) => setRecipe((value) => ({ ...value, doseGrams: Number(event.target.value) }))} /></label>
            <label>{t("water")} · ml<input type="number" inputMode="numeric" value={recipe.yieldMl} onChange={(event) => setRecipe((value) => ({ ...value, yieldMl: Number(event.target.value) }))} /></label>
            <label>{t("temperature")} · °C<input type="number" inputMode="decimal" value={recipe.waterTempC} onChange={(event) => setRecipe((value) => ({ ...value, waterTempC: Number(event.target.value) }))} /></label>
            <label>{t("grind")}<input value={recipe.grindSetting} onChange={(event) => setRecipe((value) => ({ ...value, grindSetting: event.target.value }))} /></label>
          </div>
          {lastRecipe && (
            <div className="delta-note" aria-live="polite">
              {recipe.beanId !== lastRecipe.beanId ? "New coffee selected · comparison starts after its first brew." : recipeDelta.length === 0 ? (
                <>Baseline recipe · change one field to run a controlled comparison.</>
              ) : recipeDelta.length === 1 ? (
                <><strong>{recipeDelta[0].label}</strong> · {recipeDelta[0].before} → {recipeDelta[0].after}</>
              ) : (
                <><strong>{recipeDelta.length} variables changed</strong> · return to one change for a clean comparison.</>
              )}
            </div>
          )}
        </div>

        <div className="timer-console">
          <span>{t("timer")}</span>
          <output aria-live="off">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</output>
          <div className="timer-actions">
            <button type="button" className="timer-primary" onClick={() => setRunning((value) => !value)} disabled={!recipe.beanId}>
              {running ? <Pause size={18} /> : <Play size={18} />} {running ? t("pause") : seconds ? t("resume") : t("startBrew")}
            </button>
            {seconds > 0 && <button type="button" className="timer-secondary" onClick={reset}><Square size={16} /> Reset</button>}
          </div>
          {seconds > 0 && <Link href={finishHref} className={buttonStyles({ variant: "secondary", className: "w-full" })}>{t("finishRate")}</Link>}
        </div>
      </div>
    </section>
  );
}
