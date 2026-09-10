import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n";

const localeTags: Record<Locale, string> = { en: "en-US", tr: "tr-TR", es: "es-ES", de: "de-DE", no: "nb-NO", ja: "ja-JP", ko: "ko-KR" };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: Date | string | null, locale: Locale = "en") {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(value?: Date | string | null, locale: Locale = "en") {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

export function formatNumber(value: number, decimals = 0, locale: Locale = "en") {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeTags[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatRatio(doseGrams: number, yieldMl: number) {
  if (!Number.isFinite(doseGrams) || !Number.isFinite(yieldMl)) return null;
  if (doseGrams <= 0 || yieldMl <= 0) return null;
  const ratio = Math.round((yieldMl / doseGrams) * 10) / 10;
  const label = Number.isInteger(ratio) ? ratio.toString() : ratio.toFixed(1);
  return `1:${label}`;
}

export function formatDaysSince(value?: Date | string | null, locale: Locale = "en") {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  if (diff < 0) return "—";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return new Intl.RelativeTimeFormat(localeTags[locale], { numeric: "always" }).format(-days, "day");
}

export function formatDuration(totalSeconds: number, locale: Locale = "en") {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return formatDurationParts(minutes, seconds, locale);
}

export function formatDurationParts(minutes: number, seconds: number, locale: Locale = "en") {
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return "—";
  if (minutes < 0 || seconds < 0) return "—";
  const safeMinutes = Math.floor(minutes);
  const safeSeconds = Math.min(59, Math.floor(seconds));
  return `${new Intl.NumberFormat(localeTags[locale], { style: "unit", unit: "minute", unitDisplay: "short" }).format(safeMinutes)} ${new Intl.NumberFormat(localeTags[locale], { style: "unit", unit: "second", unitDisplay: "short" }).format(safeSeconds)}`;
}
