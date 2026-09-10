import { AppShell } from "@/components/layout/app-shell";
import { requirePageUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, locale] = await Promise.all([requirePageUser(), getLocale()]);
  return <AppShell user={user} locale={locale}>{children}</AppShell>;
}
