import "server-only";
import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get("brewstack-locale")?.value;
  return isLocale(value) ? value : "en";
}
