import type { ReactElement } from "react";

type MessageHtmlFrameProps = {
  readonly srcdoc: string;
  readonly height: number;
  readonly title: string;
  /** With links off nothing can leave the frame, not even a new tab. */
  readonly areLinksDisabled: boolean;
};

/**
 * The only place HTML mail is rendered: already sanitized, in a sandbox without scripts and
 * without its own origin, under a CSP that keeps it off the network.
 */
export function MessageHtmlFrame({ srcdoc, height, title, areLinksDisabled }: MessageHtmlFrameProps): ReactElement {
  return (
    <iframe
      srcDoc={srcdoc}
      sandbox={areLinksDisabled ? "" : "allow-popups allow-popups-to-escape-sandbox"}
      referrerPolicy="no-referrer"
      title={title}
      style={{ height: `${height}px` }}
      className="block w-full rounded-card border-0 bg-paper"
    />
  );
}
