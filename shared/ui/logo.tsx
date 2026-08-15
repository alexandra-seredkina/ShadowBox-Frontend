import Image from "next/image";
import type { ReactElement } from "react";

const LOGO_WIDTH = 578;
const LOGO_HEIGHT = 344;

// Mark height never goes below 28 px: smaller, the shadow pixels merge.
// Wordmark cap height is about half the mark height.
const SIZES = {
  md: { height: 32, wordmark: "text-xl", gap: "gap-1.5" },
  lg: { height: 56, wordmark: "text-4xl", gap: "gap-3" },
} as const;

type LogoProps = {
  readonly size?: keyof typeof SIZES;
  readonly variant?: "full" | "mark";
};

/** Keep at least a quarter of the mark height free around the logo. */
export function Logo({ size = "md", variant = "full" }: LogoProps): ReactElement {
  const { height, wordmark, gap } = SIZES[size];
  const width = Math.round((height * LOGO_WIDTH) / LOGO_HEIGHT);
  const isFull = variant === "full";

  return (
    <span className={`inline-flex items-center ${gap}`}>
      <Image src="/brand/logo-dark.png" alt={isFull ? "" : "ShadowBox"} width={width} height={height} />
      {isFull ? (
        <span className={`font-display leading-none font-medium tracking-tight text-paper ${wordmark}`}>ShadowBox</span>
      ) : null}
    </span>
  );
}
