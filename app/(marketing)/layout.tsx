import type { ReactElement, ReactNode } from "react";
import { SiteFooter } from "@/features/landing/ui/site-footer";
import { SiteHeader } from "@/features/landing/ui/site-header";

export default function MarketingLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <>
      <SiteHeader />
      <main id="content">{children}</main>
      <SiteFooter />
    </>
  );
}
