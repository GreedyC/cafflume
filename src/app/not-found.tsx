import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          404 · Kayıt bulunamadı
        </p>
        <h1 className="display-title mt-3 text-4xl font-semibold">
          Bu sayfa günlükte yok.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
          Kayıt silinmiş veya bağlantı değişmiş olabilir.
        </p>
        <Link href="/" className={buttonStyles({ className: "mt-6" })}>
          Genel bakışa dön
        </Link>
      </div>
    </div>
  );
}
