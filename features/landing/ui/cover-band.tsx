import Image from "next/image";
import type { ReactElement, ReactNode } from "react";
import { Container } from "@/shared/ui/container";

type CoverImage = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
};

type CoverBandProps = {
  readonly image: CoverImage;
  /** Heading shown over the art. */
  readonly children: ReactNode;
  /** Content pulled up into the faded bottom of the art, so there is no gap after it. */
  readonly details: ReactNode;
};

/**
 * Key visual shown whole, never cropped, with edges fading into the page.
 * On wide screens the text sits over the dark left part of the art.
 */
export function CoverBand({ image, children, details }: CoverBandProps): ReactElement {
  return (
    <>
      <div className="relative mx-auto max-w-7xl">
        <div className="relative">
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="h-auto w-full"
          />
          <div aria-hidden className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-night to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-night from-15% via-night/70 to-transparent" />
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/12 bg-linear-to-l from-night to-transparent" />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 hidden w-3/5 bg-linear-to-r from-night via-night/80 to-transparent lg:block"
          />
        </div>
        <div className="relative -mt-10 lg:absolute lg:inset-0 lg:mt-0 lg:flex lg:items-center">
          <Container>
            <div className="max-w-md">{children}</div>
          </Container>
        </div>
      </div>
      <Container className="relative mt-10 lg:-mt-36">{details}</Container>
    </>
  );
}
