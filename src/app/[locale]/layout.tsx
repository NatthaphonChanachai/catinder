import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Thai, Cinzel } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { XPToastProvider } from "@/components/shared/xp-toast";
import { AuthProvider } from "@/contexts/auth-context";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Thai is the default locale — Plus Jakarta Sans has no Thai glyphs, so pair it
// with Noto Sans Thai as an automatic per-glyph fallback in the font stack.
const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700", "800"],
});

// Cinzel — classical serif for brand headings (Latin only; Thai falls back to Noto Thai).
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description"), type: "website" },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale as Locale);

  return (
    <html lang={locale} className={`${jakarta.variable} ${notoThai.variable} ${cinzel.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
            <XPToastProvider />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
