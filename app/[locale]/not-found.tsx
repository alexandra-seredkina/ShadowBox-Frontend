import type { ReactElement } from "react";
import { EmptyState } from "@/shared/ui/empty-state";

// Next.js passes no params to not-found, so the page speaks all three languages at once.
export default function NotFound(): ReactElement {
  return (
    <main className="grid min-h-dvh place-items-center">
      <EmptyState title="404" description="Страница не найдена · Page not found · Seite nicht gefunden" />
    </main>
  );
}
