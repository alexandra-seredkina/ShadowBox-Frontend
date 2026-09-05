import type { ReactElement } from "react";
import { Progress } from "@/shared/ui/progress";

type PowProgressProps = {
  readonly value: number;
  readonly label: string;
  readonly text: string;
};

export function PowProgress({ value, label, text }: PowProgressProps): ReactElement {
  return (
    <div className="grid gap-3" aria-live="polite">
      <p className="text-sm text-steel">{text}</p>
      <Progress value={value} label={label} />
    </div>
  );
}
