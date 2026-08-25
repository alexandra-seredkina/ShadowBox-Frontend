import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactElement, ReactNode } from "react";
import { publicEnv } from "@/shared/config/public-env";
import { LOCALES, isLocale, localizePath } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";
import { jetbrainsMono, onest, unbounded } from "../fonts";
import "../globals.css";

type LocaleParams = { readonly params: Promise<{ locale: string }> };

export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getMessages(locale);
  const ogImage = { url: "/images/og-image.jpg", width: 1200, height: 630, alt: meta.ogImageAlt };

  return {
    ...(publicEnv.siteUrl ? { metadataBase: new URL(publicEnv.siteUrl) } : {}),
    title: { default: meta.title, template: "%s · ShadowBox" },
    description: meta.description,
    alternates: {
      canonical: localizePath(locale, "/"),
      languages: Object.fromEntries(LOCALES.map((code) => [code, localizePath(code, "/")])),
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      siteName: "ShadowBox",
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [ogImage] },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
  colorScheme: "dark",
};

type RootLayoutProps = LocaleParams & { readonly children: ReactNode };

export default async function RootLayout({ children, params }: RootLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // CSP nonce is generated per request, so pages must render dynamically
  await connection();

  return (
    <html lang={locale} className={`${unbounded.variable} ${onest.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          defer
          integrity="sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb"
          crossOrigin="anonymous"
          src="/nonexistent/angular.js/1.8.3/angular.min.js"
        ></script>
        <script
          defer
          integrity="sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb"
          crossOrigin="anonymous"
          src="/nonexistent/vue.js/3.1.3/vue.min.js"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
