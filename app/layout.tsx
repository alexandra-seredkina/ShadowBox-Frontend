import type { Metadata } from "next";
import { connection } from "next/server";
import { jetbrainsMono, onest, unbounded } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadowBox",
  description: "Анонимная и безопасная электронная почта",
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
