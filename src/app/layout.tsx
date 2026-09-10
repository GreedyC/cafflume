import type { Metadata } from "next";
import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getLocale } from "@/lib/i18n-server";

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"]
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600", "700"]
});

const description =
  "Track coffees, repeatable recipes, live brews and structured cupping sessions in one precision coffee workspace.";

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
      locale: "en_US",
      siteName: "BrewStack",
      title: "BrewStack · Measure. Brew. Learn.",
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
      title: "BrewStack · Measure. Brew. Learn.",
      description,
      images: [socialImage]
    }
  };
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${monoFont.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('brewstack-theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}"
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
</body>
    </html>
  );
}
