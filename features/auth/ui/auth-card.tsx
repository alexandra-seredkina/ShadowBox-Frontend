import type { ReactElement, ReactNode } from "react";
import { joinClassNames } from "@/shared/lib/class-names";
import { Card } from "@/shared/ui/card";

type AuthCardProps = {
  readonly title: string;
  readonly lede?: string;
  /** Above the title, e.g. the step indicator. */
  readonly header?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  /** A sticker peeking over the card's top edge. */
  readonly mascot?: ReactNode;
};

export function AuthCard({ title, lede, header, children, footer, mascot }: AuthCardProps): ReactElement {
  return (
    <div className={joinClassNames("mx-auto grid w-full max-w-md gap-6", mascot ? "mt-20" : null)}>
      <Card className="relative grid gap-6 p-6 sm:p-8">
        {mascot ? <div className="pointer-events-none absolute right-6 bottom-full -mb-2">{mascot}</div> : null}
        {header}
        <div className="grid gap-2">
          <h1 className="font-display text-2xl font-medium text-balance">{title}</h1>
          {lede ? <p className="text-steel">{lede}</p> : null}
        </div>
        {children}
      </Card>
      {footer ? <div className="text-center text-sm text-fog">{footer}</div> : null}
    </div>
  );
}
