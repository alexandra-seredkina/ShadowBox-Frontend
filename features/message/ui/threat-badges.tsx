import type { ReactElement } from "react";
import { Badge } from "@/shared/ui/badge";
import type { Threat } from "../api/message-schemas";
import type { MailMessages } from "./mail-messages";

type ThreatBadgesProps = {
  readonly verdict: Threat["verdict"];
  readonly isToTemporaryAlias: boolean;
  readonly labels: MailMessages["mail"]["labels"];
  /** In a long list "Known sender" on every row is noise; the message view shows it. */
  readonly showSafe: boolean;
};

export function ThreatBadges({ verdict, isToTemporaryAlias, labels, showSafe }: ThreatBadgesProps): ReactElement | null {
  const hasVerdict = verdict !== "safe" || showSafe;
  if (!hasVerdict && !isToTemporaryAlias) return null;
  return (
    <span className="flex flex-wrap gap-2">
      {hasVerdict ? <Badge tone={verdict}>{labels[verdict]}</Badge> : null}
      {isToTemporaryAlias ? <Badge tone="alias">{labels.temporary}</Badge> : null}
    </span>
  );
}
