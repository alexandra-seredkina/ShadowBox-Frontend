import type { ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { ShieldAlertIcon } from "@/shared/ui/icons";
import type { Threat } from "../api/message-schemas";

type ThreatBannerProps = {
  readonly threat: Threat;
  /** The sender's domain, named in the explanations. */
  readonly domain: string;
  readonly messages: Messages["mailbox"]["view"];
};

/** The verdict in words, right above the message: a badge in the list is easy to miss. */
export function ThreatBanner({ threat, domain, messages }: ThreatBannerProps): ReactElement | null {
  if (threat.verdict === "safe") return null;
  const reasons = threat.markers.map((marker) => formatMessage(messages.markers[marker], { domain: domain || "?" }));

  if (threat.verdict === "caution") {
    return (
      <section role="note" className="flex gap-3 rounded-card border border-warn/40 bg-warn/[0.06] px-4 py-3">
        <ShieldAlertIcon className="mt-0.5 size-5 text-warn" />
        <div className="grid gap-0.5">
          <h2 className="text-sm font-semibold text-warn">{messages.caution.title}</h2>
          <p className="text-sm text-steel">{messages.caution.text}</p>
        </div>
      </section>
    );
  }
  return (
    <section role="alert" className="grid gap-3 rounded-card border border-red bg-wine px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-control bg-red text-night">
          <ShieldAlertIcon className="size-5" />
        </span>
        <div className="grid gap-1">
          <h2 className="font-display text-base font-medium text-paper">{messages.danger.title}</h2>
          <p className="text-sm text-steel">{messages.danger.text}</p>
        </div>
      </div>
      <ul className="grid gap-1.5 border-t border-red/30 pt-3">
        {reasons.map((reason) => (
          <li key={reason} className="flex gap-2 text-sm text-paper">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-red-soft" />
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
