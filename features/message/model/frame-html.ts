import DOMPurify from "dompurify";
import { asciiHost, isSameSite, webHost } from "./mail-links";

/** Mail may style itself, but nothing reaches the network: no scripts, no remote images or fonts. */
const FRAME_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'";

const ALLOWED_TAGS = [
  "a", "abbr", "b", "big", "blockquote", "br", "caption", "center", "cite", "code", "col", "colgroup", "dd", "del",
  "div", "dl", "dt", "em", "font", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "li", "ol", "p",
  "pre", "q", "s", "small", "span", "strike", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead",
  "tr", "u", "ul",
];

const ALLOWED_ATTR = [
  "align", "alt", "bgcolor", "border", "cellpadding", "cellspacing", "color", "colspan", "dir", "height", "href", "lang",
  "rowspan", "src", "style", "title", "valign", "width",
];

const FRAME_STYLE = `
  html { color-scheme: light; }
  body { margin: 0; padding: 20px 24px; background: #f5f5f7; color: #14171b; overflow-wrap: anywhere;
    font: 15px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  a { color: #c21f37; }
  a:not([href]) { color: inherit; text-decoration: underline dotted; cursor: not-allowed; }
  img { max-width: 100%; height: auto; }
  table { max-width: 100%; }
  blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid #b8bac4; color: #4a4d57; }
  pre { white-space: pre-wrap; }
  .sb-host { display: inline-block; margin-left: 4px; padding: 0 5px; border-radius: 4px; vertical-align: 1px;
    background: #e3e4e8; color: #4a4d57; font: 600 11px/18px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-decoration: none; white-space: nowrap; }
  .sb-host.sb-mismatch { background: #c21f37; color: #fff; }
`;

export type PreparedFrame = {
  readonly srcdoc: string;
  /** Every link as the HTML shows it, before any was switched off. */
  readonly links: readonly { readonly href: string; readonly text: string }[];
  readonly hiddenImages: number;
  /** A guess from the amount of text: the frame cannot be measured without letting it run scripts. */
  readonly estimatedHeight: number;
};

/** Marks a link with the host it opens, in red when its text names another site. */
function annotateLink(anchor: HTMLAnchorElement, document: Document): void {
  const host = webHost(anchor.getAttribute("href") ?? "");
  if (host === null) {
    anchor.removeAttribute("href");
    return;
  }
  const shown = (anchor.textContent ?? "").match(/(?:[\p{L}\p{N}-]+\.)+\p{L}{2,63}/gu) ?? [];
  const isMismatch = shown.map(asciiHost).some((name) => name !== null && !isSameSite(name, host));
  const tag = document.createElement("span");
  tag.className = isMismatch ? "sb-host sb-mismatch" : "sb-host";
  tag.textContent = `${isMismatch ? "⚠ " : "↗ "}${host}`;
  anchor.after(tag);
}

function estimateHeight(body: HTMLElement): number {
  const textLength = (body.textContent ?? "").replace(/\s+/gu, " ").length;
  const blocks = body.querySelectorAll("p, div, tr, li, h1, h2, h3, br, hr, blockquote").length;
  const estimate = 56 + Math.ceil(textLength / 72) * 24 + blocks * 10;
  return Math.min(Math.max(estimate, 140), 1600);
}

/**
 * Sanitizes HTML mail for the sandboxed frame. When the message looks dangerous every link is
 * switched off inside the frame; it can still be opened from the link list, after a warning.
 */
export function prepareFrame(html: string, options: { readonly areLinksDisabled: boolean }): PreparedFrame {
  const root = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: true,
  });
  // DOMPurify hands back the body of a detached document: nothing in it has loaded or run.
  if (!(root instanceof HTMLElement)) throw new Error("DOMPurify returned no element");
  const body = root;
  const document = body.ownerDocument;

  let hiddenImages = 0;
  for (const image of Array.from(body.querySelectorAll("img"))) {
    if (!(image.getAttribute("src") ?? "").startsWith("data:image/")) {
      image.remove();
      hiddenImages += 1;
    }
  }

  const links: { href: string; text: string }[] = [];
  for (const anchor of Array.from(body.querySelectorAll("a"))) {
    links.push({ href: anchor.getAttribute("href") ?? "", text: anchor.textContent ?? "" });
    annotateLink(anchor, document);
    if (options.areLinksDisabled) {
      anchor.removeAttribute("href");
    } else if (anchor.hasAttribute("href")) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  }

  const srcdoc = [
    "<!doctype html><html><head><meta charset=\"utf-8\">",
    `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}">`,
    "<meta name=\"referrer\" content=\"no-referrer\">",
    `<style>${FRAME_STYLE}</style></head><body>`,
    body.innerHTML,
    "</body></html>",
  ].join("");
  return { srcdoc, links, hiddenImages, estimatedHeight: estimateHeight(body) };
}
