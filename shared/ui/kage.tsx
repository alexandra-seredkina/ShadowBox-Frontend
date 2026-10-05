import Image from "next/image";
import type { ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

/** Sticker sizes as shipped in `public/stickers/`. */
const STICKERS = {
  "empty-inbox": { width: 192, height: 250 },
  "no-spam": { width: 216, height: 244 },
  "empty-trash": { width: 152, height: 248 },
  starred: { width: 165, height: 240 },
  reading: { width: 168, height: 248 },
  search: { width: 130, height: 242 },
  unlock: { width: 179, height: 233 },
  recovery: { width: 191, height: 224 },
  "first-address": { width: 207, height: 250 },
  lost: { width: 243, height: 234 },
} as const;

export type KageMood = keyof typeof STICKERS;

/** Kage, the mascot, as a small sticker. Decorative: the text next to it says the same. */
export function Kage({ mood, className }: { readonly mood: KageMood; readonly className?: string }): ReactElement {
  const { width, height } = STICKERS[mood];
  return (
    <Image
      src={`/stickers/kage-${mood}.webp`}
      width={width}
      height={height}
      alt=""
      aria-hidden
      draggable={false}
      className={joinClassNames("h-28 w-auto select-none", className)}
    />
  );
}
