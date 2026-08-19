import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { publicEnv } from "@/shared/config/public-env";
import { jetbrainsMono, onest, unbounded } from "./fonts";
import "./globals.css";

const DESCRIPTION =
  "Почта без телефона и имени: отдельный адрес для каждого сайта, письма шифруются при получении и читаются только в твоём браузере.";

const OG_IMAGE = {
  url: "/images/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "ShadowBox — анонимная зашифрованная почта",
};

export const metadata: Metadata = {
  ...(publicEnv.siteUrl ? { metadataBase: new URL(publicEnv.siteUrl) } : {}),
  title: { default: "ShadowBox — анонимная зашифрованная почта", template: "%s · ShadowBox" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ShadowBox",
    title: "ShadowBox — анонимная зашифрованная почта",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShadowBox — анонимная зашифрованная почта",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CSP nonce is generated per request, so pages must render dynamically
  await connection();

  return (
    <html
      lang="ru"
      className={`${unbounded.variable} ${onest.variable} ${jetbrainsMono.variable}`}
    >
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
