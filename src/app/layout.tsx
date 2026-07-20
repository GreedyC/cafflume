import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"]
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

const description =
  "Çekirdeklerini, tariflerini ve her fincanın gelişimini tek bir demleme günlüğünde takip et.";

function safeHost(value: string | null) {
  const host = value?.split(",", 1)[0]?.trim();
  return host && /^[A-Za-z0-9.-]+(?::\d{1,5})?$/u.test(host) ? host : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    safeHost(requestHeaders.get("x-forwarded-host")) ??
    safeHost(requestHeaders.get("host")) ??
    safeHost(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null) ??
    "brewstack.vercel.app";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol === "http" && /^(?:localhost|127\.0\.0\.1)(?::|$)/u.test(host)
      ? "http"
      : "https";
  const metadataBase = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", metadataBase);

  return {
    metadataBase,
    title: {
      default: "BrewStack",
      template: "%s · BrewStack"
    },
    description,
    applicationName: "BrewStack",
    robots: {
      index: false,
      follow: false,
      nocache: true
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "BrewStack",
      title: "BrewStack · Her fincan, daha iyi bir reçete.",
      description,
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "BrewStack specialty coffee field journal"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "BrewStack · Her fincan, daha iyi bir reçete.",
      description,
      images: [socialImage]
    }
  };
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
