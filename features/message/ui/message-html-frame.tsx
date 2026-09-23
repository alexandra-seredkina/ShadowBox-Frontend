"use client";

import DOMPurify from "dompurify";
import { useMemo, type ReactElement } from "react";

type MessageHtmlFrameProps = {
  readonly html: string;
};

/**
 * Safely render HTML mail: DOMPurify strips scripts/event-handlers, iframe sandbox
 * prevents allow-scripts/allow-same-origin, CSP in srcdoc blocks external images (MVP).
 */
export function MessageHtmlFrame({ html }: MessageHtmlFrameProps): ReactElement {
  const clean = useMemo(() => DOMPurify.sanitize(html, { ALLOWED_TAGS: ["p", "br", "b", "i", "u", "strong", "em", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "div", "span", "table", "thead", "tbody", "tr", "td", "th", "blockquote", "pre", "code", "hr", "form"], ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "width", "height", "style"] }), [html]);

  const srcdoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #14171b;
      background: #f5f5f7;
      padding: 1rem;
    }
    img {
      display: none !important;
    }
    a {
      color: #e8334a;
      text-decoration: underline;
    }
    blockquote {
      border-left: 4px solid #b8bac4;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #666;
    }
    pre {
      background: #f0f0f0;
      padding: 1rem;
      overflow: auto;
      border-radius: 4px;
      font-family: 'Monaco', monospace;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table td, table th {
      border: 1px solid #ddd;
      padding: 0.5rem;
    }
  </style>
</head>
<body>
  ${clean}
</body>
</html>
  `.trim();

  return (
    <iframe
      srcDoc={srcdoc}
      sandbox=""
      title="Message body"
      className="w-full border-0 rounded"
      style={{ minHeight: "400px" }}
    />
  );
}
