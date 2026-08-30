import type { ReactElement, ReactNode } from "react";

type SectionHeadingProps = {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly children?: ReactNode;
};

export function SectionHeading({ id, eyebrow, title, children }: SectionHeadingProps): ReactElement {
  return (
    <div className="grid max-w-2xl gap-3">
      <p className="font-mono text-xs tracking-[0.12em] text-red-soft uppercase">{eyebrow}</p>
      <h2 id={id} className="font-display text-2xl leading-tight font-medium text-balance sm:text-4xl">
        {title}
      </h2>
      {children ? <div className="text-lg text-steel">{children}</div> : null}
    </div>
  );
}
