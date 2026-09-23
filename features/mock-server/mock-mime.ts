const CRLF = "\r\n";
const BASE64_LINE_LENGTH = 76;

export type MimeAttachment = {
  readonly filename: string;
  readonly contentType: string;
  readonly content: Uint8Array;
};

export type MimeDraft = {
  readonly from: { readonly name: string; readonly address: string };
  readonly to: string;
  readonly subject: string;
  readonly date: Date;
  readonly text: string;
  readonly html: string | null;
  readonly attachments: readonly MimeAttachment[];
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function wrapBase64(bytes: Uint8Array): string {
  return (toBase64(bytes).match(new RegExp(`.{1,${BASE64_LINE_LENGTH}}`, "g")) ?? []).join(CRLF);
}

/** RFC 2047 encoded word for anything that is not plain printable ASCII. */
function encodeHeaderText(text: string): string {
  return /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${toBase64(new TextEncoder().encode(text))}?=`;
}

function newBoundary(): string {
  return `=_${crypto.randomUUID()}`;
}

function textPart(contentType: string, text: string): string {
  return [
    `Content-Type: ${contentType}; charset=utf-8`,
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(new TextEncoder().encode(text)),
  ].join(CRLF);
}

function attachmentPart(attachment: MimeAttachment): string {
  const filename = encodeHeaderText(attachment.filename);
  return [
    `Content-Type: ${attachment.contentType}; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(attachment.content),
  ].join(CRLF);
}

function multipart(subtype: string, parts: readonly string[]): string {
  const boundary = newBoundary();
  return [
    `Content-Type: multipart/${subtype}; boundary="${boundary}"`,
    "",
    ...parts.map((part) => `--${boundary}${CRLF}${part}`),
    `--${boundary}--`,
    "",
  ].join(CRLF);
}

function bodyPart(draft: MimeDraft): string {
  const plain = textPart("text/plain", draft.text);
  return draft.html === null ? plain : multipart("alternative", [plain, textPart("text/html", draft.html)]);
}

/** The raw RFC 5322 message a sender's MTA would hand over, as the mock server receives it. */
export function buildMime(draft: MimeDraft): string {
  const body = bodyPart(draft);
  const content = draft.attachments.length === 0 ? body : multipart("mixed", [body, ...draft.attachments.map(attachmentPart)]);
  const headers = [
    `From: "${encodeHeaderText(draft.from.name)}" <${draft.from.address}>`,
    `To: <${draft.to}>`,
    `Subject: ${encodeHeaderText(draft.subject)}`,
    `Date: ${draft.date.toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@mock.invalid>`,
    "MIME-Version: 1.0",
  ];
  return [...headers, content].join(CRLF);
}
