import { Gamepad2 } from "lucide-react";
import { Coffee2048 } from "@/components/game/coffee-2048";
import { requirePageUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { gameCopy } from "@/lib/i18n-game";

export default async function PlayPage() {
  await requirePageUser();
  const locale = await getLocale();
  const c = gameCopy[locale];

  return (
    <div className="flex flex-col gap-7">
      <header className="journal-rule flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="panel-kicker">{c.kicker}</p>
          <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            {c.intro}
          </p>
        </div>
        <span className="hidden h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] sm:grid">
          <Gamepad2 size={24} />
        </span>
      </header>
      <Coffee2048 locale={locale} />
    </div>
  );
}
