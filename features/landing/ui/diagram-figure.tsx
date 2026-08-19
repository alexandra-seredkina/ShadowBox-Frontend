import Image from "next/image";
import type { ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

type DiagramFigureProps = {
  readonly className?: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly sizes: string;
};

/** Diagrams are drawn on paper; the same explanation is always present as text next to them. */
export function DiagramFigure({ src, width, height, alt, sizes, className }: DiagramFigureProps): ReactElement {
  return (
    <figure className={joinClassNames("overflow-hidden rounded-card border border-line bg-paper", className)}>
      <Image src={src} width={width} height={height} alt={alt} sizes={sizes} className="h-auto w-full" />
    </figure>
  );
}
