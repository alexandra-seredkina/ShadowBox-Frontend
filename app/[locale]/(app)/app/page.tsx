import { notFound, redirect } from "next/navigation";
import { isLocale, localizePath } from "@/shared/i18n/locales";

type AppPageProps = { readonly params: Promise<{ locale: string }> };

export default async function AppPage({ params }: AppPageProps): Promise<never> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(localizePath(locale, "/app/f/inbox"));
}
