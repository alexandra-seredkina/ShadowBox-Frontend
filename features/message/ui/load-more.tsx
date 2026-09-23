"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type LoadMoreProps = {
  readonly isLoading: boolean;
  readonly labels: { readonly loadMore: string; readonly loadingMore: string; readonly loading: string };
  readonly onLoadMore: () => void;
};

/** Loads the next page when it scrolls into view; the button does the same for keyboards and old browsers. */
export function LoadMore({ isLoading, labels, onLoadMore }: LoadMoreProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return (
    <div ref={ref} className="flex justify-center py-6">
      {isLoading ? (
        <p className="flex items-center gap-3 text-sm text-steel">
          <Spinner label={labels.loading} />
          {labels.loadingMore}
        </p>
      ) : (
        <Button variant="ghost" onClick={onLoadMore}>
          {labels.loadMore}
        </Button>
      )}
    </div>
  );
}
