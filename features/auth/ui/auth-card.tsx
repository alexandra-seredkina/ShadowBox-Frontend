import type { ReactElement, ReactNode } from "react";
import { Card } from "@/shared/ui/card";

type AuthCardProps = {
  readonly title: string;
  readonly lede?: string;
  /** Above the title, e.g. the step indicator. */
  readonly header?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
};

export function AuthCard({ title, lede, header, children, footer }: AuthCardProps): ReactElement {
  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <Card className="grid gap-6 p-6 sm:p-8">
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
