"use client";

import type { ReactElement } from "react";
import type { Threat } from "../api/message-schemas";

type MessageAuthProps = {
  readonly threat: Threat;
  readonly labels: {
    readonly pass: string;
    readonly fail: string;
    readonly none: string;
    readonly spf: string;
    readonly dkim: string;
    readonly dmarc: string;
  };
};

/** Human-readable SPF/DKIM/DMARC auth results: pass (✓), fail (✗), none (–). */
export function MessageAuth({ threat, labels }: MessageAuthProps): ReactElement {
  const { spf, dkim, dmarc } = threat.auth;
  const icon = (result: "pass" | "fail" | "none") => {
    if (result === "pass") return "✓";
    if (result === "fail") return "✗";
    return "–";
  };
  const color = (result: "pass" | "fail" | "none") => {
    if (result === "pass") return "text-safe";
    if (result === "fail") return "text-red";
    return "text-fog";
  };
  const label = (result: "pass" | "fail" | "none") => {
    if (result === "pass") return labels.pass;
    if (result === "fail") return labels.fail;
    return labels.none;
  };

  return (
    <div className="flex gap-6 text-sm text-steel">
      <div>
        <div className={`font-mono font-semibold ${color(spf)}`}>
          {icon(spf)} {labels.spf}
        </div>
        <div className="text-xs text-fog">{label(spf)}</div>
      </div>
      <div>
        <div className={`font-mono font-semibold ${color(dkim)}`}>
          {icon(dkim)} {labels.dkim}
        </div>
        <div className="text-xs text-fog">{label(dkim)}</div>
      </div>
      <div>
        <div className={`font-mono font-semibold ${color(dmarc)}`}>
          {icon(dmarc)} {labels.dmarc}
        </div>
        <div className="text-xs text-fog">{label(dmarc)}</div>
      </div>
    </div>
  );
}
