import type { ReactElement, ReactNode } from "react";

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly illustration?: ReactNode;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, illustration, action }: EmptyStateProps): ReactElement {
  return (
    <div className="mx-auto grid max-w-sm justify-items-center gap-3 px-4 py-12 text-center">
      {illustration}
      <h2 className="font-display text-lg font-medium">{title}</h2>
      {description ? <p className="text-sm text-steel">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
